/* McGuire Price — site script (no dependencies) */

/* ---- Settings you may edit ---- */
// After you create the short "Inquiry" Jotform, paste its ID here (the number at the
// end of its link, e.g. https://form.jotform.com/123456789 → "123456789").
// Leave empty to hide the form slot; call/text/email links still work.
const INQUIRY_FORM_ID = "";

(function () {
  document.documentElement.classList.add("js");

  /* Mobile navigation */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () =>
      setOpen(toggle.getAttribute("aria-expanded") !== "true")
    );
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 881px)").addEventListener("change", (m) => {
      if (m.matches) setOpen(false);
    });
  }

  /* Current year */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* Subtle reveal on scroll (skipped when reduced motion is preferred) */
  const reveals = document.querySelectorAll(".reveal");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduce) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* Optional inquiry form on the homepage */
  const slot = document.getElementById("inquiry-form");
  if (slot && INQUIRY_FORM_ID) {
    const iframe = document.createElement("iframe");
    iframe.id = "JotFormIFrame-" + INQUIRY_FORM_ID;
    iframe.title = "Send McGuire a message";
    iframe.src = "https://form.jotform.com/" + INQUIRY_FORM_ID;
    iframe.loading = "lazy";
    iframe.allow = "geolocation; microphone; camera";
    slot.appendChild(iframe);
    slot.hidden = false;
    loadJotformHandler(iframe.id);
  }

  /* Jotform auto-resize helper (used by the valuation page too) */
  function loadJotformHandler(iframeId) {
    const run = () =>
      window.jotformEmbedHandler &&
      window.jotformEmbedHandler("iframe[id='" + iframeId + "']", "https://form.jotform.com/");
    if (window.jotformEmbedHandler) return run();
    const s = document.createElement("script");
    s.src = "https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js";
    s.async = true;
    s.onload = run;
    document.head.appendChild(s);
  }

  document.querySelectorAll("iframe[data-jotform]").forEach((f) => loadJotformHandler(f.id));
})();
