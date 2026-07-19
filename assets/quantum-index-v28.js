(function () {
  const views = [
    ["quantum-global-institution-v28", "量子机构 / 全球", "全球机构对比", "./quantum-global-v28.html", "按 149 个国家和地区着色，展示全部实际机构。", 4],
    ["quantum-cnus-institution-v28", "量子机构 / 中美", "中美机构对比", "./quantum-cnus-v28.html", "只保留中国和美国机构，直接观察两国机构群与跨国迁移。", 3],
    ["quantum-china-institution-v28", "量子机构 / 中国机构", "中国机构对比", "./quantum-china-v28.html", "保留全部中国机构，按解析出的机构所在城市着色。", 2],
  ];
  const number = (value) => new Intl.NumberFormat("zh-CN").format(value ?? 0);

  async function loadJson(url) {
    const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function init() {
    const status = document.getElementById("indexStatusV28");
    try {
      const [datasets, qa] = await Promise.all([
        loadJson("./data/quantum-institution-v28/dataset-summary-v28.json"),
        loadJson("./data/quantum-institution-v28/quantum-institution-mobility-summary-v28.json"),
      ]);
      const map = Object.fromEntries(datasets.datasets.map((item) => [item.dataset_id, item]));
      document.getElementById("affiliationCountV28").textContent = number(qa.all_affiliation_author_year_count);
      document.getElementById("cityCoverageV28").textContent = `${number(qa.china_institution_resolved_city_count)} / ${number(qa.china_institution_count)} 家中国机构已识别城市，覆盖率 ${(qa.china_city_resolution_rate * 100).toFixed(2)}%；未可靠识别的机构保留在“城市未解析”组。`;
      document.getElementById("datasetCardsV28").innerHTML = views.map(([id, label, title, href, copy, threshold]) => {
        const item = map[id];
        return `<article class="quantum-index-card quantum-index-view">
          <div class="quantum-index-view-top"><div><span class="quantum-index-pill">${label}</span><h2 class="quantum-index-view-title">${title}</h2></div><span class="quantum-index-pill">机构层</span></div>
          <p class="quantum-index-view-copy">${copy}</p>
          <div class="quantum-index-view-stats">
            <div class="quantum-index-view-stat"><span class="quantum-index-view-stat-label">机构节点</span><strong class="quantum-index-view-stat-value">${number(item.node_count)}</strong></div>
            <div class="quantum-index-view-stat"><span class="quantum-index-view-stat-label">迁移边</span><strong class="quantum-index-view-stat-value">${number(item.edge_count)}</strong></div>
            <div class="quantum-index-view-stat"><span class="quantum-index-view-stat-label">对比分组</span><strong class="quantum-index-view-stat-value">${number(item.group_count)}</strong></div>
          </div>
          <div class="quantum-index-view-actions"><a class="quantum-index-link primary" href="${href}">打开机构图</a><a class="quantum-index-link" href="./index.html?datasetId=${id}&level=institution&t=22&playing=false&minExposureLog=${threshold}&colorBy=country&pointScale=2.5&haloScale=1.6&sizeContrast=0">主地图打开</a></div>
        </article>`;
      }).join("");
      status.textContent = `机构级 v28 已加载，时间范围 ${datasets.datasets[0].years[0]}-${datasets.datasets[0].years.at(-1)}。`;
    } catch (error) {
      status.textContent = `机构级摘要加载失败：${String(error)}`;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
