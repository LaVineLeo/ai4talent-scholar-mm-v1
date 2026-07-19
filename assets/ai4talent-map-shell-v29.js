(function () {
  const config = window.__AI4TALENT_MAP_V29__ || {
    viewId: "global",
    datasetId: "quantum-global-institution-v28",
    minExposureLog: 4,
    timeline: "2000-2026",
  };
  const summaryUrl = "./data/quantum-institution-v28/dataset-summary-v28.json";
  const views = {
    global: {
      label: "全球机构",
      shortLabel: "全球机构",
      href: "./ai4talent-global-v29.html",
      datasetId: "quantum-global-institution-v28",
      title: "AI4Talent",
      description: "全球量子人才机构流动。机构按国家或地区着色，时间线为 2000-2026。",
    },
    "cn-us": {
      label: "中美机构",
      shortLabel: "中美机构",
      href: "./ai4talent-cnus-v29.html",
      datasetId: "quantum-cnus-institution-v28",
      title: "AI4Talent",
      description: "中国与美国量子研究机构对比。颜色表示中国或美国，时间线为 2000-2026。",
    },
    china: {
      label: "中国机构",
      shortLabel: "中国机构",
      href: "./ai4talent-china-v29.html",
      datasetId: "quantum-china-institution-v28",
      title: "AI4Talent",
      description: "中国量子研究机构对比。颜色表示机构所在城市，时间线为 2000-2026。",
    },
  };
  const translations = new Map([
    ["TIME", "时间"],
    ["time", "时间"],
    ["playback speed", "播放速度"],
    ["VIEW", "视图"],
    ["view", "视图"],
    ["institutions", "机构"],
    ["countries", "国家/城市"],
    ["2D top view", "二维俯视"],
    ["auto-rotate", "自动旋转"],
    ["reset view", "重置视角"],
    ["reset settings", "重置参数"],
    ["camera", "相机"],
    ["copy current:", "复制当前位置："],
    ["spread", "展开程度"],
    ["COLOUR & SIZE", "颜色与大小"],
    ["colour & size", "颜色与大小"],
    ["continent", "洲别"],
    ["country", "国家/城市"],
    ["drift speed", "漂移速度"],
    ["exposure", "活跃度"],
    ["size contrast", "大小对比"],
    ["point size", "点大小"],
    ["point opacity", "点透明度"],
    ["motion trail", "运动轨迹"],
    ["LINKS & LABELS", "连线与标签"],
    ["links & labels", "连线与标签"],
    ["neighbour links k=", "邻居连线 k="],
    ["neighbour links", "邻居连线"],
    ["link opacity", "连线透明度"],
    ["min link similarity", "最低连线相似度"],
    ["mutual links only", "仅双向连线"],
    ["name labels", "机构标签"],
    ["UNCERTAINTY", "不确定性"],
    ["uncertainty", "不确定性"],
    ["halo scale", "光晕范围"],
    ["halo = measured uncertainty", "光晕表示位置估计的不确定性"],
    ["fastest movers", "变化最快机构"],
    ["About this map", "关于 AI4Talent"],
    ["about this map", "关于 AI4Talent"],
    ["mean noise-corrected motion per step", "每个时间步的平均去噪位移"],
    ["size = how often seen in the data", "点大小表示数据中的出现频率"],
    ["slow", "慢"],
    ["fast", "快"],
    ["low", "低"],
    ["high", "高"],
    ["close", "关闭"],
    ["loading the map…", "正在加载机构流动图…"],
  ]);
  const prefixTranslations = [
    ["spread ", "展开程度 "],
    ["size contrast ", "大小对比 "],
    ["point size ", "点大小 "],
    ["point opacity ", "点透明度 "],
    ["motion trail ", "运动轨迹 "],
    ["neighbour links k=", "邻居连线 k="],
    ["link opacity ", "连线透明度 "],
    ["min link similarity ", "最低连线相似度 "],
    ["name labels ", "机构标签 "],
    ["halo scale ", "光晕范围 "],
    ["top view", "俯视图"],
    ["retention ρ per step", "每个时间步的保留率 ρ"],
    ["nearest neighbours in", "当前年度近邻："],
    ["drag the time slider", "拖动时间轴"],
  ];

  const formatNumber = (value) => new Intl.NumberFormat("zh-CN").format(value ?? 0);
  const currentView = views[config.viewId] || views.global;

  function translateTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const trimmed = node.nodeValue.trim();
      if (/^\d+ windows$/.test(trimmed)) {
        node.nodeValue = node.nodeValue.replace(/^(\d+) windows$/, "$1 个年度窗口");
        continue;
      }
      if (trimmed.toLowerCase().startsWith("neighbour links")) {
        node.nodeValue = node.nodeValue.replace(/neighbour links/i, "邻居连线");
        continue;
      }
      if (translations.has(trimmed)) {
        node.nodeValue = node.nodeValue.replace(trimmed, translations.get(trimmed));
        continue;
      }
      const prefix = prefixTranslations.find(([source]) => trimmed.startsWith(source));
      if (prefix) {
        node.nodeValue = node.nodeValue.replace(prefix[0], prefix[1]);
      }
    }
    document.querySelectorAll('input[type="search"]').forEach((input) => {
      input.placeholder = "搜索机构…";
    });
  }

  function updateCoreBrand(dataset) {
    document.documentElement.lang = "zh-CN";
    document.title = `AI4Talent · ${currentView.label}`;
    document.querySelectorAll("h1").forEach((heading) => {
      if (heading.textContent.trim() === "A Moving Map of Science") {
        heading.textContent = "AI4Talent";
        heading.classList.add("ai4talent-runtime-brand");
        const copy = heading.nextElementSibling;
        if (copy) copy.textContent = `${currentView.description} 当前数据包含 ${formatNumber(dataset.node_count)} 家机构。`;
      }
    });
    document.querySelectorAll("h2").forEach((heading) => {
      if (heading.textContent.trim() === "About this map") heading.textContent = "关于 AI4Talent";
    });
    document.querySelectorAll("p").forEach((paragraph) => {
      const text = paragraph.textContent.trim();
      if (text.startsWith("Each point is a research institution")) {
        paragraph.textContent = "每个点代表一家真实研究机构。位置由作者跨机构流动网络计算；距离表示人才流动关系的相近程度，而不是地理距离。";
      } else if (text.startsWith("Institutions observed fewer than")) {
        paragraph.textContent = "数据时间线统一为 2000-2026。侧栏的活跃度阈值只控制当前显示密度，不会删除底层机构数据。";
      }
    });
  }

  function createToolbar(dataset) {
    if (document.getElementById("ai4talentMapToolbarV29")) return;
    const toolbar = document.createElement("header");
    toolbar.id = "ai4talentMapToolbarV29";
    toolbar.className = "ai4talent-map-toolbar";
    toolbar.innerHTML = `
      <a class="ai4talent-map-brand" href="./ai4talent-index-v29.html" title="AI4Talent 专题首页">
        <span class="ai4talent-map-brand-mark"></span><strong>AI4Talent</strong>
      </a>
      <nav class="ai4talent-map-tabs" aria-label="机构流动视图">
        ${Object.entries(views).map(([viewId, view]) => `<a class="ai4talent-map-tab ${config.viewId === viewId ? "active" : ""}" href="${view.href}">${view.shortLabel}</a>`).join("")}
      </nav>
      <div class="ai4talent-map-summary"><span><strong>${formatNumber(dataset.node_count)}</strong> 家机构</span><span><strong>${formatNumber(dataset.edge_count)}</strong> 条迁移边</span><span><strong>2000-2026</strong></span></div>
      <button class="ai4talent-info-button" id="ai4talentInfoButtonV29" type="button" aria-label="查看数据说明" title="数据说明">i</button>
      <button class="ai4talent-controls-button" id="ai4talentControlsButtonV29" type="button" aria-label="打开参数面板" title="参数面板">☰</button>`;
    const panel = document.createElement("section");
    panel.id = "ai4talentInfoPanelV29";
    panel.className = "ai4talent-info-panel";
    panel.innerHTML = `<h2>${currentView.label} · 数据说明</h2>
      <p>${currentView.description}</p>
      <div class="ai4talent-info-grid">
        <div class="ai4talent-info-metric"><span>机构节点</span><strong>${formatNumber(dataset.node_count)}</strong></div>
        <div class="ai4talent-info-metric"><span>年度迁移边</span><strong>${formatNumber(dataset.edge_count)}</strong></div>
        <div class="ai4talent-info-metric"><span>对比分组</span><strong>${formatNumber(dataset.group_count)}</strong></div>
      </div>
      <p>迁移边表示同一作者在相邻观测年份的主机构发生变化。时间线为 2000-2026，共 ${dataset.year_count} 个年度窗口；默认活跃度门槛为 ${2 ** config.minExposureLog} 人，可在右侧面板调整到 0 查看全部机构。</p>`;
    const backdrop = document.createElement("button");
    backdrop.className = "ai4talent-controls-backdrop";
    backdrop.type = "button";
    backdrop.setAttribute("aria-label", "关闭参数面板");
    document.body.append(toolbar, panel, backdrop);
    toolbar.querySelector("#ai4talentInfoButtonV29").addEventListener("click", () => {
      panel.classList.toggle("open");
    });
    toolbar.querySelector("#ai4talentControlsButtonV29").addEventListener("click", () => {
      document.body.classList.toggle("ai4talent-controls-open");
    });
    backdrop.addEventListener("click", () => document.body.classList.remove("ai4talent-controls-open"));
    if (new URLSearchParams(window.location.search).get("controls") === "open") {
      document.body.classList.add("ai4talent-controls-open");
    }
    if (new URLSearchParams(window.location.search).get("info") === "open") {
      panel.classList.add("open");
    }
  }

  async function init() {
    try {
      const response = await fetch(`${summaryUrl}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const summary = await response.json();
      const dataset = summary.datasets.find((item) => item.dataset_id === config.datasetId);
      if (!dataset) throw new Error("未找到当前 AI4Talent 数据集");
      createToolbar(dataset);
      updateCoreBrand(dataset);
      translateTextNodes();
      let queued = false;
      const observer = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          updateCoreBrand(dataset);
          translateTextNodes();
        });
      });
      observer.observe(document.getElementById("app") || document.body, { childList: true, characterData: true, subtree: true });
    } catch (error) {
      console.error("AI4Talent v29 初始化失败", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
