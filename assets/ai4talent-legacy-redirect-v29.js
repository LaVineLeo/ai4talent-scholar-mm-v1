(function () {
  const redirects = {
    "quantum-index-v27.html": "ai4talent-index-v29.html",
    "quantum-index-v28.html": "ai4talent-index-v29.html",
    "quantum-global-v27.html": "ai4talent-global-v29.html",
    "quantum-global-v28.html": "ai4talent-global-v29.html",
    "quantum-cnus-v27.html": "ai4talent-cnus-v29.html",
    "quantum-cnus-v28.html": "ai4talent-cnus-v29.html",
    "quantum-china-v27.html": "ai4talent-china-v29.html",
    "quantum-china-v28.html": "ai4talent-china-v29.html",
  };
  const filename = window.location.pathname.split("/").pop();
  const target = redirects[filename];
  if (target) window.location.replace(`./${target}${window.location.search}${window.location.hash}`);
})();
