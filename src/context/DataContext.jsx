import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isSameMonth } from "../util/dateUtils";

const DataContext = createContext(null);

/* ------------------------------------------------------------------ */
/* Fallback in-browser API (used only when running `npm run dev`      */
/* outside Electron, e.g. for quick UI iteration in a normal browser) */
/* ------------------------------------------------------------------ */

const FALLBACK_KEY = "finest-fallback-db";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function defaultData() {
  return {
    categories: [
      { id: uid(), name: "Stipendio", type: "income", icon: "briefcase" },
      { id: uid(), name: "Regali", type: "income", icon: "gift" },
      { id: uid(), name: "Alimentari", type: "expense", icon: "shopping-cart" },
      { id: uid(), name: "Utenze", type: "expense", icon: "zap" },
      { id: uid(), name: "Trasporti", type: "expense", icon: "car" },
      { id: uid(), name: "Svago", type: "expense", icon: "film" },
      { id: uid(), name: "Fondo emergenza", type: "saving", icon: "piggy-bank" },
    ],
    transactions: [],
    goals: [],
    subscriptions: [],
  };
}

function createFallbackApi() {
  function read() {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) {
      const data = defaultData();
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(data));
      return data;
    }
    return JSON.parse(raw);
  }
  function write(db) {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(db));
    return db;
  }

  return {
    getAll: async () => read(),
    addCategory: async (category) => {
      const db = read();
      db.categories.push({ id: uid(), ...category });
      return write(db);
    },
    updateCategory: async (id, patch) => {
      const db = read();
      db.categories = db.categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
      return write(db);
    },
    deleteCategory: async (id) => {
      const db = read();
      db.categories = db.categories.filter((c) => c.id !== id);
      return write(db);
    },
    addTransaction: async (tx) => {
      const db = read();
      db.transactions.push({ id: uid(), ...tx });
      return write(db);
    },
    updateTransaction: async (id, patch) => {
      const db = read();
      db.transactions = db.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
      return write(db);
    },
    deleteTransaction: async (id) => {
      const db = read();
      db.transactions = db.transactions.filter((t) => t.id !== id);
      return write(db);
    },
    addGoal: async (goal) => {
      const db = read();
      db.goals.push({ id: uid(), manualAmount: 0, ...goal });
      return write(db);
    },
    updateGoal: async (id, patch) => {
      const db = read();
      db.goals = db.goals.map((g) => (g.id === id ? { ...g, ...patch } : g));
      return write(db);
    },
    deleteGoal: async (id) => {
      const db = read();
      db.goals = db.goals.filter((g) => g.id !== id);
      return write(db);
    },
    contributeGoal: async (id, amount) => {
      const db = read();
      db.goals = db.goals.map((g) =>
        g.id === id ? { ...g, manualAmount: (g.manualAmount || 0) + amount } : g
      );
      return write(db);
    },
    addSubscription: async (sub) => {
      const db = read();
      db.subscriptions = db.subscriptions || [];
      db.subscriptions.push({ id: uid(), ...sub });
      return write(db);
    },
    updateSubscription: async (id, patch) => {
      const db = read();
      db.subscriptions = (db.subscriptions || []).map((s) => (s.id === id ? { ...s, ...patch } : s));
      return write(db);
    },
    deleteSubscription: async (id) => {
      const db = read();
      db.subscriptions = (db.subscriptions || []).filter((s) => s.id !== id);
      return write(db);
    },
  };
}

const api = window.api || createFallbackApi();
export const isDesktop = !!window.api;

/* ------------------------------------------------------------------ */

export function DataProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const applyDb = (db) => {
    setCategories(db.categories || []);
    setTransactions(db.transactions || []);
    setGoals(db.goals || []);
    setSubscriptions(db.subscriptions || []);
  };

  useEffect(() => {
    api.getAll().then((db) => {
      applyDb(db);
      setLoading(false);
    });
  }, []);

  /* --------------------------- Categories --------------------------- */
  const addCategory = useCallback((category) => api.addCategory(category).then(applyDb), []);
  const updateCategory = useCallback((id, patch) => api.updateCategory(id, patch).then(applyDb), []);
  const deleteCategory = useCallback((id) => api.deleteCategory(id).then(applyDb), []);

  /* -------------------------- Transactions --------------------------- */
  const addTransaction = useCallback((tx) => api.addTransaction(tx).then(applyDb), []);
  const updateTransaction = useCallback((id, patch) => api.updateTransaction(id, patch).then(applyDb), []);
  const deleteTransaction = useCallback((id) => api.deleteTransaction(id).then(applyDb), []);

  /* ------------------------------ Goals ------------------------------ */
  const addGoal = useCallback((goal) => api.addGoal(goal).then(applyDb), []);
  const updateGoal = useCallback((id, patch) => api.updateGoal(id, patch).then(applyDb), []);
  const deleteGoal = useCallback((id) => api.deleteGoal(id).then(applyDb), []);
  const contributeGoal = useCallback((id, amount) => api.contributeGoal(id, amount).then(applyDb), []);

  /* -------------------------- Subscriptions -------------------------- */
  const addSubscription = useCallback((sub) => api.addSubscription(sub).then(applyDb), []);
  const updateSubscription = useCallback((id, patch) => api.updateSubscription(id, patch).then(applyDb), []);
  const deleteSubscription = useCallback((id) => api.deleteSubscription(id).then(applyDb), []);

  /* --------------------------- Derived data --------------------------- */

  const getCategoryById = useCallback(
    (id) => categories.find((c) => c.id === id) || null,
    [categories]
  );

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let saving = 0;
    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expense += t.amount;
      else if (t.type === "saving") saving += t.amount;
    });
    return {
      income,
      expense,
      saving,
      netWorth: income - expense + saving,
    };
  }, [transactions]);

  const monthTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let saving = 0;
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
        const sum = filtered.reduce((acc, t) => acc + t.amount, 0);
        return sum;
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
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeGoal,
    addSubscription,
    updateSubscription,
    deleteSubscription,
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
