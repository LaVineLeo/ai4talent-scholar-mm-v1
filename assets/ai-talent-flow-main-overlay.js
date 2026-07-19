const QUANTUM_DATASET_SUMMARY_URL = "./data/quantum-mobility-v26/original-dataset-summary-v26.json";
let aiFlowModeId = "global";

const AI_FLOW_DATASET_CONFIG = {
  global: {
    datasetId: "quantum-global",
    level: "country",
    minExposureLog: 0,
    label: "全球",
    headline: "全球量子人才流动",
    description: "基于东壁量子论文作者轨迹，按国家年度迁移关系重建原版主地图数据集。",
  },
  "cn-us": {
    datasetId: "quantum-cnus",
    level: "country",
    minExposureLog: 0,
    label: "中美",
    headline: "中美量子人才对比",
    description: "聚焦与中国、美国相连的国家迁移网络，用于观察量子人才跨国流向。",
  },
  china: {
    datasetId: "quantum-china",
    level: "institution",
    minExposureLog: 0,
    label: "中国",
    headline: "中国机构量子人才转移",
    description: "基于中国机构地址中的城市信息，按中国机构年度迁移关系重建主地图数据集。",
  },
};

const AI_FLOW_DEFAULT_QUERY = {
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
  axisX: "0",
  axisY: "1",
  axisZ: "2",
  linkK: "2",
  labelCount: "30",
  autoRotate: "true",
  halo: "true",
  playing: "true",
  view2d: "true",
  dimOnSelect: "true",
};

function aiFlowFormatNumber(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("zh-CN").format(value);
  }
  return value ?? "-";
}

function aiFlowStatusLabel(status) {
  if (status === "ready") return "已就绪";
  if (status === "waiting") return "待数据";
  if (status === "warning") return "待修复";
  return status || "未知";
}

function getAiFlowDatasetConfig(modeId) {
  return AI_FLOW_DATASET_CONFIG[modeId] || AI_FLOW_DATASET_CONFIG.global;
}

function buildAiFlowSwitchUrl(modeId) {
  const config = getAiFlowDatasetConfig(modeId);
  const url = new URL(window.location.href);
  Object.entries(AI_FLOW_DEFAULT_QUERY).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  url.searchParams.set("datasetId", config.datasetId);
  url.searchParams.set("level", config.level);
  url.searchParams.set("minExposureLog", String(config.minExposureLog));
  return url.toString();
}

function switchAiFlowDataset(modeId) {
  window.location.href = buildAiFlowSwitchUrl(modeId);
}

function createOverlayShell() {
  if (document.getElementById("aiFlowOverlay")) {
    return;
  }
  const toggle = document.createElement("button");
  toggle.className = "ai-flow-overlay-toggle";
  toggle.id = "aiFlowOverlayToggle";
  toggle.type = "button";
  toggle.innerHTML = `<div><strong>量子人才流动</strong><span>全球 / 中美 / 中国</span></div>`;

  const overlay = document.createElement("aside");
  overlay.className = "ai-flow-overlay";
  overlay.id = "aiFlowOverlay";
  overlay.innerHTML = `
    <div class="ai-flow-overlay-header">
      <div class="ai-flow-overlay-titlebar">
        <h2>量子人才流动</h2>
        <button class="ai-flow-overlay-close" id="aiFlowOverlayClose" type="button">关闭</button>
      </div>
      <p class="ai-flow-overlay-subtitle">当前入口直接读取东壁量子领域全量结果，并切换到 scholar-mm 原版主地图兼容 dataset。</p>
      <div class="ai-flow-overlay-actions">
        <button class="ai-flow-overlay-refresh" id="aiFlowOverlayRefresh" type="button">刷新</button>
      </div>
    </div>
    <div class="ai-flow-overlay-body" id="aiFlowOverlayBody">
      <div class="ai-flow-overlay-panel">正在读取量子数据集摘要…</div>
    </div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(overlay);

  toggle.addEventListener("click", () => overlay.classList.add("open"));
  overlay.querySelector("#aiFlowOverlayClose")?.addEventListener("click", () => {
    overlay.classList.remove("open");
  });
}

async function loadAiFlowStatus() {
  const response = await fetch(`${QUANTUM_DATASET_SUMMARY_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function buildModePayload(summary) {
  const datasetMap = Object.fromEntries((summary.datasets || []).map((item) => [item.dataset_id, item]));
  return [
    {
      id: "global",
      status: datasetMap["quantum-global"] ? "ready" : "waiting",
      metrics: datasetMap["quantum-global"]
        ? [
            { label: "国家节点", value: datasetMap["quantum-global"].node_count },
            { label: "迁移边", value: datasetMap["quantum-global"].edge_count },
            { label: "年份窗口", value: datasetMap["quantum-global"].year_count },
          ]
        : [],
      dataset: datasetMap["quantum-global"] || null,
    },
    {
      id: "cn-us",
      status: datasetMap["quantum-cnus"] ? "ready" : "waiting",
      metrics: datasetMap["quantum-cnus"]
        ? [
            { label: "国家节点", value: datasetMap["quantum-cnus"].node_count },
            { label: "迁移边", value: datasetMap["quantum-cnus"].edge_count },
            { label: "年份窗口", value: datasetMap["quantum-cnus"].year_count },
          ]
        : [],
      dataset: datasetMap["quantum-cnus"] || null,
    },
    {
      id: "china",
      status: datasetMap["quantum-china"] ? "ready" : "waiting",
      metrics: datasetMap["quantum-china"]
        ? [
            { label: "城市节点", value: datasetMap["quantum-china"].node_count },
            { label: "迁移边", value: datasetMap["quantum-china"].edge_count },
            { label: "年份窗口", value: datasetMap["quantum-china"].year_count },
          ]
        : [],
      dataset: datasetMap["quantum-china"] || null,
    },
  ].map((mode) => {
    const config = getAiFlowDatasetConfig(mode.id);
    return {
      ...mode,
      label: config.label,
      headline: config.headline,
      description: config.description,
      next_steps: mode.dataset
        ? [
            `datasetId=${config.datasetId}`,
            `时间范围 ${mode.dataset.years[0]}-${mode.dataset.years[mode.dataset.years.length - 1]}`,
            `最大曝光 log2 ${mode.dataset.max_exposure_log2}`,
          ]
        : ["当前模式尚未生成量子 dataset。"],
    };
  });
}

function renderOverlay(summary) {
  const body = document.getElementById("aiFlowOverlayBody");
  if (!body) return;
  const modes = buildModePayload(summary);
  if (!modes.find((item) => item.id === aiFlowModeId) && modes.length > 0) {
    aiFlowModeId = modes[0].id;
  }
  const activeMode = modes.find((item) => item.id === aiFlowModeId) || modes[0];
  if (!activeMode) {
    body.innerHTML = `<div class="ai-flow-overlay-panel">没有可显示的量子模式。</div>`;
    return;
  }

  body.innerHTML = `
    <div class="ai-flow-overlay-tabs">
      ${modes
        .map(
          (mode) => `
            <button class="ai-flow-overlay-tab ${mode.id === aiFlowModeId ? "active" : ""}" data-ai-flow-mode="${mode.id}" type="button">
              ${mode.label}
            </button>
          `,
        )
        .join("")}
    </div>
    <section class="ai-flow-overlay-panel">
      <span class="ai-flow-overlay-status ${activeMode.status}">${aiFlowStatusLabel(activeMode.status)}</span>
      <h3>${activeMode.headline}</h3>
      <p class="ai-flow-overlay-desc">${activeMode.description}</p>
      <div class="ai-flow-overlay-metrics">
        ${(activeMode.metrics || [])
          .map(
            (metric) => `
              <div class="ai-flow-overlay-metric">
                <span class="ai-flow-overlay-label">${metric.label}</span>
                <strong class="ai-flow-overlay-value">${aiFlowFormatNumber(metric.value)}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="ai-flow-overlay-steps">
        ${(activeMode.next_steps || [])
          .map((step) => `<div class="ai-flow-overlay-step">${step}</div>`)
          .join("")}
      </div>
      <div class="ai-flow-overlay-link-row">
        <button
          class="ai-flow-overlay-switch"
          data-ai-flow-switch="${activeMode.id}"
          type="button"
          ${activeMode.status === "ready" ? "" : "disabled"}
        >
          ${activeMode.status === "ready" ? "切换到主地图此视图" : "当前视图未就绪"}
        </button>
      </div>
    </section>
  `;

  body.querySelectorAll("[data-ai-flow-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      aiFlowModeId = button.getAttribute("data-ai-flow-mode") || "global";
      renderOverlay(summary);
    });
  });
  body.querySelectorAll("[data-ai-flow-switch]").forEach((button) => {
    button.addEventListener("click", () => {
      const modeId = button.getAttribute("data-ai-flow-switch") || "global";
      switchAiFlowDataset(modeId);
    });
  });
}

async function refreshOverlay() {
  const body = document.getElementById("aiFlowOverlayBody");
  if (body) {
    body.innerHTML = `<div class="ai-flow-overlay-panel">正在刷新量子数据集摘要…</div>`;
  }
  try {
    const summary = await loadAiFlowStatus();
    renderOverlay(summary);
  } catch (error) {
    if (body) {
      body.innerHTML = `<div class="ai-flow-overlay-panel">读取失败：${String(error)}</div>`;
    }
  }
}

function initAiFlowOverlay() {
  createOverlayShell();
  document.getElementById("aiFlowOverlayRefresh")?.addEventListener("click", refreshOverlay);
  refreshOverlay();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAiFlowOverlay, { once: true });
} else {
  initAiFlowOverlay();
}
