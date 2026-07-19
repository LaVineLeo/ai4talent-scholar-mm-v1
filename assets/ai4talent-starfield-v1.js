/**
 * AI4Talent starfield background injector v1
 * Inserts a non-interactive CSS starfield behind page content.
 */
(function () {
  const ROOT_CLASS = "a4t-starfield-on";
  const HOST_CLASS = "a4t-starfield";

  function buildStarfield() {
    const host = document.createElement("div");
    host.className = HOST_CLASS;
    host.setAttribute("aria-hidden", "true");
    host.innerHTML = [
      '<div class="a4t-starfield-layer a4t-starfield-layer--dust"></div>',
      '<div class="a4t-starfield-layer a4t-starfield-layer--mid"></div>',
      '<div class="a4t-starfield-layer a4t-starfield-layer--bright"></div>',
    ].join("");
    return host;
  }

  function mountStarfield() {
    if (!document.body) return;
    document.documentElement.classList.add(ROOT_CLASS);
    document.body.classList.add(ROOT_CLASS);

    if (!document.querySelector(`.${HOST_CLASS}`)) {
      document.body.prepend(buildStarfield());
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountStarfield, { once: true });
  } else {
    mountStarfield();
  }
})();
