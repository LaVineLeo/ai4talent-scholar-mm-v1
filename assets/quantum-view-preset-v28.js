(function () {
  const root = document.documentElement;
  const datasetId = root.dataset.datasetId || "quantum-global-institution-v28";
  const url = new URL(window.location.href);
  const defaults = {
    datasetId,
    level: "institution",
    t: "22",
    minExposureLog: root.dataset.minExposure || "4",
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
    playing: "false",
    view2d: "true",
    dimOnSelect: "true",
  };
  Object.entries(defaults).forEach(([key, value]) => url.searchParams.set(key, value));
  window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
  window.__QUANTUM_VIEW_CONFIG_V28__ = {
    datasetId,
    viewId: root.dataset.viewId || "global",
    title: root.dataset.pageTitle || document.title,
    description: root.dataset.pageDescription || "",
    minExposureLog: Number(root.dataset.minExposure || "4"),
  };
})();
