(function () {
  const config = window.__QUANTUM_VIEW_CONFIG_V28__ || {};
  const summaryUrl = "./data/quantum-institution-v28/dataset-summary-v28.json";
  const views = {
    global: ["量子机构 / 全球", "./quantum-global-v28.html", "quantum-global-institution-v28"],
    "cn-us": ["量子机构 / 中美", "./quantum-cnus-v28.html", "quantum-cnus-institution-v28"],
    china: ["量子机构 / 中国", "./quantum-china-v28.html", "quantum-china-institution-v28"],
  };

  function formatNumber(value) {
    return typeof value === "number" ? new Intl.NumberFormat("zh-CN").format(value) : value ?? "-";
  }

  function createShell() {
    const shell = document.createElement("aside");
    shell.id = "quantumViewShellV28";
    shell.className = "quantum-view-shell";
    shell.innerHTML = `
      <section class="quantum-view-card">
        <div class="quantum-view-header">
          <p class="quantum-view-eyebrow">Institution Mobility · v28</p>
          <h1 class="quantum-view-title">${config.title || "量子机构人才流动"}</h1>
          <p class="quantum-view-copy">${config.description || "每个点均为实际机构，位置和邻居由作者机构迁移关系计算。"}</p>
          <div class="quantum-view-links">
            <a class="quantum-view-link" href="./quantum-index-v28.html">专题首页</a>
            ${Object.entries(views).map(([viewId, item]) => `
              <a class="quantum-view-link ${config.viewId === viewId ? "active" : ""}" href="${item[1]}">${item[0]}</a>
            `).join("")}
            <a class="quantum-view-link" href="./index.html?datasetId=${config.datasetId}&level=institution">主地图入口</a>
          </div>
        </div>
        <div class="quantum-view-stats" id="quantumViewStatsV28">
          <div class="quantum-view-stat"><span class="quantum-view-stat-label">机构节点</span><strong class="quantum-view-stat-value">加载中</strong></div>
          <div class="quantum-view-stat"><span class="quantum-view-stat-label">迁移边</span><strong class="quantum-view-stat-value">加载中</strong></div>
          <div class="quantum-view-stat"><span class="quantum-view-stat-label">对比分组</span><strong class="quantum-view-stat-value">加载中</strong></div>
        </div>
        <div class="quantum-view-status" id="quantumViewStatusV28">正在读取机构级数据集摘要。</div>
      </section>`;
    document.body.appendChild(shell);
  }

  async function init() {
    createShell();
    const status = document.getElementById("quantumViewStatusV28");
    try {
      const response = await fetch(`${summaryUrl}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const summary = await response.json();
      const dataset = (summary.datasets || []).find((item) => item.dataset_id === config.datasetId);
      if (!dataset) throw new Error("未找到当前机构数据集");
      document.getElementById("quantumViewStatsV28").innerHTML = `
        <div class="quantum-view-stat"><span class="quantum-view-stat-label">机构节点</span><strong class="quantum-view-stat-value">${formatNumber(dataset.node_count)}</strong></div>
        <div class="quantum-view-stat"><span class="quantum-view-stat-label">迁移边</span><strong class="quantum-view-stat-value">${formatNumber(dataset.edge_count)}</strong></div>
        <div class="quantum-view-stat"><span class="quantum-view-stat-label">对比分组</span><strong class="quantum-view-stat-value">${formatNumber(dataset.group_count)}</strong></div>`;
      status.textContent = `实际机构数据，${dataset.years[0]}-${dataset.years.at(-1)}，默认显示当年关联作者不少于 ${2 ** config.minExposureLog} 人的机构；侧栏可降到 0 查看全量。`;
    } catch (error) {
      status.textContent = `机构数据摘要读取失败：${String(error)}`;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
