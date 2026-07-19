(function () {
  const logoUrl = "./assets/ai4talent-company-logo-v33.png";

  function createLogo(className) {
    const image = document.createElement("img");
    image.className = className;
    image.src = logoUrl;
    image.alt = "";
    image.width = 28;
    image.height = 28;
    image.setAttribute("aria-hidden", "true");
    return image;
  }

  function applyCompanyBrand() {
    document.querySelectorAll(".ai4talent-map-brand").forEach((brand) => {
      if (brand.querySelector(".ai4talent-map-brand-logo-v33")) return;
      const mark = brand.querySelector(".ai4talent-map-brand-mark");
      const logo = createLogo("ai4talent-map-brand-logo-v33");
      if (mark) mark.replaceWith(logo);
      else brand.prepend(logo);
    });

    document.querySelectorAll("h1.ai4talent-runtime-brand").forEach((heading) => {
      if (!heading.querySelector(".ai4talent-runtime-logo-v33")) {
        heading.prepend(createLogo("ai4talent-runtime-logo-v33"));
      }
    });
  }

  applyCompanyBrand();
  const observer = new MutationObserver(applyCompanyBrand);
  observer.observe(document.body, { childList: true, subtree: true });
})();
