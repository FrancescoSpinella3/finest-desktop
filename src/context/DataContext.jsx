import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { isSameMonth } from "../util/dateUtils";

const DataContext = createContext(null);
export const isDesktop = !!window.api;

const DEFAULT_CATEGORIES = [
  { name: "Stipendio", type: "income", icon: "briefcase" },
  { name: "Regali", type: "income", icon: "gift" },
  { name: "Altre entrate", type: "income", icon: "plus-circle" },
  { name: "Alimentari", type: "expense", icon: "shopping-cart" },
  { name: "Utenze", type: "expense", icon: "zap" },
  { name: "Trasporti", type: "expense", icon: "car" },
  { name: "Svago", type: "expense", icon: "film" },
  { name: "Casa", type: "expense", icon: "home" },
  { name: "Salute", type: "expense", icon: "heart-pulse" },
  { name: "Fondo emergenza", type: "saving", icon: "piggy-bank" },
];

function strip(row) {
  const { userId, ...rest } = row;
  return rest;
}

/* ── Auto-renewal logic (portata da store.cjs) ─────────────────────── */

function clampDay(year, month, day) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

function nextRenewalAfter(day, afterDate) {
  const after = new Date(afterDate);
  after.setHours(0, 0, 0, 0);
  const sameMonth = clampDay(after.getFullYear(), after.getMonth(), day);
  if (sameMonth > after) return sameMonth;
  const nm = after.getMonth() + 1;
  return clampDay(nm > 11 ? after.getFullYear() + 1 : after.getFullYear(), nm % 12, day);
}

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function processRenewals(subs, uid, existingTxs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newTxs = [];
  const subUpdates = [];

  for (const sub of subs) {
    if (!sub.cost || !sub.categoryId || !sub.lastRenewal) continue;
    const startDate = sub.lastAutoRenewal || sub.lastRenewal;
    let checkFrom = new Date(startDate);
    checkFrom.setHours(0, 0, 0, 0);
    let lastAutoRenewal = sub.lastAutoRenewal;

    while (true) {
      const next = nextRenewalAfter(sub.expiryDay, checkFrom);
      if (next > today) break;
      const dateStr = toLocalDateStr(next);
      const alreadyExists =
        existingTxs.some((t) => t.autoRenewal && t.date === dateStr && t.categoryId === sub.categoryId) ||
        newTxs.some((t) => t.date === dateStr && t.categoryId === sub.categoryId);
      if (!alreadyExists) {
        newTxs.push({
          userId: uid, type: "expense", description: sub.name,
          amount: sub.cost, categoryId: sub.categoryId,
          date: dateStr, autoRenewal: true,
        });
      }
      lastAutoRenewal = dateStr;
      checkFrom = next;
    }

    if (lastAutoRenewal !== sub.lastAutoRenewal) {
      subUpdates.push({ id: sub.id, lastAutoRenewal, lastRenewal: lastAutoRenewal });
    } else if (sub.lastAutoRenewal && sub.lastAutoRenewal !== sub.lastRenewal) {
      subUpdates.push({ id: sub.id, lastRenewal: sub.lastAutoRenewal });
    }
  }

  let inserted = [];
  if (newTxs.length > 0) {
    const { data } = await supabase.from("transactions").insert(newTxs).select();
    inserted = (data || []).map(strip);
  }
  for (const { id, ...patch } of subUpdates) {
    await supabase.from("subscriptions").update(patch).eq("id", id);
  }
  return inserted;
}

/* ── Provider ───────────────────────────────────────────────────────── */

export function DataProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.id;

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    setLoading(true);

    (async () => {
      const [cats, txs, goalsRes, subs] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("transactions").select("*").order("date", { ascending: false }),
        supabase.from("goals").select("*"),
        supabase.from("subscriptions").select("*"),
      ]);

      let catsData = (cats.data || []).map(strip);
      if (catsData.length === 0) {
        const { data: inserted } = await supabase
          .from("categories")
          .insert(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: uid })))
          .select();
        catsData = (inserted || []).map(strip);
      }

      const subsData = (subs.data || []).map(strip);
      let existingTxs = (txs.data || []).map(strip);

      // Rimuove i duplicati di autoRenewal già presenti (stessa data + categoria)
      const seen = new Set();
      const duplicateIds = [];
      for (const t of existingTxs) {
        if (!t.autoRenewal) continue;
        const key = `${t.date}|${t.categoryId}`;
        if (seen.has(key)) { duplicateIds.push(t.id); } else { seen.add(key); }
      }
      if (duplicateIds.length > 0) {
        await supabase.from("transactions").delete().in("id", duplicateIds);
        existingTxs = existingTxs.filter((t) => !duplicateIds.includes(t.id));
      }

      const renewedTxs = await processRenewals(subsData, uid, existingTxs);
      const allTxs = [...(txs.data || []).map(strip), ...renewedTxs]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setCategories(catsData);
      setTransactions(allTxs);
      setGoals((goalsRes.data || []).map(strip));
      setSubscriptions(subsData);
      setLoading(false);
    })();
  }, [uid]);

  /* ── Categories ─────────────────────────────────────────────────── */

  const addCategory = useCallback(async (category) => {
    const { data } = await supabase.from("categories").insert({ ...category, userId: uid }).select().single();
    if (data) setCategories((prev) => [...prev, strip(data)]);
  }, [uid]);

  const updateCategory = useCallback(async (id, patch) => {
    const { data } = await supabase.from("categories").update(patch).eq("id", id).select().single();
    if (data) setCategories((prev) => prev.map((c) => (c.id === id ? strip(data) : c)));
  }, []);

  const deleteCategory = useCallback(async (id) => {
    await supabase.from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /* ── Transactions ───────────────────────────────────────────────── */

  const addTransaction = useCallback(async (tx) => {
    const { data } = await supabase.from("transactions").insert({ ...tx, userId: uid }).select().single();
    if (data) setTransactions((prev) => [strip(data), ...prev]);
  }, [uid]);

  const updateTransaction = useCallback(async (id, patch) => {
    const { data } = await supabase.from("transactions").update(patch).eq("id", id).select().single();
    if (data) setTransactions((prev) => prev.map((t) => (t.id === id ? strip(data) : t)));
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Goals ──────────────────────────────────────────────────────── */

  const addGoal = useCallback(async (goal) => {
    const { data, error } = await supabase.from("goals").insert({ ...goal, manualAmount: 0, userId: uid }).select().single();
    if (error) { console.error("addGoal error:", error); throw error; }
    if (data) setGoals((prev) => [...prev, strip(data)]);
  }, [uid]);

  const updateGoal = useCallback(async (id, patch) => {
    const { data } = await supabase.from("goals").update(patch).eq("id", id).select().single();
    if (data) setGoals((prev) => prev.map((g) => (g.id === id ? strip(data) : g)));
  }, []);

  const deleteGoal = useCallback(async (id) => {
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const contributeGoal = useCallback(async (id, amount) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const newAmount = (goal.manualAmount || 0) + amount;
    const { data } = await supabase.from("goals").update({ manualAmount: newAmount }).eq("id", id).select().single();
    if (data) setGoals((prev) => prev.map((g) => (g.id === id ? strip(data) : g)));
  }, [goals]);

  /* ── Subscriptions ──────────────────────────────────────────────── */

  const addSubscription = useCallback(async (sub) => {
    const { data, error } = await supabase.from("subscriptions").insert({ ...sub, userId: uid }).select().single();
    if (error) { console.error("addSubscription error:", error); throw error; }
    if (data) setSubscriptions((prev) => [...prev, strip(data)]);
  }, [uid]);

  const updateSubscription = useCallback(async (id, patch) => {
    const { data } = await supabase.from("subscriptions").update(patch).eq("id", id).select().single();
    if (data) setSubscriptions((prev) => prev.map((s) => (s.id === id ? strip(data) : s)));
  }, []);

  const deleteSubscription = useCallback(async (id) => {
    await supabase.from("subscriptions").delete().eq("id", id);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /* ── Derived ────────────────────────────────────────────────────── */

  const getCategoryById = useCallback(
    (id) => categories.find((c) => c.id === id) || null,
    [categories]
  );

  const totals = useMemo(() => {
    let income = 0, expense = 0, saving = 0;
    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expense += t.amount;
      else if (t.type === "saving") saving += t.amount;
    });
    return { income, expense, saving, netWorth: income - expense + saving };
  }, [transactions]);

  const monthTotals = useMemo(() => {
    let income = 0, expense = 0, saving = 0;
    transactions.filter((t) => isSameMonth(t.date)).forEach((t) => {
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expense += t.amount;
      else if (t.type === "saving") saving += t.amount;
    });
    return { income, expense, saving };
  }, [transactions]);

  const computeGoalProgress = useCallback(
    (goal) => {
      if (goal.categoryId) {
        let filtered = transactions.filter((t) => t.categoryId === goal.categoryId);
        if (goal.period === "mensile") filtered = filtered.filter((t) => isSameMonth(t.date));
        return filtered.reduce((acc, t) => acc + t.amount, 0);
      }
      return goal.manualAmount || 0;
    },
    [transactions]
  );

  const value = {
    loading,
    isDesktop,
    categories,
    transactions,
    goals,
    subscriptions,
    addCategory, updateCategory, deleteCategory,
    addTransaction, updateTransaction, deleteTransaction,
    addGoal, updateGoal, deleteGoal, contributeGoal,
    addSubscription, updateSubscription, deleteSubscription,
    getCategoryById,
    totals,
    monthTotals,
    computeGoalProgress,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
