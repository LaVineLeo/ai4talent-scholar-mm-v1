(function () {
  const root = document.documentElement;
  const datasetId = root.dataset.datasetId || "quantum-global";
  const level = root.dataset.level || "country";
  const title = root.dataset.pageTitle || document.title;
  const description = root.dataset.pageDescription || "";

  document.title = title;
  if (description) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", description);
    }
  }

  const defaults = {
    datasetId,
    level,
    minExposureLog: "0",
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

  const url = new URL(window.location.href);
  Object.entries(defaults).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  const desired = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (desired !== current) {
    window.history.replaceState({}, "", desired);
  }

  window.__QUANTUM_VIEW_CONFIG_V27__ = {
    datasetId,
    level,
    title,
    description,
    viewId: root.dataset.viewId || "global",
  };
})();
