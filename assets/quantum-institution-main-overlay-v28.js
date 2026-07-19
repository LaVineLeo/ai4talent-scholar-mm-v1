const QUANTUM_INSTITUTION_SUMMARY_V28 = "./data/quantum-institution-v28/dataset-summary-v28.json";
let quantumModeV28 = "global";

const QUANTUM_MODES_V28 = {
  global: {
    datasetId: "quantum-global-institution-v28",
    label: "全球",
    headline: "全球量子机构人才流动",
    description: "每个点是一家实际机构，按国家着色。",
    minExposureLog: 4,
  },
  "cn-us": {
    datasetId: "quantum-cnus-institution-v28",
    label: "中美",
    headline: "中美量子机构对比",
    description: "只显示中国与美国机构，按两国着色。",
    minExposureLog: 3,
  },
  china: {
    datasetId: "quantum-china-institution-v28",
    label: "中国",
    headline: "中国机构量子机构对比",
    description: "显示全部中国机构，按机构所在城市着色。",
    minExposureLog: 2,
  },
};

const DEFAULTS_V28 = {
  level: "institution",
  t: "22",
  colorBy: "country",
  playSpeed: "0.35",
  sizeContrast: "0.0",
  linkOpacity: "0.05",
  linkMinSim: "-1",
  haloScale: "1.6",
  pointScale: "2.5",
  pointOpacity: "0.85",
  trail: "0.5",
  spread: "0.85",
  linkK: "2",
  labelCount: "30",
  autoRotate: "true",
  halo: "true",
  playing: "false",
  view2d: "true",
  dimOnSelect: "true",
};

const formatV28 = (value) => typeof value === "number" ? new Intl.NumberFormat("zh-CN").format(value) : value ?? "-";

function switchQuantumDatasetV28(modeId) {
  const url = new URL(window.location.href);
  Object.entries(DEFAULTS_V28).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("datasetId", QUANTUM_MODES_V28[modeId].datasetId);
  url.searchParams.set("minExposureLog", String(QUANTUM_MODES_V28[modeId].minExposureLog));
  window.location.href = url.toString();
}

function createQuantumOverlayV28() {
  const toggle = document.createElement("button");
  toggle.className = "ai-flow-overlay-toggle";
  toggle.innerHTML = "<div><strong>量子机构流动 v28</strong><span>全球 / 中美 / 中国机构</span></div>";
  const overlay = document.createElement("aside");
  overlay.className = "ai-flow-overlay";
  overlay.id = "quantumInstitutionOverlayV28";
  overlay.innerHTML = `<div class="ai-flow-overlay-header">
    <div class="ai-flow-overlay-titlebar"><h2>量子机构人才流动</h2><button class="ai-flow-overlay-close" type="button">关闭</button></div>
    <p class="ai-flow-overlay-subtitle">当前入口使用机构级 v28 真实数据，每个点均为研究机构。</p>
    <div class="ai-flow-overlay-actions"><a class="ai-flow-overlay-refresh" href="./quantum-index-v28.html">专题首页</a></div>
  </div><div class="ai-flow-overlay-body" id="quantumInstitutionBodyV28"><div class="ai-flow-overlay-panel">正在读取机构数据集摘要…</div></div>`;
  document.body.append(toggle, overlay);
  toggle.addEventListener("click", () => overlay.classList.add("open"));
  overlay.querySelector(".ai-flow-overlay-close").addEventListener("click", () => overlay.classList.remove("open"));
}

function renderQuantumOverlayV28(summary) {
  const body = document.getElementById("quantumInstitutionBodyV28");
  const datasetMap = Object.fromEntries(summary.datasets.map((item) => [item.dataset_id, item]));
  const mode = QUANTUM_MODES_V28[quantumModeV28];
  const dataset = datasetMap[mode.datasetId];
  body.innerHTML = `<div class="ai-flow-overlay-tabs">${Object.entries(QUANTUM_MODES_V28).map(([id, item]) => `<button class="ai-flow-overlay-tab ${id === quantumModeV28 ? "active" : ""}" data-mode-v28="${id}" type="button">${item.label}</button>`).join("")}</div>
    <section class="ai-flow-overlay-panel"><span class="ai-flow-overlay-status ready">已就绪</span><h3>${mode.headline}</h3><p class="ai-flow-overlay-desc">${mode.description}</p>
      <div class="ai-flow-overlay-metrics">
        <div class="ai-flow-overlay-metric"><span class="ai-flow-overlay-label">机构节点</span><strong class="ai-flow-overlay-value">${formatV28(dataset.node_count)}</strong></div>
        <div class="ai-flow-overlay-metric"><span class="ai-flow-overlay-label">迁移边</span><strong class="ai-flow-overlay-value">${formatV28(dataset.edge_count)}</strong></div>
        <div class="ai-flow-overlay-metric"><span class="ai-flow-overlay-label">对比分组</span><strong class="ai-flow-overlay-value">${formatV28(dataset.group_count)}</strong></div>
      </div><div class="ai-flow-overlay-link-row"><button class="ai-flow-overlay-switch" type="button" data-switch-v28="${quantumModeV28}">切换到主地图此视图</button></div>
    </section>`;
  body.querySelectorAll("[data-mode-v28]").forEach((button) => button.addEventListener("click", () => {
    quantumModeV28 = button.dataset.modeV28;
    renderQuantumOverlayV28(summary);
  }));
  body.querySelector("[data-switch-v28]").addEventListener("click", () => switchQuantumDatasetV28(quantumModeV28));
}

async function initQuantumOverlayV28() {
  createQuantumOverlayV28();
  const body = document.getElementById("quantumInstitutionBodyV28");
  try {
    const response = await fetch(`${QUANTUM_INSTITUTION_SUMMARY_V28}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    renderQuantumOverlayV28(await response.json());
  } catch (error) {
    body.innerHTML = `<div class="ai-flow-overlay-panel">机构数据读取失败：${String(error)}</div>`;
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initQuantumOverlayV28, { once: true });
else initQuantumOverlayV28();
