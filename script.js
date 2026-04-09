/* =============================================
   Tree File Explorer — DSA Visualizer
   script.js
   ============================================= */

/* ── NODE CLASS ──────────────────────────────── */

class TreeNode {
  constructor(name, type, parent = null) {
    this.name     = name;
    this.type     = type;      // "folder" | "file"
    this.children = [];
    this.parent   = parent;
    this.expanded = true;
    this.id       = Math.random().toString(36).slice(2, 8);
    this.created  = new Date();
    this.x        = 0;
    this.y        = 0;
  }
}

/* ── TREE STATE ──────────────────────────────── */

let root            = new TreeNode("Root", "folder");
let selected        = root;
let searchHighlight = null;

/* seed with a realistic sample project */
(function seed() {
  const src   = addNode(root, "src",        "folder");
  const comps = addNode(src,  "components", "folder");
  addNode(comps, "Header.jsx",  "file");
  addNode(comps, "Sidebar.jsx", "file");
  addNode(comps, "Card.jsx",    "file");

  const utils = addNode(src, "utils", "folder");
  addNode(utils, "helpers.js", "file");
  addNode(utils, "api.js",     "file");

  addNode(src, "index.js", "file");
  addNode(src, "App.jsx",  "file");

  const pub = addNode(root, "public", "folder");
  addNode(pub, "index.html",   "file");
  addNode(pub, "favicon.ico",  "file");

  addNode(root, "README.md",     "file");
  addNode(root, "package.json",  "file");
})();

function addNode(parent, name, type) {
  const n = new TreeNode(name, type, parent);
  parent.children.push(n);
  return n;
}

/* ── HELPERS ─────────────────────────────────── */

function getPath(node) {
  const parts = [];
  let n = node;
  while (n) { parts.unshift(n.name); n = n.parent; }
  return parts.join("/");
}

function getBreadcrumbChain(node) {
  const chain = [];
  let n = node;
  while (n) { chain.unshift(n); n = n.parent; }
  return chain;
}

function getStats() {
  let nodes = 0, folders = 0, files = 0, maxDepth = 0;
  function dfs(n, d) {
    nodes++;
    if (n.type === "folder") folders++; else files++;
    maxDepth = Math.max(maxDepth, d);
    n.children.forEach(c => dfs(c, d + 1));
  }
  dfs(root, 1);
  return { nodes, folders, files, depth: maxDepth };
}

function getNodeDepth(node) {
  let d = 0, n = node;
  while (n.parent) { d++; n = n.parent; }
  return d;
}

function expandPathTo(node) {
  let n = node.parent;
  while (n) { n.expanded = true; n = n.parent; }
}

function getFileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  const map = {
    js: "🟨", jsx: "⚛", ts: "🟦", tsx: "⚛",
    css: "🎨", html: "🌐", json: "📋", md: "📝",
    png: "🖼", jpg: "🖼", gif: "🖼", ico: "🔷",
    svg: "🔶", pdf: "📕", zip: "📦"
  };
  return map[ext] || "📄";
}

/* ── RENDER — SIDEBAR TREE ───────────────────── */

function renderTree() {
  const container = document.getElementById("treeContainer");
  container.innerHTML = "";

  function build(node, parent) {
    const div = document.createElement("div");
    div.className = "tree-node";

    const row = document.createElement("div");
    row.className = "tree-row"
      + (node === selected        ? " selected" : "")
      + (node === searchHighlight ? " found"    : "");

    const toggle = document.createElement("div");
    toggle.className = "tree-toggle"
      + (node.children.length === 0 ? " leaf" : "")
      + (node.expanded              ? " open" : "");
    toggle.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10">
      <path d="M3 2l4 3-4 3" stroke="currentColor" stroke-width="1.4"
            stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;

    const icon = document.createElement("div");
    icon.className = "tree-icon";
    if (node.type === "folder")
      icon.textContent = (node.expanded && node.children.length) ? "📂" : "📁";
    else
      icon.textContent = getFileIcon(node.name);

    const name = document.createElement("div");
    name.className = "tree-name";
    name.textContent = node.name;

    const badge = document.createElement("div");
    badge.className = "tree-type-badge " + (node.type === "folder" ? "badge-folder" : "badge-file");
    badge.textContent = node.type === "folder"
      ? "DIR"
      : (node.name.split(".").pop().toUpperCase().slice(0, 4) || "FILE");

    row.appendChild(toggle);
    row.appendChild(icon);
    row.appendChild(name);
    row.appendChild(badge);

    row.onclick = (e) => { e.stopPropagation(); select(node); };
    toggle.onclick = (e) => {
      e.stopPropagation();
      if (node.children.length) { node.expanded = !node.expanded; renderAll(); }
    };

    div.appendChild(row);

    if (node.expanded && node.children.length) {
      const ch = document.createElement("div");
      ch.className = "tree-children";
      node.children.forEach(c => build(c, ch));
      div.appendChild(ch);
    }

    parent.appendChild(div);
  }

  build(root, container);
}

/* ── RENDER — BREADCRUMB ─────────────────────── */

function updateBreadcrumb() {
  const bc    = document.getElementById("breadcrumb");
  const chain = getBreadcrumbChain(selected);
  bc.innerHTML = chain.map((n, i) =>
    `<span class="bc-item">${n.name}</span>` +
    (i < chain.length - 1 ? '<span class="bc-sep">›</span>' : "")
  ).join("");
}

/* ── RENDER — HEADER STATS ───────────────────── */

function updateHeader() {
  const s = getStats();
  document.getElementById("statNodes").textContent   = s.nodes;
  document.getElementById("statDepth").textContent   = s.depth;
  document.getElementById("statFolders").textContent = s.folders;
  document.getElementById("statFiles").textContent   = s.files;
}

/* ── RENDER — INFO PANEL ─────────────────────── */

function updateInfo() {
  const s = getStats();
  document.getElementById("infoCards").innerHTML = `
    <div class="info-card">
      <div class="info-card-label">Total Nodes</div>
      <div class="info-card-value">${s.nodes}</div>
      <div class="info-card-sub">in entire tree</div>
    </div>
    <div class="info-card">
      <div class="info-card-label">Tree Depth</div>
      <div class="info-card-value">${s.depth}</div>
      <div class="info-card-sub">max levels</div>
    </div>
    <div class="info-card">
      <div class="info-card-label">Children</div>
      <div class="info-card-value">${selected.children.length}</div>
      <div class="info-card-sub">direct children</div>
    </div>
    <div class="info-card">
      <div class="info-card-label">Type</div>
      <div class="info-card-value" style="font-size:18px">${selected.type}</div>
      <div class="info-card-sub">${selected.type === "folder" ? "container" : "leaf node"}</div>
    </div>
  `;

  const depth = getNodeDepth(selected);
  document.getElementById("infoDetails").innerHTML = `
    <h4>Selected Node</h4>
    <div class="info-row"><span class="info-row-key">Name</span>   <span class="info-row-val">${selected.name}</span></div>
    <div class="info-row"><span class="info-row-key">Type</span>   <span class="info-row-val">${selected.type}</span></div>
    <div class="info-row"><span class="info-row-key">Depth</span>  <span class="info-row-val">${depth}</span></div>
    <div class="info-row"><span class="info-row-key">Children</span><span class="info-row-val">${selected.children.length}</span></div>
    <div class="info-row"><span class="info-row-key">Parent</span> <span class="info-row-val">${selected.parent ? selected.parent.name : "—"}</span></div>
    <div class="info-row"><span class="info-row-key">ID</span>     <span class="info-row-val" style="font-family:monospace;font-size:11px">${selected.id}</span></div>
  `;

  document.getElementById("pathDisplay").textContent = getPath(selected);
}

/* ── RENDER — CANVAS GRAPH ───────────────────── */

function drawCanvas() {
  const canvas = document.getElementById("treeCanvas");
  if (!document.getElementById("vizPanel").classList.contains("active")) return;

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.offsetWidth;
  const H   = canvas.offsetHeight;
  if (W === 0 || H === 0) return;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const NODE_W = 110, NODE_H = 38, HGAP = 24, VGAP = 54;

  /* 1 — measure subtree widths */
  function measure(node) {
    if (!node.expanded || node.children.length === 0) { node._w = NODE_W; return; }
    let total = 0;
    node.children.forEach(c => { measure(c); total += c._w + HGAP; });
    node._w = Math.max(NODE_W, total - HGAP);
  }

  /* 2 — assign x/y coordinates */
  function layout(node, x, y) {
    node.x = x; node.y = y;
    if (!node.expanded || node.children.length === 0) return;
    let total = 0;
    node.children.forEach(c => total += c._w + HGAP);
    total -= HGAP;
    let cx = x - total / 2;
    node.children.forEach(c => { layout(c, cx + c._w / 2, y + VGAP + NODE_H); cx += c._w + HGAP; });
  }

  /* 3 — compute layout */
  measure(root);
  let maxD = 0;
  function getMaxD(n, d) { maxD = Math.max(maxD, d); n.children.forEach(c => getMaxD(c, d + 1)); }
  getMaxD(root, 0);
  const totalH  = (maxD + 1) * (NODE_H + VGAP) + NODE_H + 40;
  const startY  = Math.max(30, (H - totalH) / 2 + 20);
  layout(root, W / 2, startY);

  /* helper — is node on path to selected? */
  function isOnPath(target, node) {
    let n = target;
    while (n) { if (n === node) return true; n = n.parent; }
    return false;
  }

  /* 4 — draw edges */
  function drawEdges(node) {
    if (!node.expanded) return;
    node.children.forEach(c => {
      const x1 = node.x, y1 = node.y + NODE_H / 2;
      const x2 = c.x,    y2 = c.y   - NODE_H / 2;
      const my = (y1 + y2) / 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x1, my, x2, my, x2, y2);
      const highlight = isOnPath(selected, node) || isOnPath(selected, c);
      ctx.strokeStyle = highlight ? "rgba(59,130,246,.6)" : "rgba(99,179,237,.15)";
      ctx.lineWidth   = highlight ? 1.8 : 1;
      ctx.stroke();
      drawEdges(c);
    });
  }
  drawEdges(root);

  /* 5 — draw nodes */
  function drawNode(node) {
    const x  = node.x,  y  = node.y;
    const nx = x - NODE_W / 2, ny = y - NODE_H / 2;
    const r  = 8;
    const isSel   = node === selected;
    const isFound = node === searchHighlight;

    if (isSel)   { ctx.shadowColor = "rgba(59,130,246,.5)";  ctx.shadowBlur = 16; }
    if (isFound) { ctx.shadowColor = "rgba(16,185,129,.5)";  ctx.shadowBlur = 14; }

    ctx.beginPath();
    ctx.roundRect(nx, ny, NODE_W, NODE_H, r);
    ctx.fillStyle = isSel   ? "#1e3a6e"
                  : isFound ? "rgba(16,185,129,.12)"
                  : node.type === "folder" ? "#1a2338" : "#161e2e";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = isSel   ? "rgba(59,130,246,.8)"
                    : isFound ? "rgba(16,185,129,.5)"
                    : node.type === "folder" ? "rgba(245,158,11,.18)" : "rgba(96,165,250,.15)";
    ctx.lineWidth = isSel ? 1.5 : 1;
    ctx.stroke();

    /* icon */
    ctx.font = "12px Segoe UI Emoji";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    const iconText = node.type === "folder"
      ? (node.expanded && node.children.length ? "📂" : "📁")
      : getFileIcon(node.name);
    ctx.fillText(iconText, nx + 14, y);

    /* label */
    ctx.font = `${isSel ? "500" : "400"} 11px Segoe UI, system-ui, sans-serif`;
    ctx.fillStyle    = isSel   ? "#93c5fd"
                     : isFound ? "#6ee7b7"
                     : node.type === "folder" ? "#e2e8f0" : "#94a3b8";
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    let label = node.name;
    if (label.length > 11) label = label.slice(0, 10) + "…";
    ctx.fillText(label, nx + 26, y);

    if (node.expanded) node.children.forEach(drawNode);
  }
  drawNode(root);

  /* click on canvas */
  canvas.onclick = function (e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let hit = null;
    function hitTest(node) {
      const nx = node.x - NODE_W / 2, ny = node.y - NODE_H / 2;
      if (mx >= nx && mx <= nx + NODE_W && my >= ny && my <= ny + NODE_H) hit = node;
      if (node.expanded) node.children.forEach(hitTest);
    }
    hitTest(root);
    if (hit) select(hit);
  };
}

/* ── MASTER RENDER ───────────────────────────── */

function renderAll() {
  renderTree();
  updateBreadcrumb();
  updateInfo();
  updateHeader();
  drawCanvas();
}

function select(node) {
  selected        = node;
  searchHighlight = null;
  renderAll();
}

/* ── TAB SWITCHING ───────────────────────────── */

function switchTab(id, el) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  el.classList.add("active");
  document.getElementById(id === "viz" ? "vizPanel" : "infoPanel").classList.add("active");
  if (id === "viz") setTimeout(drawCanvas, 10);
}

/* ── ACTIONS ─────────────────────────────────── */

function createFolder() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) { toast("Enter a name first", "#f59e0b"); return; }
  if (selected.type === "file") { toast("Select a folder to add into", "#ef4444"); return; }
  const node = new TreeNode(name, "folder", selected);
  selected.children.push(node);
  selected.expanded = true;
  document.getElementById("nameInput").value = "";
  renderAll();
  toast(`Folder "${name}" created`, "#10b981");
}

function createFile() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) { toast("Enter a name first", "#f59e0b"); return; }
  if (selected.type === "file") { toast("Select a folder to add into", "#ef4444"); return; }
  const node = new TreeNode(name, "file", selected);
  selected.children.push(node);
  selected.expanded = true;
  document.getElementById("nameInput").value = "";
  renderAll();
  toast(`File "${name}" created`, "#60a5fa");
}

function deleteNode() {
  if (selected === root) { toast("Cannot delete root", "#ef4444"); return; }
  const name   = selected.name;
  const parent = selected.parent;
  parent.children = parent.children.filter(c => c !== selected);
  selected = parent;
  renderAll();
  toast(`"${name}" deleted`, "#ef4444");
}

function renameSelected() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) { toast("Enter a new name", "#f59e0b"); return; }
  if (selected === root) { toast("Cannot rename root", "#ef4444"); return; }
  const old = selected.name;
  selected.name = name;
  document.getElementById("nameInput").value = "";
  renderAll();
  toast(`Renamed "${old}" → "${name}"`, "#a78bfa");
}

function searchNode() {
  const target = document.getElementById("nameInput").value.trim();
  if (!target) { toast("Enter a search term", "#f59e0b"); return; }
  let found = null;
  function dfs(node) {
    if (node.name.toLowerCase() === target.toLowerCase()) { found = node; return; }
    node.children.forEach(dfs);
  }
  dfs(root);
  if (found) {
    searchHighlight = found;
    selected        = found;
    expandPathTo(found);
    renderAll();
    toast(`Found: ${getPath(found)}`, "#10b981");
  } else {
    toast(`"${target}" not found`, "#ef4444");
  }
}

function collapseAll() {
  function collapse(n) { n.expanded = false; n.children.forEach(collapse); }
  root.children.forEach(collapse);
  root.expanded = true;
  renderAll();
  toast("All collapsed", "#94a3b8");
}

/* ── TOAST ───────────────────────────────────── */

function toast(msg, color = "#60a5fa") {
  document.getElementById("toastMsg").textContent       = msg;
  document.getElementById("toastDot").style.background  = color;
  const t = document.getElementById("toast");
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2500);
}

/* ── INIT ────────────────────────────────────── */

window.addEventListener("resize", () => {
  if (document.getElementById("vizPanel").classList.contains("active")) drawCanvas();
});

renderAll();
setTimeout(drawCanvas, 50);