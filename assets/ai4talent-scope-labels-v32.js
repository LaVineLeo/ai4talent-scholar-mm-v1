(function () {
  const labelsByHref = {
    "ai4talent-global-v29.html": "全球机构",
    "ai4talent-cnus-v29.html": "中美机构",
    "ai4talent-china-v29.html": "中国机构",
  };

  function normalizeLabels() {
    document.querySelectorAll("#ai4talentMapToolbarV29 .ai4talent-map-tab").forEach((link) => {
      const filename = new URL(link.href, window.location.href).pathname.split("/").pop();
      const label = labelsByHref[filename];
      if (label && link.textContent !== label) link.textContent = label;
    });
    const normalizedTitle = document.title
      .replaceAll("中国城市机构", "中国机构")
      .replaceAll("中国城市", "中国机构");
    if (document.title !== normalizedTitle) document.title = normalizedTitle;
    document.querySelectorAll('meta[name="description"]').forEach((meta) => {
      const normalizedDescription = meta.content
        .replaceAll("中国城市机构", "中国机构")
        .replaceAll("中国城市", "中国机构");
      if (meta.content !== normalizedDescription) meta.content = normalizedDescription;
    });
  }

  normalizeLabels();
  const observer = new MutationObserver(normalizeLabels);
  observer.observe(document.body, { childList: true, subtree: true });
})();
