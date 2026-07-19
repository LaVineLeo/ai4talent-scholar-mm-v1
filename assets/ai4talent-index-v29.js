(function () {
  const views = [
    { id: "quantum-global-institution-v28", title: "全球机构", href: "./ai4talent-global-v29.html", copy: "全球全部量子研究机构，按国家或地区着色。", accent: "全球" },
    { id: "quantum-cnus-institution-v28", title: "中美机构", href: "./ai4talent-cnus-v29.html", copy: "中国与美国量子研究机构直接对比，颜色表示两国归属。", accent: "中美" },
    { id: "quantum-china-institution-v28", title: "中国机构", href: "./ai4talent-china-v29.html", copy: "中国全部量子研究机构，按机构所在城市着色。", accent: "中国" },
  ];
  const format = (value) => new Intl.NumberFormat("zh-CN").format(value ?? 0);

  async function loadJson(url) {
    const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function init() {
    try {
      const [summary, qa] = await Promise.all([
        loadJson("./data/quantum-institution-v28/dataset-summary-v28.json"),
        loadJson("./data/quantum-institution-v28/quantum-institution-mobility-summary-v28.json"),
      ]);
      const datasets = Object.fromEntries(summary.datasets.map((item) => [item.dataset_id, item]));
      document.getElementById("a4tPaperCountV29").textContent = format(qa.row_count);
      document.getElementById("a4tAffiliationCountV29").textContent = format(qa.all_affiliation_author_year_count);
      document.getElementById("a4tGlobalNodeCountV29").textContent = format(datasets[views[0].id].node_count);
      document.getElementById("a4tCityCoverageV29").textContent = `${format(qa.china_institution_resolved_city_count)} / ${format(qa.china_institution_count)} 家中国机构已识别城市，覆盖率 ${(qa.china_city_resolution_rate * 100).toFixed(2)}%；未可靠识别的机构保留在“城市未解析”组。`;
      document.getElementById("a4tViewListV29").innerHTML = views.map((view) => {
        const dataset = datasets[view.id];
        return `<article class="a4t-view-row">
          <h3>${view.title}</h3><p>${view.copy}</p>
          <div class="a4t-view-stat"><span>机构节点</span><strong>${format(dataset.node_count)}</strong></div>
          <div class="a4t-view-stat"><span>迁移边</span><strong>${format(dataset.edge_count)}</strong></div>
          <div class="a4t-view-stat"><span>时间线</span><strong>2000-2026</strong></div>
          <a class="a4t-command" href="${view.href}">打开${view.accent}视图</a>
        </article>`;
      }).join("");
    } catch (error) {
      document.getElementById("a4tViewListV29").innerHTML = `<p>AI4Talent 数据摘要读取失败：${String(error)}</p>`;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
