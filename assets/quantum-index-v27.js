(function () {
  const summaryUrl = "./data/quantum-mobility-v26/original-dataset-summary-v26.json";
  const qaUrl = "./data/quantum_mobility_v26/qa/quantum-mobility-summary-v26.json";
  const viewMap = [
    {
      key: "quantum-global",
      id: "global",
      label: "量子 / 全球",
      title: "全球流动视图",
      href: "./quantum-global-v27.html",
      level: "country",
      copy: "按国家年度迁移关系展示量子人才的全球流向，适合观察整体格局和长期演化。",
    },
    {
      key: "quantum-cnus",
      id: "cn-us",
      label: "量子 / 中美",
      title: "中美对比视图",
      href: "./quantum-cnus-v27.html",
      level: "country",
      copy: "聚焦与中国、美国相连的迁移网络，更适合看量子人才在中美轴线周边的变化。",
    },
    {
      key: "quantum-china",
      id: "china",
      label: "量子 / 中国",
      href: "./quantum-china-v27.html",
      title: "中国机构视图",
      level: "institution",
      copy: "按中国机构年度迁移关系展示量子人才在国内的流动，用于看城市间吸引与转移。",
    },
  ];

  function formatNumber(value) {
    if (typeof value === "number") {
      return new Intl.NumberFormat("zh-CN").format(value);
    }
    return value ?? "-";
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = String(value);
    }
  }

  async function loadJson(url) {
    const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  function buildCardHtml(dataset, view) {
    const yearStart = dataset?.years?.[0] ?? "-";
    const yearEnd = dataset?.years?.[dataset.years.length - 1] ?? "-";
    return `
      <article class="quantum-index-card quantum-index-view">
        <div class="quantum-index-view-top">
          <div>
            <span class="quantum-index-pill">${view.label}</span>
            <h2 class="quantum-index-view-title">${view.title}</h2>
          </div>
          <span class="quantum-index-pill">${view.level === "country" ? "国家层" : "中国机构层"}</span>
        </div>
        <p class="quantum-index-view-copy">${view.copy}</p>
        <div class="quantum-index-view-stats">
          <div class="quantum-index-view-stat">
            <span class="quantum-index-view-stat-label">节点</span>
            <strong class="quantum-index-view-stat-value">${formatNumber(dataset?.node_count)}</strong>
          </div>
          <div class="quantum-index-view-stat">
            <span class="quantum-index-view-stat-label">迁移边</span>
            <strong class="quantum-index-view-stat-value">${formatNumber(dataset?.edge_count)}</strong>
          </div>
          <div class="quantum-index-view-stat">
            <span class="quantum-index-view-stat-label">年份窗口</span>
            <strong class="quantum-index-view-stat-value">${yearStart}-${yearEnd}</strong>
          </div>
        </div>
        <div class="quantum-index-view-actions">
          <a class="quantum-index-link primary" href="${view.href}">打开独立页</a>
          <a class="quantum-index-link" href="./index.html?datasetId=${view.key}&level=${view.level}&minExposureLog=0&colorBy=country&playSpeed=0.35&sizeContrast=0.0&linkOpacity=0.05&linkMinSim=-1&haloScale=1.6&pointScale=2.5&pointOpacity=0.85&trail=0.5&spread=0.85&axisX=0&axisY=1&axisZ=2&linkK=2&labelCount=30&autoRotate=true&halo=true&playing=true&view2d=true&dimOnSelect=true">主地图打开</a>
        </div>
      </article>
    `;
  }

  function render(summary, qa) {
    const datasetMap = Object.fromEntries((summary.datasets || []).map((item) => [item.dataset_id, item]));
    const cardRoot = document.getElementById("quantumIndexCardsV27");
    const listRoot = document.getElementById("quantumIndexDatasetListV27");
    if (cardRoot) {
      cardRoot.innerHTML = viewMap.map((view) => buildCardHtml(datasetMap[view.key], view)).join("");
    }
    if (listRoot) {
      listRoot.innerHTML = (summary.datasets || [])
        .map(
          (item) => `
            <div class="quantum-index-list-item">
              ${item.label}：节点 ${formatNumber(item.node_count)}，迁移边 ${formatNumber(item.edge_count)}，年份窗口 ${formatNumber(item.year_count)}
            </div>
          `,
        )
        .join("");
    }

    setText("quantumIndexPaperCountV27", formatNumber(qa.row_count));
    setText("quantumIndexEventCountV27", formatNumber(qa.event_count));
    setText("quantumIndexCountryEdgeCountV27", formatNumber(qa.country_move_edge_count));
    setText("quantumIndexCityEdgeCountV27", formatNumber(qa.city_move_edge_count));
    setText("quantumIndexRangeV27", `${summary.datasets?.[0]?.years?.[0] ?? "-"}-${summary.datasets?.[0]?.years?.[summary.datasets?.[0]?.years.length - 1] ?? "-"}`);
    setText("quantumIndexResolvedCityCountV27", `${formatNumber(qa.china_institution_resolved_count)} / ${formatNumber(qa.china_institution_count)}`);
  }

  async function init() {
    const status = document.getElementById("quantumIndexStatusV27");
    try {
      const [summary, qa] = await Promise.all([loadJson(summaryUrl), loadJson(qaUrl)]);
      render(summary, qa);
      if (status) {
        status.textContent = "量子专题首页已加载当前工作区全量东壁数据，可直接进入三个独立视图。";
      }
    } catch (error) {
      if (status) {
        status.textContent = `量子专题摘要加载失败：${String(error)}`;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
