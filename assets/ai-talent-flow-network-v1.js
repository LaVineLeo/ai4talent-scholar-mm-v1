const NETWORK_URL = "./data/ai-talent-flow-v1/network-v1.json";

const networkState = {
  payload: null,
  modeId: "global",
  yearIndex: 0,
  playing: false,
  playbackMs: 1400,
  labelCount: 12,
  nodeScale: 1.6,
  edgeOpacity: 0.12,
  timerId: null,
};

const canvas = document.getElementById("talentFlowCanvas");
const loadingNode = document.getElementById("talentFlowLoading");
const yearNode = document.getElementById("talentFlowYear");
const yearTextNode = document.getElementById("talentFlowYearText");
const legendNode = document.getElementById("talentFlowLegend");
const statsNode = document.getElementById("talentFlowStats");
const modesNode = document.getElementById("talentFlowModes");
const playButton = document.getElementById("talentFlowPlay");
const yearRange = document.getElementById("talentFlowYearRange");
const speedRange = document.getElementById("talentFlowSpeedRange");
const labelRange = document.getElementById("talentFlowLabelRange");
const nodeRange = document.getElementById("talentFlowNodeRange");
const edgeRange = document.getElementById("talentFlowEdgeRange");

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgba(hex, alpha) {
  const color = hexToRgb(hex);
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(value ?? 0);
}

function getCurrentMode() {
  return (networkState.payload?.modes || []).find((mode) => mode.id === networkState.modeId) || null;
}

function getCurrentSnapshot() {
  const mode = getCurrentMode();
  if (!mode) return null;
  const year = mode.years[networkState.yearIndex];
  return mode.snapshots[String(year)] || null;
}

function syncCanvasSize() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
}

function toScreenPoint(node, width, height) {
  const marginX = width * 0.12;
  const marginY = height * 0.14;
  const usableWidth = width - marginX * 2;
  const usableHeight = height - marginY * 2;
  return {
    x: marginX + ((node.x + 1) / 2) * usableWidth,
    y: marginY + ((1 - (node.y + 1) / 2)) * usableHeight,
  };
}

function renderLegend(nodes) {
  if (!legendNode) return;
  const topNodes = [...nodes]
    .sort((left, right) => right.resident_author_count - left.resident_author_count)
    .slice(0, 8);
  legendNode.innerHTML = topNodes
    .map(
      (node) => `
        <div class="talent-map-legend-item">
          <span class="talent-map-legend-dot" style="background:${node.color}"></span>
          <span class="talent-map-legend-label">${node.short_label}</span>
          <span class="talent-map-legend-value">${formatNumber(node.resident_author_count)}</span>
        </div>
      `,
    )
    .join("");
}

function renderStats(snapshot) {
  if (!statsNode || !snapshot) return;
  const summary = snapshot.summary || {};
  statsNode.innerHTML = `
    <div class="talent-map-stat-card">
      <span class="talent-map-stat-label">节点</span>
      <strong>${formatNumber(summary.node_count)}</strong>
    </div>
    <div class="talent-map-stat-card">
      <span class="talent-map-stat-label">连线</span>
      <strong>${formatNumber(summary.edge_count)}</strong>
    </div>
    <div class="talent-map-stat-card">
      <span class="talent-map-stat-label">驻留作者</span>
      <strong>${formatNumber(summary.resident_total)}</strong>
    </div>
  `;
}

function renderModeButtons() {
  if (!modesNode || !networkState.payload) return;
  modesNode.innerHTML = networkState.payload.modes
    .map(
      (mode) => `
        <button class="talent-map-mode-button ${mode.id === networkState.modeId ? "active" : ""}" data-mode-id="${mode.id}" type="button">
          ${mode.label}
        </button>
      `,
    )
    .join("");
  modesNode.querySelectorAll("[data-mode-id]").forEach((button) => {
    button.addEventListener("click", () => {
      networkState.modeId = button.getAttribute("data-mode-id") || "global";
      networkState.yearIndex = 0;
      syncYearRange();
      renderNetwork();
    });
  });
}

function syncYearRange() {
  const mode = getCurrentMode();
  if (!mode || !yearRange) return;
  yearRange.max = String(Math.max(mode.years.length - 1, 0));
  yearRange.value = String(networkState.yearIndex);
}

function renderNetwork() {
  if (!canvas || !networkState.payload) return;
  const snapshot = getCurrentSnapshot();
  const mode = getCurrentMode();
  if (!snapshot || !mode) return;

  syncCanvasSize();
  const context = canvas.getContext("2d");
  if (!context) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const gradient = context.createRadialGradient(width * 0.45, height * 0.42, 40, width * 0.45, height * 0.42, width * 0.86);
  gradient.addColorStop(0, "rgba(18, 32, 58, 0.95)");
  gradient.addColorStop(1, "rgba(6, 9, 15, 1)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const nodeMap = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const positionedNodes = snapshot.nodes.map((node) => ({
    ...node,
    ...toScreenPoint(node, width, height),
  }));
  const positionedNodeMap = new Map(positionedNodes.map((node) => [node.id, node]));

  context.lineCap = "round";
  for (const edge of snapshot.edges) {
    const source = positionedNodeMap.get(edge.source);
    const target = positionedNodeMap.get(edge.target);
    if (!source || !target) continue;
    context.beginPath();
    context.moveTo(source.x, source.y);
    const controlX = (source.x + target.x) / 2;
    const controlY = (source.y + target.y) / 2 - Math.min(width, height) * 0.04;
    context.quadraticCurveTo(controlX, controlY, target.x, target.y);
    context.strokeStyle = rgba(source.color, Math.min(networkState.edgeOpacity + edge.weight * 0.025, 0.42));
    context.lineWidth = 0.5 + Math.sqrt(edge.weight) * 0.55;
    context.stroke();
  }

  for (const node of positionedNodes) {
    const radius = (2 + Math.sqrt(Math.max(node.resident_author_count, 1)) * 0.65) * networkState.nodeScale;
    context.beginPath();
    context.arc(node.x, node.y, radius * 2.3, 0, Math.PI * 2);
    context.fillStyle = rgba(node.color, 0.12);
    context.fill();
    context.beginPath();
    context.arc(node.x, node.y, radius, 0, Math.PI * 2);
    context.fillStyle = node.color;
    context.fill();
  }

  const labelNodes = [...positionedNodes]
    .sort((left, right) => right.resident_author_count - left.resident_author_count)
    .slice(0, networkState.labelCount);
  context.font = "13px 'Trebuchet MS', 'Microsoft YaHei', sans-serif";
  context.textBaseline = "middle";
  for (const node of labelNodes) {
    context.fillStyle = "rgba(255,255,255,0.92)";
    context.strokeStyle = "rgba(4,8,12,0.92)";
    context.lineWidth = 4;
    context.strokeText(node.short_label, node.x + 8, node.y - 10);
    context.fillText(node.short_label, node.x + 8, node.y - 10);
  }

  if (yearNode) {
    yearNode.textContent = String(snapshot.year);
  }
  if (yearTextNode) {
    yearTextNode.textContent = `${mode.label} · ${snapshot.year}`;
  }
  renderLegend(positionedNodes);
  renderStats(snapshot);
}

function stopPlayback() {
  if (networkState.timerId) {
    window.clearInterval(networkState.timerId);
    networkState.timerId = null;
  }
  networkState.playing = false;
  if (playButton) {
    playButton.textContent = "播放";
  }
}

function startPlayback() {
  stopPlayback();
  networkState.playing = true;
  if (playButton) {
    playButton.textContent = "暂停";
  }
  networkState.timerId = window.setInterval(() => {
    const mode = getCurrentMode();
    if (!mode) return;
    networkState.yearIndex = (networkState.yearIndex + 1) % mode.years.length;
    syncYearRange();
    renderNetwork();
  }, networkState.playbackMs);
}

async function loadNetworkPayload() {
  const response = await fetch(`${NETWORK_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function initNetwork() {
  try {
    const payload = await loadNetworkPayload();
    networkState.payload = payload;
    renderModeButtons();
    syncYearRange();
    renderNetwork();
    if (loadingNode) {
      loadingNode.style.display = "none";
    }
  } catch (error) {
    if (loadingNode) {
      loadingNode.textContent = `网络图载入失败：${String(error)}`;
    }
  }
}

playButton?.addEventListener("click", () => {
  if (networkState.playing) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

yearRange?.addEventListener("input", () => {
  stopPlayback();
  networkState.yearIndex = Number.parseInt(yearRange.value, 10) || 0;
  renderNetwork();
});

speedRange?.addEventListener("input", () => {
  networkState.playbackMs = Number.parseInt(speedRange.value, 10) || 1400;
  if (networkState.playing) {
    startPlayback();
  }
});

labelRange?.addEventListener("input", () => {
  networkState.labelCount = Number.parseInt(labelRange.value, 10) || 0;
  renderNetwork();
});

nodeRange?.addEventListener("input", () => {
  networkState.nodeScale = Number.parseFloat(nodeRange.value) || 1.6;
  renderNetwork();
});

edgeRange?.addEventListener("input", () => {
  networkState.edgeOpacity = Number.parseFloat(edgeRange.value) || 0.12;
  renderNetwork();
});

window.addEventListener("resize", () => {
  renderNetwork();
});

initNetwork();
