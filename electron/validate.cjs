"use strict";

const CATEGORY_TYPES   = ["income", "expense", "saving"];
const TRANSACTION_TYPES = ["income", "expense", "saving"];
const GOAL_TYPES       = ["income", "expense_limit", "saving"];
const GOAL_PERIODS     = ["mensile", "totale"];
const ICON_KEYS        = [
  "briefcase", "gift", "plus-circle", "shopping-cart", "zap", "car", "film",
  "home", "heart-pulse", "piggy-bank", "wallet", "credit-card", "smartphone",
  "coffee", "plane", "book", "dumbbell", "shirt", "dog", "graduation-cap", "tag",
];

// ── Primitives ────────────────────────────────────────────────────────────────

function isStr(v, min = 1, max = 200) {
  return typeof v === "string" && v.trim().length >= min && v.length <= max;
}

function isPositiveNum(v) {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function isFiniteNum(v) {
  return typeof v === "number" && Number.isFinite(v);
}

function isDate(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
}

function fail(msg) {
  throw new Error(`Validation: ${msg}`);
}

// ── Validators ────────────────────────────────────────────────────────────────
// Each function returns only the whitelisted fields — unknown keys are dropped.

function id(v) {
  if (!isStr(v, 1, 100)) fail("id non valido");
  return v;
}

// Category

function category(d) {
  if (!isStr(d.name, 1, 100))           fail("name non valido");
  if (!CATEGORY_TYPES.includes(d.type)) fail("type non valido");
  if (!ICON_KEYS.includes(d.icon))      fail("icon non valida");
  return { name: d.name.trim(), type: d.type, icon: d.icon };
}

function categoryPatch(d) {
  const out = {};
  if (d.name !== undefined) {
    if (!isStr(d.name, 1, 100)) fail("name non valido");
    out.name = d.name.trim();
  }
  if (d.type !== undefined) {
    if (!CATEGORY_TYPES.includes(d.type)) fail("type non valido");
    out.type = d.type;
  }
  if (d.icon !== undefined) {
    if (!ICON_KEYS.includes(d.icon)) fail("icon non valida");
    out.icon = d.icon;
  }
  return out;
}

// Transaction

function transaction(d) {
  if (!isStr(d.description, 1, 200))        fail("description non valida");
  if (!isPositiveNum(d.amount))              fail("amount non valido");
  if (!TRANSACTION_TYPES.includes(d.type))  fail("type non valido");
  if (d.categoryId !== null && !isStr(d.categoryId, 1, 100)) fail("categoryId non valido");
  if (!isDate(d.date))                       fail("date non valida");
  return {
    description: d.description.trim(),
    amount:      d.amount,
    type:        d.type,
    categoryId:  d.categoryId || null,
    date:        d.date,
  };
}

function transactionPatch(d) {
  const out = {};
  if (d.description !== undefined) {
    if (!isStr(d.description, 1, 200)) fail("description non valida");
    out.description = d.description.trim();
  }
  if (d.amount !== undefined) {
    if (!isPositiveNum(d.amount)) fail("amount non valido");
    out.amount = d.amount;
  }
  if (d.type !== undefined) {
    if (!TRANSACTION_TYPES.includes(d.type)) fail("type non valido");
    out.type = d.type;
  }
  if (d.categoryId !== undefined) {
    if (d.categoryId !== null && !isStr(d.categoryId, 1, 100)) fail("categoryId non valido");
    out.categoryId = d.categoryId || null;
  }
  if (d.date !== undefined) {
    if (!isDate(d.date)) fail("date non valida");
    out.date = d.date;
  }
  return out;
}

// Goal

function goal(d) {
  if (!isStr(d.name, 1, 100))          fail("name non valido");
  if (!GOAL_TYPES.includes(d.type))    fail("type non valido");
  if (!isPositiveNum(d.targetAmount))  fail("targetAmount non valido");
  if (!GOAL_PERIODS.includes(d.period)) fail("period non valido");
  if (d.categoryId !== null && !isStr(d.categoryId, 1, 100)) fail("categoryId non valido");
  return {
    name:         d.name.trim(),
    type:         d.type,
    targetAmount: d.targetAmount,
    period:       d.period,
    categoryId:   d.categoryId || null,
  };
}

function goalPatch(d) {
  const out = {};
  if (d.name !== undefined) {
    if (!isStr(d.name, 1, 100)) fail("name non valido");
    out.name = d.name.trim();
  }
  if (d.type !== undefined) {
    if (!GOAL_TYPES.includes(d.type)) fail("type non valido");
    out.type = d.type;
  }
  if (d.targetAmount !== undefined) {
    if (!isPositiveNum(d.targetAmount)) fail("targetAmount non valido");
    out.targetAmount = d.targetAmount;
  }
  if (d.period !== undefined) {
    if (!GOAL_PERIODS.includes(d.period)) fail("period non valido");
    out.period = d.period;
  }
  if (d.categoryId !== undefined) {
    if (d.categoryId !== null && !isStr(d.categoryId, 1, 100)) fail("categoryId non valido");
    out.categoryId = d.categoryId || null;
  }
  return out;
}

function contributeAmount(v) {
  if (!isFiniteNum(v) || v === 0) fail("amount non valido");
  return v;
}

// Subscription

function subscription(d) {
  if (!isStr(d.name, 1, 100)) fail("name non valido");
  const day = d.expiryDay;
  if (!Number.isInteger(day) || day < 1 || day > 31) fail("expiryDay non valido");
  if (d.lastRenewal && !isDate(d.lastRenewal))       fail("lastRenewal non valida");
  if (d.cost !== null && !isPositiveNum(d.cost))     fail("cost non valido");
  // logo è una data URL base64; limite ~200 KB
  if (d.logo !== null && (typeof d.logo !== "string" || d.logo.length > 204_800)) fail("logo non valido");
  if (d.categoryId !== null && !isStr(d.categoryId, 1, 100)) fail("categoryId non valido");
  return {
    name:        d.name.trim(),
    expiryDay:   day,
    lastRenewal: d.lastRenewal || null,
    cost:        d.cost ?? null,
    logo:        d.logo ?? null,
    categoryId:  d.categoryId || null,
  };
}

function subscriptionPatch(d) {
  const out = {};
  if (d.name !== undefined) {
    if (!isStr(d.name, 1, 100)) fail("name non valido");
    out.name = d.name.trim();
  }
  if (d.expiryDay !== undefined) {
    if (!Number.isInteger(d.expiryDay) || d.expiryDay < 1 || d.expiryDay > 31) fail("expiryDay non valido");
    out.expiryDay = d.expiryDay;
  }
  if (d.lastRenewal !== undefined) {
    if (d.lastRenewal && !isDate(d.lastRenewal)) fail("lastRenewal non valida");
    out.lastRenewal = d.lastRenewal || null;
  }
  if (d.cost !== undefined) {
    if (d.cost !== null && !isPositiveNum(d.cost)) fail("cost non valido");
    out.cost = d.cost ?? null;
  }
  if (d.logo !== undefined) {
    if (d.logo !== null && (typeof d.logo !== "string" || d.logo.length > 204_800)) fail("logo non valido");
    out.logo = d.logo ?? null;
  }
  if (d.categoryId !== undefined) {
    if (d.categoryId !== null && !isStr(d.categoryId, 1, 100)) fail("categoryId non valido");
    out.categoryId = d.categoryId || null;
  }
  return out;
}

module.exports = {
  id,
  category, categoryPatch,
  transaction, transactionPatch,
  goal, goalPatch, contributeAmount,
  subscription, subscriptionPatch,
};
