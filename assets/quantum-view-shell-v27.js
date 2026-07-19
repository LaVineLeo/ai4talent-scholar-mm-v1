(function () {
  const config = window.__QUANTUM_VIEW_CONFIG_V27__ || {};
  const summaryUrl = "./data/quantum-mobility-v26/original-dataset-summary-v26.json";
  const viewMap = {
    global: {
      href: "./quantum-global-v27.html",
      label: "量子 / 全球",
      datasetId: "quantum-global",
    },
    "cn-us": {
      href: "./quantum-cnus-v27.html",
      label: "量子 / 中美",
      datasetId: "quantum-cnus",
    },
    china: {
      href: "./quantum-china-v27.html",
      label: "量子 / 中国",
      datasetId: "quantum-china",
    },
  };

  function formatNumber(value) {
    if (typeof value === "number") {
      return new Intl.NumberFormat("zh-CN").format(value);
    }
    return value ?? "-";
  }

  function createShell() {
    if (document.getElementById("quantumViewShellV27")) {
      return document.getElementById("quantumViewShellV27");
    }
    const shell = document.createElement("aside");
    shell.id = "quantumViewShellV27";
    shell.className = "quantum-view-shell";
    shell.innerHTML = `
      <section class="quantum-view-card">
        <div class="quantum-view-header">
          <p class="quantum-view-eyebrow">Quantum Talent Flow</p>
          <h1 class="quantum-view-title">${config.title || "量子人才流动"}</h1>
          <p class="quantum-view-copy">${config.description || "基于东壁量子全量数据，使用 scholar-mm 原版渲染器直接展示。"}</p>
          <div class="quantum-view-links">
            <a class="quantum-view-link" href="./quantum-index-v27.html">专题首页</a>
            ${Object.entries(viewMap)
              .map(
                ([viewId, item]) => `
                  <a class="quantum-view-link ${config.viewId === viewId ? "active" : ""}" href="${item.href}">
                    ${item.label}
                  </a>
                `,
              )
              .join("")}
            <a class="quantum-view-link" href="./index.html?datasetId=${config.datasetId || "quantum-global"}&level=${config.level || "country"}">主地图入口</a>
          </div>
        </div>
        <div class="quantum-view-stats" id="quantumViewStatsV27">
          <div class="quantum-view-stat">
            <span class="quantum-view-stat-label">节点</span>
            <strong class="quantum-view-stat-value">加载中</strong>
          </div>
          <div class="quantum-view-stat">
            <span class="quantum-view-stat-label">迁移边</span>
            <strong class="quantum-view-stat-value">加载中</strong>
          </div>
          <div class="quantum-view-stat">
            <span class="quantum-view-stat-label">年份窗口</span>
            <strong class="quantum-view-stat-value">加载中</strong>
          </div>
        </div>
        <div class="quantum-view-status" id="quantumViewStatusV27">
          默认参数已锁定到量子全量数据视图，可直接播放和切换时间。
        </div>
      </section>
    `;
    document.body.appendChild(shell);
    return shell;
  }

  async function loadSummary() {
    const response = await fetch(`${summaryUrl}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  function renderStats(summary) {
    const datasetId = (config.datasetId || "").trim();
    const dataset = (summary.datasets || []).find((item) => item.dataset_id === datasetId);
    const statsRoot = document.getElementById("quantumViewStatsV27");
    const statusRoot = document.getElementById("quantumViewStatusV27");
    if (!statsRoot || !statusRoot || !dataset) {
      if (statusRoot) {
        statusRoot.textContent = "未找到当前页面对应的量子 dataset 摘要。";
      }
      return;
    }
    statsRoot.innerHTML = `
      <div class="quantum-view-stat">
        <span class="quantum-view-stat-label">节点</span>
        <strong class="quantum-view-stat-value">${formatNumber(dataset.node_count)}</strong>
      </div>
      <div class="quantum-view-stat">
        <span class="quantum-view-stat-label">迁移边</span>
        <strong class="quantum-view-stat-value">${formatNumber(dataset.edge_count)}</strong>
      </div>
      <div class="quantum-view-stat">
        <span class="quantum-view-stat-label">年份窗口</span>
        <strong class="quantum-view-stat-value">${formatNumber(dataset.year_count)}</strong>
      </div>
    `;
    statusRoot.textContent = `当前页面使用 ${dataset.label}，时间范围 ${dataset.years[0]}-${dataset.years[dataset.years.length - 1]}，最小曝光阈值固定为 ${dataset.min_exposure_log}。`;
  }

  async function init() {
    createShell();
    try {
      const summary = await loadSummary();
      renderStats(summary);
    } catch (error) {
      const statusRoot = document.getElementById("quantumViewStatusV27");
      if (statusRoot) {
        statusRoot.textContent = `量子摘要读取失败：${String(error)}`;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
