(function () {
  const root = document.documentElement;
  const datasetMap = {
    global: "quantum-global-institution-v28",
    "cn-us": "quantum-cnus-institution-v28",
    china: "quantum-china-institution-v28",
  };
  const thresholdMap = { global: "4", "cn-us": "3", china: "2" };
  const lockedView = root.dataset.ai4talentView || "";
  const url = new URL(window.location.href);
  const currentDataset = url.searchParams.get("datasetId");
  const inferredView = Object.entries(datasetMap).find(([, datasetId]) => datasetId === currentDataset)?.[0];
  const viewId = lockedView || inferredView || "global";
  const defaults = {
    datasetId: datasetMap[viewId],
    level: "institution",
    t: "22",
    playing: "false",
    minExposureLog: thresholdMap[viewId],
    colorBy: "country",
    playSpeed: "0.35",
    sizeContrast: "0.0",
    linkOpacity: "0.18",
    linkMinSim: "-1",
    haloScale: "1.6",
    pointScale: "2.5",
    pointOpacity: "0.85",
    trail: "0.5",
    spread: "0.85",
    axisX: "0",
    axisY: "1",
    axisZ: "2",
    linkK: "3",
    labelCount: "30",
    autoRotate: "true",
    halo: "true",
    view2d: "true",
    dimOnSelect: "true",
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (lockedView || !url.searchParams.has(key)) url.searchParams.set(key, value);
  });
  // Default UI: auto-enable “二维俯视” (2D top view).
  url.searchParams.set("view2d", "true");
  // Prefer clearer arcs on the sphere surface when switching back to 3D.
  if (!url.searchParams.has("linkOpacity") || Number(url.searchParams.get("linkOpacity")) < 0.12) {
    url.searchParams.set("linkOpacity", defaults.linkOpacity);
  }
  if (!url.searchParams.has("linkK") || Number(url.searchParams.get("linkK")) < 3) {
    url.searchParams.set("linkK", defaults.linkK);
  }
  window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
  window.__AI4TALENT_MAP_V29__ = {
    viewId,
    datasetId: datasetMap[viewId],
    minExposureLog: Number(thresholdMap[viewId]),
    timeline: "2000-2026",
  };
})();
