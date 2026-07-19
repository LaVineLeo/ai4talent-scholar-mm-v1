const STATUS_URL = "./data/ai-talent-flow-v1/status-v1.json";
let currentModeId = "global";

function formatNumber(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("zh-CN").format(value);
  }
  return value ?? "-";
}

function formatBytes(value) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function describeFileState(file) {
  if (!file.exists) {
    return "待生成";
  }
  if (typeof file.row_count === "number") {
    return file.row_count > 0 ? "已生成" : "已创建待填充";
  }
  return "已生成";
}

function statusLabel(status) {
  if (status === "ready") return "已就绪";
  if (status === "waiting") return "待数据";
  if (status === "warning") return "待修复";
  return status || "未知";
}

function createMetricCard(label, value, delayIndex) {
  return `
    <article class="metric-card fade-in" style="animation-delay:${delayIndex * 60}ms">
      <span class="metric-label">${label}</span>
      <strong class="metric-value">${formatNumber(value)}</strong>
    </article>
  `;
}

function createModeSwitch(mode) {
  return `
    <button class="mode-switch ${mode.id === currentModeId ? "active" : ""}" data-mode-id="${mode.id}" type="button">
      ${mode.label}
    </button>
  `;
}

function createFileItem(file) {
  const rowPart = typeof file.row_count === "number" ? `，行数 ${formatNumber(file.row_count)}` : "";
  return `
    <div class="file-item">
      <div class="file-path">${file.path}</div>
      <div class="file-meta">
        ${describeFileState(file)}，${formatBytes(file.size_bytes)}${rowPart}
      </div>
    </div>
  `;
}

function createPhaseCard(phase, index) {
  const metricsHtml = (phase.metrics || [])
    .map(
      (metric) => `
        <div class="inline-metric">
          <span class="metric-label">${metric.label}</span>
          <strong>${formatNumber(metric.value)}</strong>
        </div>
      `,
    )
    .join("");

  const filesHtml = (phase.files || []).length
    ? phase.files.map(createFileItem).join("")
    : `<div class="empty-state">当前阶段还没有可展示的文件。</div>`;

  const summaryPayload = phase.summary_payload && Object.keys(phase.summary_payload).length
    ? `
      <div class="summary-payload">
        ${Object.entries(phase.summary_payload)
          .map(
            ([key, value]) => `
              <div class="summary-payload-item">
                <span class="metric-label">${key}</span>
                <strong>${formatNumber(value)}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    `
    : "";

  return `
    <article class="phase-card ${phase.status} fade-in" style="animation-delay:${index * 80}ms">
      <div class="phase-top">
        <h2 class="phase-title">${phase.label}</h2>
        <span class="status-pill">${statusLabel(phase.status)}</span>
      </div>
      <p class="phase-summary">${phase.summary}</p>
      <div class="inline-metrics">${metricsHtml}</div>
      <section>
        <h3 class="section-title">真实文件</h3>
        <div class="file-list">${filesHtml}</div>
      </section>
      ${summaryPayload}
    </article>
  `;
}

function createDocCard(doc, index) {
  return `
    <article class="doc-card fade-in" style="animation-delay:${index * 50}ms">
      <h3>${doc.name}</h3>
      <div class="doc-meta">文档大小 ${formatBytes(doc.size_bytes)}</div>
    </article>
  `;
}

function createModeHero(mode) {
  const metrics = (mode.metrics || [])
    .map((metric, index) => createMetricCard(metric.label, metric.value, index))
    .join("");
  const files = (mode.files || []).length
    ? mode.files.map(createFileItem).join("")
    : `<div class="empty-state">当前视图还没有可展示的文件。</div>`;
  const nextSteps = (mode.next_steps || []).length
    ? mode.next_steps.map((step) => `<div class="next-step">${step}</div>`).join("")
    : `<div class="empty-state">当前视图暂无额外待办。</div>`;
  return `
    <section class="panel mode-hero fade-in">
      <div class="mode-hero-top">
        <div>
          <div class="mode-pill ${mode.status}">${statusLabel(mode.status)}</div>
          <h2>${mode.headline}</h2>
        </div>
        <div class="mode-switches">
          ${window.__aiTalentFlowModes.map(createModeSwitch).join("")}
        </div>
      </div>
      <p class="phase-summary">${mode.description}</p>
      <section class="summary-grid">${metrics}</section>
      <section class="panel fade-in" style="animation-delay:160ms">
        <h3 class="section-title">当前视图真实文件</h3>
        <div class="file-list">${files}</div>
      </section>
      <section class="panel fade-in" style="animation-delay:220ms">
        <h3 class="section-title">当前视图下一步</h3>
        <div class="next-steps">${nextSteps}</div>
      </section>
    </section>
  `;
}

function bindModeSwitches(payload) {
  document.querySelectorAll("[data-mode-id]").forEach((button) => {
    button.addEventListener("click", () => {
      currentModeId = button.getAttribute("data-mode-id") || "global";
      renderApp(payload);
    });
  });
}

function renderApp(payload) {
  const app = document.getElementById("app");
  const overview = payload.overview || {};
  const modes = payload.display_modes || [];
  if (!modes.find((item) => item.id === currentModeId) && modes.length > 0) {
    currentModeId = modes[0].id;
  }
  window.__aiTalentFlowModes = modes;
  const activeMode = modes.find((item) => item.id === currentModeId) || modes[0];
  app.innerHTML = `
    ${activeMode ? createModeHero(activeMode) : ""}
    <section class="summary-grid">
      ${createMetricCard("阶段总数", overview.phase_count ?? 0, 0)}
      ${createMetricCard("已就绪阶段", overview.ready_phase_count ?? 0, 1)}
      ${createMetricCard("待数据阶段", overview.waiting_phase_count ?? 0, 2)}
      ${createMetricCard("待修复阶段", overview.warning_phase_count ?? 0, 3)}
    </section>

    <section class="panel fade-in" style="animation-delay:220ms">
      <h2 class="section-title">当前快照</h2>
      <p class="phase-summary">生成时间：${payload.generated_at || "-"}</p>
      <p class="phase-summary">项目根目录：${payload.project_root || "-"}</p>
      <p class="phase-summary">说明：当前页面中的“待生成”表示真实结果尚未产出，不表示前端读取失败。</p>
    </section>

    <section class="phase-grid">
      ${(payload.phases || []).map(createPhaseCard).join("")}
    </section>

    <section class="panel fade-in" style="animation-delay:320ms">
      <h2 class="section-title">下一步</h2>
      <div class="next-steps">
        ${(payload.next_steps || [])
          .map((step) => `<div class="next-step">${step}</div>`)
          .join("") || `<div class="empty-state">当前没有额外待办。</div>`}
      </div>
    </section>

    <section class="docs-grid">
      ${(payload.docs || []).map(createDocCard).join("")}
    </section>
  `;
  bindModeSwitches(payload);
}

async function loadStatus() {
  const response = await fetch(`${STATUS_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function refresh() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="panel loading-panel">
      <p>正在刷新前端状态文件…</p>
    </section>
  `;
  try {
    const payload = await loadStatus();
    renderApp(payload);
  } catch (error) {
    app.innerHTML = `
      <section class="panel">
        <h2 class="section-title">读取失败</h2>
        <p class="phase-summary">未能加载 status-v1.json，请先运行发布脚本。</p>
        <div class="empty-state">${String(error)}</div>
      </section>
    `;
  }
}

document.getElementById("refreshButton")?.addEventListener("click", refresh);
refresh();
