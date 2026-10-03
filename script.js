/* =========================================================
   StockPoint — Inventory Management System
   Frontend prototype — data is local (localStorage).

   DATA LAYER NOTE FOR FUTURE BACKEND INTEGRATION
   ------------------------------------------------
   Every read/write goes through the `Store` object below.
   To connect a Node.js + Express REST API later, only the
   bodies of the Store methods need to change to fetch('/api/...')
   calls — nothing in the render/UI code needs to change.
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     1. STORE
     ========================================================= */
  const LS_KEYS = { items: "sp_items", movements: "sp_movements", seeded: "sp_seeded_v1" };

  function readLS(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function writeLS(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  const API = "http://localhost:5000/api";

const Store = {
  items: [],
   movements: [],

  async loadItems() {
    const response = await fetch(`${API}/items`);

    if (!response.ok) {
      throw new Error("Failed to fetch items");
    }

    this.items = await response.json();
  },

  getItems() {
    return this.items;
  },

  async addItem(item) {
    const response = await fetch(`${API}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add item");
    }

    const savedItem = await response.json();

    this.items.unshift(savedItem);

    return savedItem;
  },

  async updateItem(id, patch) {
  const currentItem = this.items.find(
    item => item.id === id || item._id === id
  );

  if (!currentItem) {
    throw new Error("Item not found");
  }

  const mongoId = currentItem._id;

  const response = await fetch(`${API}/items/${mongoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(patch)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update item");
  }

  const updatedItem = await response.json();

  const index = this.items.findIndex(
    item => item._id === mongoId
  );

  if (index !== -1) {
    this.items[index] = updatedItem;
  }

  return updatedItem;
},

  async deleteItem(id) {
  const currentItem = this.items.find(
    item => item.id === id || item._id === id
  );

  if (!currentItem) {
    throw new Error("Item not found");
  }

  const mongoId = currentItem._id;

  const response = await fetch(`${API}/items/${mongoId}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete item");
  }

  this.items = this.items.filter(
    item => item._id !== mongoId
  );
},

  async loadMovements() {
  const response = await fetch(`${API}/movements`);

  if (!response.ok) {
    throw new Error("Failed to load movements");
  }

  this.movements = await response.json();
},

getMovements() {
  return this.movements;
},

async addMovement(movement) {
  const response = await fetch(`${API}/movements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(movement)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add movement");
  }

  const savedMovement = await response.json();

  this.movements.unshift(savedMovement);

  return savedMovement;
},
};

  /* =========================================================
     2. SEED DATA
     ========================================================= */
  function seedIfNeeded() {
    if (readLS(LS_KEYS.seeded, false)) return;

    const items = [
      { id: "ITM001", name: "A4 Copier Paper (Ream)", sku: "SKU-1001", category: "Stationery", unit: "box", qty: 42, reorderLevel: 15, price: 320, supplier: "Om Traders" },
      { id: "ITM002", name: "Ballpoint Pens (Box of 50)", sku: "SKU-1002", category: "Stationery", unit: "box", qty: 18, reorderLevel: 10, price: 210, supplier: "Om Traders" },
      { id: "ITM003", name: "Wireless Mouse", sku: "SKU-2001", category: "Electronics", unit: "pcs", qty: 6, reorderLevel: 8, price: 550, supplier: "TechMart Distributors" },
      { id: "ITM004", name: "USB-C Charging Cable", sku: "SKU-2002", category: "Electronics", unit: "pcs", qty: 34, reorderLevel: 20, price: 180, supplier: "TechMart Distributors" },
      { id: "ITM005", name: "Corrugated Shipping Box (Medium)", sku: "SKU-3001", category: "Packaging", unit: "pcs", qty: 120, reorderLevel: 50, price: 25, supplier: "PackRight Supplies" },
      { id: "ITM006", name: "Bubble Wrap Roll", sku: "SKU-3002", category: "Packaging", unit: "pcs", qty: 9, reorderLevel: 12, price: 450, supplier: "PackRight Supplies" },
      { id: "ITM007", name: "Hand Sanitizer (500ml)", sku: "SKU-4001", category: "Cleaning", unit: "pcs", qty: 27, reorderLevel: 15, price: 140, supplier: "CleanCo India" },
      { id: "ITM008", name: "Floor Cleaner (5L)", sku: "SKU-4002", category: "Cleaning", unit: "pcs", qty: 4, reorderLevel: 6, price: 380, supplier: "CleanCo India" },
      { id: "ITM009", name: "Office Chair — Ergonomic", sku: "SKU-5001", category: "Furniture", unit: "pcs", qty: 11, reorderLevel: 4, price: 4200, supplier: "WorkSpace Furnishers" },
      { id: "ITM010", name: "Whiteboard Marker (Pack of 4)", sku: "SKU-1003", category: "Stationery", unit: "pack", qty: 0, reorderLevel: 8, price: 160, supplier: "Om Traders" },
    ];

    const today = new Date();
    const d = (offsetDays) => { const dt = new Date(today); dt.setDate(dt.getDate() + offsetDays); return dt.toISOString().slice(0, 10); };

    const movements = [
      { id: "MOV001", itemId: "ITM001", type: "In", qty: 20, date: d(-6), supplier: "Om Traders", note: "PO #1042", reason: "" },
      { id: "MOV002", itemId: "ITM003", type: "Out", qty: 4, date: d(-5), supplier: "", note: "", reason: "Sale" },
      { id: "MOV003", itemId: "ITM005", type: "In", qty: 60, date: d(-4), supplier: "PackRight Supplies", note: "Bulk restock", reason: "" },
      { id: "MOV004", itemId: "ITM008", type: "Out", qty: 3, date: d(-3), supplier: "", note: "", reason: "Internal use" },
      { id: "MOV005", itemId: "ITM010", type: "Out", qty: 8, date: d(-3), supplier: "", note: "", reason: "Sale" },
      { id: "MOV006", itemId: "ITM002", type: "In", qty: 10, date: d(-2), supplier: "Om Traders", note: "", reason: "" },
      { id: "MOV007", itemId: "ITM006", type: "Out", qty: 5, date: d(-1), supplier: "", note: "", reason: "Damaged" },
      { id: "MOV008", itemId: "ITM004", type: "In", qty: 15, date: d(0), supplier: "TechMart Distributors", note: "", reason: "" },
    ];

    Store.saveItems(items);
    Store.saveMovements(movements);
    writeLS(LS_KEYS.seeded, true);
  }

  /* =========================================================
     3. UTILITIES
     ========================================================= */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const fmtDate = (iso) => { if (!iso) return "—"; const dt = new Date(iso); return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); };
  const fmtMoney = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

  function stockStatus(item) {
    if (item.qty <= 0) return "out";
    if (item.qty <= item.reorderLevel) return "low";
    return "ok";
  }

  /* =========================================================
     4. TOASTS
     ========================================================= */
  const ICONS = {
    success: '<svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    error: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2zm0-4h-2v-4h2z"/></svg>',
  };
  function toast(message, type) {
    type = type || "success";
    const stack = $("#toastStack");
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.innerHTML = '<span class="toast-icon">' + ICONS[type] + '</span><span class="toast-msg">' + escapeHtml(message) + '</span><button class="toast-close" aria-label="Dismiss">&times;</button>';
    el.querySelector(".toast-close").addEventListener("click", () => el.remove());
    stack.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }

  /* =========================================================
     5. MODALS
     ========================================================= */
  const backdrop = $("#modalBackdrop");
  function openModal(id) { backdrop.classList.add("show"); $$(".modal", backdrop).forEach((m) => m.classList.remove("show")); $("#" + id).classList.add("show"); }
  function closeModal() { backdrop.classList.remove("show"); $$(".modal", backdrop).forEach((m) => m.classList.remove("show")); }
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  $$("[data-close-modal]").forEach((btn) => btn.addEventListener("click", closeModal));

  function confirmAction(text, onConfirm, title) {
    $("#confirmModalTitle").textContent = title || "Are you sure?";
    $("#confirmModalText").textContent = text;
    openModal("confirmModal");
    const okBtn = $("#confirmModalOk");
    const handler = () => { onConfirm(); closeModal(); okBtn.removeEventListener("click", handler); };
    okBtn.replaceWith(okBtn.cloneNode(true));
    $("#confirmModalOk").addEventListener("click", handler);
  }

  function showDetails(title, rows) {
    $("#detailsModalTitle").textContent = title;
    $("#detailsModalBody").innerHTML = rows.map((r) => '<div class="detail-row"><span class="k">' + escapeHtml(r[0]) + '</span><span class="v">' + escapeHtml(r[1]) + '</span></div>').join("");
    openModal("detailsModal");
  }

  /* =========================================================
     6. VALIDATION HELPERS
     ========================================================= */
  function setFieldError(inputId, message) {
    const input = $("#" + inputId);
    const errEl = $('.field-error[data-for="' + inputId + '"]');
    const field = input ? input.closest(".field") : null;
    if (errEl) errEl.textContent = message || "";
    if (field) field.classList.toggle("invalid", !!message);
  }
  function clearErrors(ids) { ids.forEach((id) => setFieldError(id, "")); }

  /* =========================================================
     7. NAVIGATION
     ========================================================= */
  function switchView(name) {
    $$(".view").forEach((v) => v.classList.remove("active"));
    $("#view-" + name).classList.add("active");
    $$(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    if ($("#sidebar").classList.contains("open")) closeSidebar();
    renderAll();
  }
  $$(".nav-item").forEach((btn) => btn.addEventListener("click", () => switchView(btn.dataset.view)));

  function openSidebar() { $("#sidebar").classList.add("open"); $("#sidebarScrim").classList.add("show"); }
  function closeSidebar() { $("#sidebar").classList.remove("open"); $("#sidebarScrim").classList.remove("show"); }
  $("#menuToggle").addEventListener("click", openSidebar);
  $("#sidebarScrim").addEventListener("click", closeSidebar);

  /* =========================================================
     8. DASHBOARD
     ========================================================= */
  function renderDashboard() {
    const items = Store.getItems();
    const movements = Store.getMovements();

    const totalItems = items.length;
    const stockValue = items.reduce((s, i) => s + i.qty * i.price, 0);
    const lowStockCount = items.filter((i) => stockStatus(i) === "low").length;
    const outOfStockCount = items.filter((i) => stockStatus(i) === "out").length;
    const categories = new Set(items.map((i) => i.category)).size;

    const cards = [
      { label: "Total Items", value: totalItems, icon: "teal", svg: '<path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2z"/>' },
      { label: "Total Stock Value", value: fmtMoney(stockValue), icon: "green", svg: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>' },
      { label: "Low Stock Items", value: lowStockCount, icon: "orange", svg: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2zm0-4h-2v-4h2z"/>' },
      { label: "Out of Stock", value: outOfStockCount, icon: "red", svg: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2zm0-4h-2V7h2z"/>' },
      { label: "Categories", value: categories, icon: "teal", svg: '<path d="M5 3h14a1 1 0 0 1 1 1v16l-4-3-3 3-3-3-3 3-3-3-1 .8V4a1 1 0 0 1 1-1z"/>' },
      { label: "Total Movements", value: movements.length, icon: "ink", svg: '<path d="M9 3v2H4v2h1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7h1V5h-5V3H9z"/>' },
    ];
    $("#statGrid").innerHTML = cards.map((c) =>
      '<div class="stat-card"><div class="stat-icon ' + c.icon + '"><svg viewBox="0 0 24 24">' + c.svg + '</svg></div>' +
      '<div class="stat-value">' + c.value + '</div><div class="stat-label">' + c.label + '</div></div>'
    ).join("");

    $("#notifDot").hidden = (lowStockCount + outOfStockCount) === 0;

    drawCategoryChart(items);
    drawActivityChart(movements);
    renderLowStock(items);
    renderRecentMovements(items, movements);
  }

  function drawCategoryChart(items) {
    const canvas = $("#chartCategory");
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 420, h = 220;
    canvas.width = w * ratio; canvas.height = h * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const byCat = {};
    items.forEach((i) => { byCat[i.category] = (byCat[i.category] || 0) + i.qty; });
    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!entries.length) return;
    const max = Math.max(...entries.map((e) => e[1]), 1);
    const padL = 10, padTop = 10, barH = 22, gap = 14;
    entries.forEach((e, i) => {
      const y = padTop + i * (barH + gap);
      const barMaxW = w - padL - 10 - 110;
      const barW = Math.max(4, (e[1] / max) * barMaxW);
      ctx.fillStyle = "#64748b"; ctx.font = "12px Inter, sans-serif"; ctx.textBaseline = "middle";
      const label = e[0].length > 16 ? e[0].slice(0, 15) + "…" : e[0];
      ctx.fillText(label, padL, y + barH / 2);
      ctx.fillStyle = "#f0fdfa"; ctx.fillRect(padL + 100, y, barMaxW, barH);
      ctx.fillStyle = "#0d9488"; ctx.fillRect(padL + 100, y, barW, barH);
      ctx.fillStyle = "#0f172a"; ctx.font = "600 12px Inter, sans-serif";
      ctx.fillText(String(e[1]), padL + 100 + barW + 8, y + barH / 2);
    });
  }

  function drawActivityChart(movements) {
    const canvas = $("#chartActivity");
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 420, h = 220;
    canvas.width = w * ratio; canvas.height = h * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const days = [];
    for (let i = 6; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); days.push(dt.toISOString().slice(0, 10)); }
    const inCount = days.map((d) => movements.filter((m) => String(m.date).slice(0, 10) === d && m.type === "In").reduce((s, m) => s + m.qty, 0));
    const outCount = days.map((d) => movements.filter((m) => String(m.date).slice(0, 10) === d && m.type === "Out").reduce((s, m) => s + m.qty, 0));
    const max = Math.max(1, ...inCount, ...outCount);

    const padL = 30, padB = 24, padTop = 16, padR = 10;
    const plotW = w - padL - padR, plotH = h - padB - padTop;
    const colW = plotW / days.length;

    ctx.strokeStyle = "#e2e8f0"; ctx.beginPath(); ctx.moveTo(padL, padTop); ctx.lineTo(padL, padTop + plotH); ctx.lineTo(padL + plotW, padTop + plotH); ctx.stroke();

    days.forEach((d, i) => {
      const x0 = padL + i * colW; const bw = colW * 0.3;
      const hIn = (inCount[i] / max) * plotH, hOut = (outCount[i] / max) * plotH;
      ctx.fillStyle = "#0d9488"; ctx.fillRect(x0 + colW * 0.18, padTop + plotH - hIn, bw, hIn);
      ctx.fillStyle = "#d97706"; ctx.fillRect(x0 + colW * 0.52, padTop + plotH - hOut, bw, hOut);
      ctx.fillStyle = "#64748b"; ctx.font = "10.5px Inter, sans-serif"; ctx.textAlign = "center";
      const lbl = new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      ctx.fillText(lbl, x0 + colW / 2, padTop + plotH + 15);
    });
    ctx.textAlign = "left";
    ctx.fillStyle = "#0d9488"; ctx.fillRect(padL, 0, 9, 9);
    ctx.fillStyle = "#334155"; ctx.font = "11px Inter, sans-serif"; ctx.fillText("Stock In", padL + 14, 7);
    ctx.fillStyle = "#d97706"; ctx.fillRect(padL + 78, 0, 9, 9);
    ctx.fillStyle = "#334155"; ctx.fillText("Stock Out", padL + 92, 7);
  }

  function renderLowStock(items) {
    const low = items.filter((i) => stockStatus(i) !== "ok").sort((a, b) => a.qty - b.qty).slice(0, 6);
    const el = $("#lowStockList");
    if (!low.length) { el.innerHTML = '<div class="mini-item"><span class="mini-item-sub">All items are healthy stock.</span></div>'; return; }
    el.innerHTML = low.map((i) => {
      const badge = stockStatus(i) === "out" ? '<span class="badge badge-red"><span class="badge-dot"></span>Out</span>' : '<span class="badge badge-orange"><span class="badge-dot"></span>Low</span>';
      return '<div class="mini-item"><div class="mini-item-main"><span class="mini-item-title">' + escapeHtml(i.name) + '</span><span class="mini-item-sub">' + i.qty + ' ' + escapeHtml(i.unit) + ' left · reorder at ' + i.reorderLevel + '</span></div>' + badge + '</div>';
    }).join("");
  }

  function renderRecentMovements(items, movements) {
    const recent = movements.slice(0, 8);
    const el = $("#recentMovementsList");
    el.innerHTML = recent.map((m) => {
      const item = items.find((i) => i.id === m.itemId);
      const badge = m.type === "In" ? '<span class="badge badge-teal">In</span>' : '<span class="badge badge-orange">Out</span>';
      return '<div class="mini-item"><div class="mini-item-main"><span class="mini-item-title">' + escapeHtml(item ? item.name : "—") + '</span><span class="mini-item-sub">' + m.qty + ' units · ' + fmtDate(m.date) + '</span></div>' + badge + '</div>';
    }).join("") || '<div class="mini-item"><span class="mini-item-sub">No movements yet.</span></div>';
  }

  /* =========================================================
     9. ITEMS
     ========================================================= */
  function populateCategoryFilter() {
    const items = Store.getItems();
    const cats = Array.from(new Set(items.map((i) => i.category))).sort();
    const sel = $("#itemCategoryFilter");
    const current = sel.value;
    sel.innerHTML = '<option value="">All categories</option>' + cats.map((c) => '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>').join("");
    sel.value = current;
    $("#categoryList").innerHTML = cats.map((c) => '<option value="' + escapeHtml(c) + '">').join("");
  }

  function renderItems() {
    populateCategoryFilter();
    const items = Store.getItems();
    const q = $("#itemSearch").value.trim().toLowerCase();
    const cat = $("#itemCategoryFilter").value;
    const stockFilter = $("#itemStockFilter").value;
    const sort = $("#itemSort").value;

    let list = items.filter((i) => {
      const matchQ = !q || [i.name, i.sku, i.id].some((v) => String(v).toLowerCase().includes(q));
      const matchCat = !cat || i.category === cat;
      const matchStock = !stockFilter || stockStatus(i) === stockFilter;
      return matchQ && matchCat && matchStock;
    });

    if (sort === "name") list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "qty") list = list.slice().sort((a, b) => a.qty - b.qty);
    else if (sort === "value") list = list.slice().sort((a, b) => (b.qty * b.price) - (a.qty * a.price));

    $("#itemsEmpty").classList.toggle("show", list.length === 0);
    $("#itemsTableBody").innerHTML = list.map((i) => {
      const status = stockStatus(i);
      const badge = status === "out" ? '<span class="badge badge-red"><span class="badge-dot"></span>Out of stock</span>'
        : status === "low" ? '<span class="badge badge-orange"><span class="badge-dot"></span>Low stock</span>'
        : '<span class="badge badge-green"><span class="badge-dot"></span>Healthy</span>';
      return '<tr>' +
        '<td class="cell-strong">' + escapeHtml(i.id) + '</td>' +
        '<td class="cell-strong">' + escapeHtml(i.name) + '</td>' +
        '<td class="cell-muted">' + escapeHtml(i.sku) + '</td>' +
        '<td>' + escapeHtml(i.category) + '</td>' +
        '<td>' + escapeHtml(i.unit) + '</td>' +
        '<td>' + i.qty + '</td>' +
        '<td>' + i.reorderLevel + '</td>' +
        '<td>' + fmtMoney(i.price) + '</td>' +
        '<td>' + fmtMoney(i.qty * i.price) + '</td>' +
        '<td>' + badge + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-action" data-view-item="' + i.id + '" title="View"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg></button>' +
          '<button class="icon-action" data-edit-item="' + i.id + '" title="Edit"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg></button>' +
          '<button class="icon-action danger" data-delete-item="' + i.id + '" title="Delete"><svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>' +
        '</div></td></tr>';
    }).join("");
  }

  function fillItemForm(item) {
    $("#itemEditId").value = item ? item.id : "";
    $("#fItemId").value = item ? item.id : "";
    $("#fItemId").disabled = !!item;
    $("#fName").value = item ? item.name : "";
    $("#fSku").value = item ? item.sku : "";
    $("#fCategory").value = item ? item.category : "";
    $("#fUnit").value = item ? item.unit : "pcs";
    $("#fQty").value = item ? item.qty : "";
    $("#fReorder").value = item ? item.reorderLevel : "";
    $("#fPrice").value = item ? item.price : "";
    $("#fSupplier").value = item ? (item.supplier || "") : "";
    clearErrors(["fItemId", "fName", "fSku", "fCategory", "fQty", "fReorder", "fPrice"]);
  }

  $("#btnAddItem").addEventListener("click", () => { $("#itemModalTitle").textContent = "Add Item"; fillItemForm(null); openModal("itemModal"); });

  $("#itemForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const editId = $("#itemEditId").value;
    const id = $("#fItemId").value.trim();
    const name = $("#fName").value.trim();
    const sku = $("#fSku").value.trim();
    const category = $("#fCategory").value.trim();
    const unit = $("#fUnit").value;
    const qty = parseInt($("#fQty").value, 10);
    const reorderLevel = parseInt($("#fReorder").value, 10);
    const price = parseFloat($("#fPrice").value);
    const supplier = $("#fSupplier").value.trim();

    const fields = ["fItemId", "fName", "fSku", "fCategory", "fQty", "fReorder", "fPrice"];
    clearErrors(fields);
    let ok = true;
    const items = Store.getItems();

    if (!id) { setFieldError("fItemId", "Item ID is required."); ok = false; }
    else if (!editId && items.some((i) => i.id.toLowerCase() === id.toLowerCase())) { setFieldError("fItemId", "This Item ID already exists."); ok = false; }

    if (!name) { setFieldError("fName", "Item name is required."); ok = false; }

    if (!sku) { setFieldError("fSku", "SKU is required."); ok = false; }
    else if (items.some((i) => i.sku.toLowerCase() === sku.toLowerCase() && i.id !== editId)) { setFieldError("fSku", "This SKU already exists."); ok = false; }

    if (!category) { setFieldError("fCategory", "Category is required."); ok = false; }
    if (qty === "" || isNaN(qty) || qty < 0) { setFieldError("fQty", "Quantity cannot be negative."); ok = false; }
    if (reorderLevel === "" || isNaN(reorderLevel) || reorderLevel < 0) { setFieldError("fReorder", "Reorder level cannot be negative."); ok = false; }
    if (!price || price <= 0) { setFieldError("fPrice", "Unit price must be greater than 0."); ok = false; }

    if (!ok) return;

    if (editId) {
  await Store.updateItem(editId, {
    name,
    sku,
    category,
    unit,
    qty,
    reorderLevel,
    price,
    supplier
  });

  toast("Item updated successfully.", "success");

} else {
  await Store.addItem({
    id,
    name,
    sku,
    category,
    unit,
    qty,
    reorderLevel,
    price,
    supplier
  });

  toast("Item added successfully.", "success");
}
    closeModal();
    renderAll();
  });

  $("#itemsTableBody").addEventListener("click", (e) => {
    const viewId = e.target.closest("[data-view-item]");
    const editId = e.target.closest("[data-edit-item]");
    const delId = e.target.closest("[data-delete-item]");
    if (viewId) {
      const i = Store.getItems().find((x) => x.id === viewId.dataset.viewItem);
      if (!i) return;
      showDetails(i.name, [
        ["Item ID", i.id], ["SKU", i.sku], ["Category", i.category], ["Unit", i.unit],
        ["Quantity", String(i.qty)], ["Reorder level", String(i.reorderLevel)],
        ["Unit price", fmtMoney(i.price)], ["Stock value", fmtMoney(i.qty * i.price)],
        ["Supplier", i.supplier || "—"],
      ]);
    } else if (editId) {
      const i = Store.getItems().find((x) => x.id === editId.dataset.editItem);
      if (!i) return;
      $("#itemModalTitle").textContent = "Edit Item";
      fillItemForm(i);
      openModal("itemModal");
    } else if (delId) {
      const id = delId.dataset.deleteItem;
      const i = Store.getItems().find((x) => x.id === id);
      const hasMovements = Store.getMovements().some((m) => m.itemId === id);
      if (hasMovements) { toast("Cannot delete an item that has stock movement history.", "error"); return; }
      confirmAction('Delete "' + (i ? i.name : id) + '"? This cannot be undone.', () => {
        Store.deleteItem(id);
        toast("Item deleted.", "success");
        renderAll();
      }, "Delete item");
    }
  });

  ["itemSearch", "itemCategoryFilter", "itemStockFilter", "itemSort"].forEach((id) => $("#" + id).addEventListener("input", renderItems));

  /* =========================================================
     10. STOCK IN
     ========================================================= */
  function populateStockSelectors() {
    const items = Store.getItems();
    const opts = (i) => '<option value="' + i.id + '">' + escapeHtml(i.name) + ' — ' + i.qty + ' ' + escapeHtml(i.unit) + ' in stock</option>';
    $("#inItem").innerHTML = '<option value="">Select an item</option>' + items.map(opts).join("");
    $("#outItem").innerHTML = '<option value="">Select an item</option>' + items.map(opts).join("");
  }

  $("#inItem").addEventListener("change", () => {
    const item = Store.getItems().find((i) => i.id === $("#inItem").value);
    const box = $("#stockInPreview");
    if (!item) { box.hidden = true; return; }
    box.hidden = false; box.className = "availability-box ok";
    box.textContent = "Current stock: " + item.qty + " " + item.unit + " · Reorder level: " + item.reorderLevel;
  });

  $("#outItem").addEventListener("change", () => {
    const item = Store.getItems().find((i) => i.id === $("#outItem").value);
    const box = $("#stockOutPreview");
    if (!item) { box.hidden = true; return; }
    box.hidden = false;
    if (item.qty > 0) { box.className = "availability-box ok"; box.textContent = "Current stock: " + item.qty + " " + item.unit + " available to remove."; }
    else { box.className = "availability-box bad"; box.textContent = "This item is already out of stock."; }
  });

  $("#stockInForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fields = ["inItem", "inQty", "inDate"];
  clearErrors(fields);

  let ok = true;

  const itemId = $("#inItem").value;
  const qty = parseInt($("#inQty").value, 10);
  const date = $("#inDate").value;
  const supplier = $("#inSupplier").value.trim();
  const note = $("#inNote").value.trim();

  const item = Store.getItems().find((i) => i.id === itemId);

  if (!itemId) {
    setFieldError("inItem", "Select an item.");
    ok = false;
  } else if (!item) {
    setFieldError("inItem", "This item does not exist.");
    ok = false;
  }

  if (!qty || qty <= 0) {
    setFieldError("inQty", "Quantity must be greater than 0.");
    ok = false;
  }

  if (!date) {
    setFieldError("inDate", "Date is required.");
    ok = false;
  }

  if (!ok) {
    toast("Please fix the highlighted fields.", "error");
    return;
  }

  const movId =
    "MOV" +
    String(Store.getMovements().length + 1).padStart(3, "0") +
    "-" +
    Date.now().toString().slice(-4);

  try {
    await Store.addMovement({
      id: movId,
      itemId,
      type: "In",
      qty,
      date,
      supplier,
      note,
      reason: ""
    });

    await Store.updateItem(itemId, {
      qty: item.qty + qty
    });

    toast("Stock added successfully.", "success");

    $("#stockInForm").reset();
    $("#inDate").value = todayStr();
    $("#stockInPreview").hidden = true;

    renderAll();
  } catch (error) {
    console.error("Stock In failed:", error);
    toast(error.message || "Failed to add stock.", "error");
  }
});

  function renderStockInPreview() {
    const items = Store.getItems();
    const list = Store.getMovements().filter((m) => m.type === "In").slice(0, 8);
    $("#stockInPreviewBody").innerHTML = list.map((m) => {
      const item = items.find((i) => i.id === m.itemId);
      return '<tr><td class="cell-strong">' + m.id + '</td><td>' + escapeHtml(item ? item.name : "—") + '</td><td>' + m.qty + '</td><td>' + fmtDate(m.date) + '</td><td>' + escapeHtml(m.supplier || "—") + '</td></tr>';
    }).join("") || '<tr><td colspan="5" class="cell-muted">No stock-in entries yet.</td></tr>';
  }

  /* =========================================================
     11. STOCK OUT
     ========================================================= */
  $("#stockOutForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fields = ["outItem", "outQty", "outDate"];
  clearErrors(fields);

  let ok = true;

  const itemId = $("#outItem").value;
  const qty = parseInt($("#outQty").value, 10);
  const date = $("#outDate").value;
  const reason = $("#outReason").value;

  const item = Store.getItems().find((i) => i.id === itemId);

  if (!itemId) {
    setFieldError("outItem", "Select an item.");
    ok = false;
  } else if (!item) {
    setFieldError("outItem", "This item does not exist.");
    ok = false;
  }

  if (!qty || qty <= 0) {
    setFieldError("outQty", "Quantity must be greater than 0.");
    ok = false;
  } else if (item && qty > item.qty) {
    setFieldError(
      "outQty",
      "Only " + item.qty + " " + item.unit + " available."
    );
    ok = false;
  }

  if (!date) {
    setFieldError("outDate", "Date is required.");
    ok = false;
  }

  if (!ok) {
    toast("Please fix the highlighted fields.", "error");
    return;
  }

  const movId =
    "MOV" +
    String(Store.getMovements().length + 1).padStart(3, "0") +
    "-" +
    Date.now().toString().slice(-4);

  try {
    await Store.addMovement({
      id: movId,
      itemId,
      type: "Out",
      qty,
      date,
      supplier: "",
      note: "",
      reason
    });

    await Store.updateItem(itemId, {
      qty: item.qty - qty
    });

    toast("Stock removed successfully.", "success");

    $("#stockOutForm").reset();
    $("#outDate").value = todayStr();
    $("#stockOutPreview").hidden = true;

    renderAll();
  } catch (error) {
    console.error("Stock Out failed:", error);
    toast(error.message || "Failed to remove stock.", "error");
  }
});

  function renderStockOutPreview() {
    const items = Store.getItems();
    const list = Store.getMovements().filter((m) => m.type === "Out").slice(0, 8);
    $("#stockOutPreviewBody").innerHTML = list.map((m) => {
      const item = items.find((i) => i.id === m.itemId);
      return '<tr><td class="cell-strong">' + m.id + '</td><td>' + escapeHtml(item ? item.name : "—") + '</td><td>' + m.qty + '</td><td>' + fmtDate(m.date) + '</td><td>' + escapeHtml(m.reason || "—") + '</td></tr>';
    }).join("") || '<tr><td colspan="5" class="cell-muted">No stock-out entries yet.</td></tr>';
  }

  /* =========================================================
     12. MOVEMENTS
     ========================================================= */
  function inDateRange(iso, range) {
  if (!range) return true;

  const dateOnly = String(iso).slice(0, 10);
  const d = new Date(iso);
  const now = new Date();

  if (range === "today") {
    return dateOnly === todayStr();
  }

  if (range === "week") {
    const diff = (now - d) / 86400000;
    return diff >= 0 && diff <= 7;
  }

  if (range === "month") {
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }

  return true;
}

  function renderMovements() {
    const items = Store.getItems();
    const q = $("#movSearch").value.trim().toLowerCase();
    const typeFilter = $("#movTypeFilter").value;
    const dateFilter = $("#movDateFilter").value;
    const sort = $("#movSort").value;

    let list = Store.getMovements().filter((m) => {
      const item = items.find((i) => i.id === m.itemId);
      const matchQ = !q || [m.id, item && item.name].some((v) => v && v.toLowerCase().includes(q));
      const matchType = !typeFilter || m.type === typeFilter;
      const matchDate = inDateRange(m.date, dateFilter);
      return matchQ && matchType && matchDate;
    });

    list.sort((a, b) => sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));

    $("#movEmpty").classList.toggle("show", list.length === 0);
    $("#movTableBody").innerHTML = list.map((m) => {
      const item = items.find((i) => i.id === m.itemId);
      const badge = m.type === "In" ? '<span class="badge badge-teal">Stock In</span>' : '<span class="badge badge-orange">Stock Out</span>';
      const detail = m.type === "In" ? (m.supplier ? "Supplier: " + m.supplier : (m.note || "—")) : (m.reason || "—");
      return '<tr><td class="cell-strong">' + m.id + '</td><td>' + escapeHtml(item ? item.name : "—") + '</td><td>' + badge + '</td><td>' + m.qty + '</td><td>' + fmtDate(m.date) + '</td><td class="cell-muted">' + escapeHtml(detail) + '</td></tr>';
    }).join("");
  }

  ["movSearch", "movTypeFilter", "movDateFilter", "movSort"].forEach((id) => $("#" + id).addEventListener("input", renderMovements));

  /* =========================================================
     13. REPORTS
     ========================================================= */
  $("#reportDateFilter").addEventListener("change", () => {
    const custom = $("#reportDateFilter").value === "custom";
    $("#reportFrom").hidden = !custom; $("#reportTo").hidden = !custom;
  });

  function reportRangeFilter(iso) {
    const mode = $("#reportDateFilter").value;
    if (mode === "all" || !iso) return true;
    if (mode === "custom") {
      const from = $("#reportFrom").value, to = $("#reportTo").value;
      if (from && iso < from) return false;
      if (to && iso > to) return false;
      return true;
    }
    return inDateRange(iso, mode);
  }

  let lastReport = { head: [], rows: [], title: "" };

  function generateReport() {
    const type = $("#reportType").value;
    const items = Store.getItems();
    const movements = Store.getMovements();
    let head = [], rows = [], title = "", summary = [];

    if (type === "all-items" || type === "low-stock" || type === "out-of-stock") {
      head = ["Item ID", "Name", "SKU", "Category", "Quantity", "Reorder Level", "Unit Price", "Stock Value"];
      let list = items;
      if (type === "low-stock") { list = items.filter((i) => stockStatus(i) === "low"); title = "Low stock items"; }
      else if (type === "out-of-stock") { list = items.filter((i) => stockStatus(i) === "out"); title = "Out of stock items"; }
      else title = "All items";
      rows = list.map((i) => [i.id, i.name, i.sku, i.category, i.qty, i.reorderLevel, fmtMoney(i.price), fmtMoney(i.qty * i.price)]);
      summary = [["Items", rows.length], ["Total stock value", fmtMoney(list.reduce((s, i) => s + i.qty * i.price, 0))]];
    } else if (type === "stock-value") {
      head = ["Item ID", "Name", "Category", "Quantity", "Unit Price", "Stock Value"];
      const sorted = items.slice().sort((a, b) => (b.qty * b.price) - (a.qty * a.price));
      rows = sorted.map((i) => [i.id, i.name, i.category, i.qty, fmtMoney(i.price), fmtMoney(i.qty * i.price)]);
      title = "Stock value by item";
      summary = [["Total stock value", fmtMoney(items.reduce((s, i) => s + i.qty * i.price, 0))]];
    } else if (type === "category") {
      const byCat = {};
      items.forEach((i) => {
        byCat[i.category] = byCat[i.category] || { titles: 0, qty: 0, value: 0 };
        byCat[i.category].titles += 1; byCat[i.category].qty += i.qty; byCat[i.category].value += i.qty * i.price;
      });
      head = ["Category", "Items", "Total Quantity", "Stock Value"];
      rows = Object.entries(byCat).map(([cat, v]) => [cat, v.titles, v.qty, fmtMoney(v.value)]);
      title = "Stock by category";
      summary = [["Categories", rows.length]];
    } else if (type === "movement-history" || type === "stock-in" || type === "stock-out") {
      head = ["Txn ID", "Item", "Type", "Quantity", "Date", "Detail"];
      let list = movements.filter((m) => reportRangeFilter(m.date));
      if (type === "stock-in") { list = list.filter((m) => m.type === "In"); title = "Stock-in history"; }
      else if (type === "stock-out") { list = list.filter((m) => m.type === "Out"); title = "Stock-out history"; }
      else title = "Stock movement history";
      rows = list.map((m) => {
        const item = items.find((i) => i.id === m.itemId);
        const detail = m.type === "In" ? (m.supplier || m.note || "—") : (m.reason || "—");
        return [m.id, item ? item.name : "—", m.type, m.qty, fmtDate(m.date), detail];
      });
      summary = [["Transactions", rows.length]];
    }

    lastReport = { head, rows, title };
    $("#reportSummary").innerHTML = summary.map((s) => '<div class="stat-card"><div class="stat-value">' + s[1] + '</div><div class="stat-label">' + s[0] + '</div></div>').join("");
    $("#reportTableHead").innerHTML = "<tr>" + head.map((h) => "<th>" + escapeHtml(h) + "</th>").join("") + "</tr>";
    $("#reportEmpty").classList.toggle("show", rows.length === 0);
    $("#reportTableBody").innerHTML = rows.map((r) => "<tr>" + r.map((c) => "<td>" + escapeHtml(c) + "</td>").join("") + "</tr>").join("");
  }

  $("#btnGenerateReport").addEventListener("click", generateReport);
  $("#reportType").addEventListener("change", generateReport);

  $("#btnPrintReport").addEventListener("click", () => {
    if (!lastReport.rows.length) { toast("Generate a report before printing.", "warning"); return; }
    const w = window.open("", "_blank");
    const html = "<html><head><title>" + escapeHtml(lastReport.title) + "</title>" +
      "<style>body{font-family:Arial,sans-serif;padding:24px;}h1{font-size:18px;}table{width:100%;border-collapse:collapse;margin-top:16px;}th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left;}th{background:#f5f5f5;}</style></head><body>" +
      "<h1>" + escapeHtml(lastReport.title) + "</h1><p>Generated on " + fmtDate(todayStr()) + "</p>" +
      "<table><thead><tr>" + lastReport.head.map((h) => "<th>" + escapeHtml(h) + "</th>").join("") + "</tr></thead><tbody>" +
      lastReport.rows.map((r) => "<tr>" + r.map((c) => "<td>" + escapeHtml(c) + "</td>").join("") + "</tr>").join("") +
      "</tbody></table></body></html>";
    w.document.write(html); w.document.close(); w.focus(); w.print();
  });

  $("#btnExportReport").addEventListener("click", () => {
    if (!lastReport.rows.length) { toast("Generate a report before exporting.", "warning"); return; }
    const csvRows = [lastReport.head.join(",")].concat(lastReport.rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")));
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = lastReport.title.replace(/\s+/g, "_").toLowerCase() + ".csv";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast("Report exported as CSV.", "success");
  });

  /* =========================================================
     14. GLOBAL SEARCH
     ========================================================= */
  $("#globalSearch").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    if (!q) return;
    switchView("items"); $("#itemSearch").value = q; renderItems();
  });

  /* =========================================================
     15. MASTER RENDER
     ========================================================= */
  function renderAll() {
    renderDashboard();
    renderItems();
    populateStockSelectors();
    renderStockInPreview();
    renderStockOutPreview();
    renderMovements();
  }

  window.addEventListener("resize", () => { if ($("#view-dashboard").classList.contains("active")) renderDashboard(); });

  /* =========================================================
     16. INIT
     ========================================================= */
 async function init() {
  try {
    await Store.loadItems();
    await Store.loadMovements();

    $("#inDate").value = todayStr();
    $("#outDate").value = todayStr();

    populateStockSelectors();
    renderAll();

    console.log("Items loaded from MongoDB successfully");
  } catch (error) {
    console.error("Failed to load items:", error);
    alert("Could not load items from MongoDB");
  }
}

  document.addEventListener("DOMContentLoaded", init);
})();