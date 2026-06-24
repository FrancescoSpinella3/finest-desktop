const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const v = require("./validate.cjs");

let dbPath = null;
let db = null;

const defaultData = () => ({
  categories: [
    { id: uid(), name: "Stipendio", type: "income", icon: "briefcase" },
    { id: uid(), name: "Regali", type: "income", icon: "gift" },
    { id: uid(), name: "Altre entrate", type: "income", icon: "plus-circle" },
    { id: uid(), name: "Alimentari", type: "expense", icon: "shopping-cart" },
    { id: uid(), name: "Utenze", type: "expense", icon: "zap" },
    { id: uid(), name: "Trasporti", type: "expense", icon: "car" },
    { id: uid(), name: "Svago", type: "expense", icon: "film" },
    { id: uid(), name: "Casa", type: "expense", icon: "home" },
    { id: uid(), name: "Salute", type: "expense", icon: "heart-pulse" },
    { id: uid(), name: "Fondo emergenza", type: "saving", icon: "piggy-bank" },
  ],
  transactions: [],
  goals: [],
});

function uid() {
  return crypto.randomUUID();
}

function init() {
  const userDataPath = app.getPath("userData");
  if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });
  dbPath = path.join(userDataPath, "finest-data.json");

  if (fs.existsSync(dbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch (err) {
      console.error("Errore lettura database, ricreo con dati di default:", err);
      db = defaultData();
      persist();
    }
  } else {
    db = defaultData();
    persist();
  }

  // Safety: ensure all expected keys exist (e.g. after app updates)
  db.categories = db.categories || [];
  db.transactions = db.transactions || [];
  db.goals = db.goals || [];
  db.subscriptions = db.subscriptions || [];
}

function persist() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

function getAll() {
  return db;
}

/* ----------------------------- Categories ----------------------------- */

function addCategory(category) {
  const newCategory = { id: uid(), ...v.category(category) };
  db.categories.push(newCategory);
  persist();
  return db;
}

function updateCategory(id, patch) {
  const safeId = v.id(id);
  const safePatch = v.categoryPatch(patch);
  db.categories = db.categories.map((c) => (c.id === safeId ? { ...c, ...safePatch } : c));
  persist();
  return db;
}

function deleteCategory(id) {
  const safeId = v.id(id);
  db.categories = db.categories.filter((c) => c.id !== safeId);
  // Orphan transactions/goals keep the categoryId; the UI labels them as "Categoria eliminata"
  persist();
  return db;
}

/* ---------------------------- Transactions ----------------------------- */

function addTransaction(tx) {
  const newTx = { id: uid(), ...v.transaction(tx) };
  db.transactions.push(newTx);
  persist();
  return db;
}

function updateTransaction(id, patch) {
  const safeId = v.id(id);
  const safePatch = v.transactionPatch(patch);
  db.transactions = db.transactions.map((t) => (t.id === safeId ? { ...t, ...safePatch } : t));
  persist();
  return db;
}

function deleteTransaction(id) {
  const safeId = v.id(id);
  db.transactions = db.transactions.filter((t) => t.id !== safeId);
  persist();
  return db;
}

/* -------------------------------- Goals --------------------------------- */

function addGoal(goal) {
  const newGoal = { id: uid(), manualAmount: 0, ...v.goal(goal) };
  db.goals.push(newGoal);
  persist();
  return db;
}

function updateGoal(id, patch) {
  const safeId = v.id(id);
  const safePatch = v.goalPatch(patch);
  db.goals = db.goals.map((g) => (g.id === safeId ? { ...g, ...safePatch } : g));
  persist();
  return db;
}

function deleteGoal(id) {
  const safeId = v.id(id);
  db.goals = db.goals.filter((g) => g.id !== safeId);
  persist();
  return db;
}

function contributeGoal(id, amount) {
  const safeId = v.id(id);
  const safeAmount = v.contributeAmount(amount);
  db.goals = db.goals.map((g) =>
    g.id === safeId ? { ...g, manualAmount: (g.manualAmount || 0) + safeAmount } : g
  );
  persist();
  return db;
}

/* -------------------------- Auto Renewals ------------------------------- */

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

function processRenewals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let created = 0;

  for (const sub of db.subscriptions) {
    if (!sub.cost || !sub.categoryId || !sub.lastRenewal) continue;

    const startDate = sub.lastAutoRenewal || sub.lastRenewal;
    let checkFrom = new Date(startDate);
    checkFrom.setHours(0, 0, 0, 0);

    while (true) {
      const next = nextRenewalAfter(sub.expiryDay, checkFrom);
      if (next > today) break;

      db.transactions.push({
        id: uid(),
        type: "expense",
        description: sub.name,
        amount: sub.cost,
        categoryId: sub.categoryId,
        date: next.toISOString().split("T")[0],
        autoRenewal: true,
      });

      sub.lastAutoRenewal = next.toISOString().split("T")[0];
      checkFrom = next;
      created++;
    }
  }

  if (created > 0) persist();
  return created;
}

/* ----------------------------- Subscriptions ---------------------------- */

function addSubscription(sub) {
  const newSub = { id: uid(), ...v.subscription(sub) };
  db.subscriptions.push(newSub);
  persist();
  return db;
}

function updateSubscription(id, patch) {
  const safeId = v.id(id);
  const safePatch = v.subscriptionPatch(patch);
  db.subscriptions = db.subscriptions.map((s) => (s.id === safeId ? { ...s, ...safePatch } : s));
  persist();
  return db;
}

function deleteSubscription(id) {
  const safeId = v.id(id);
  db.subscriptions = db.subscriptions.filter((s) => s.id !== safeId);
  persist();
  return db;
}

module.exports = {
  init,
  processRenewals,
  getAll,
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
};
