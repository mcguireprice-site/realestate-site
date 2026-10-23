/* McGuire Price — site script (no dependencies) */

/* ---------------- Settings you may edit ---------------- */

// 1. Inquiry form: after creating the short "Inquiry" Jotform, paste its ID here
//    (the number at the end of its link, e.g. https://form.jotform.com/123456789 → "123456789").
//    While empty, the Contact page shows call / text / email options only.
const INQUIRY_FORM_ID = "";

// 2. First-time buyer workshop sign-up form (Jotform ID). Shows on the Buy page.
const WORKSHOP_FORM_ID = "";

// 3. Google Analytics 4: paste your Measurement ID (looks like "G-XXXXXXXXXX").
//    While empty, no analytics or tracking code loads.
const GA_MEASUREMENT_ID = "";

/* -------------------------------------------------------- */

(function () {
  /* ---- Analytics + conversion events ---- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  const track = (name, params) => { if (GA_MEASUREMENT_ID) gtag("event", name, params || {}); };

  if (GA_MEASUREMENT_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  }

  // Calls, texts and emails
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    const where = a.dataset.loc || location.pathname;
    if (href.startsWith("tel:")) track("contact_call", { link_location: where });
    else if (href.startsWith("sms:")) track("contact_text", { link_location: where });
    else if (href.startsWith("mailto:")) track("contact_email", { link_location: where });
  });

  // Jotform submissions (Jotform notifies the page it is embedded in)
  window.addEventListener("message", (e) => {
    if (!/jotform\.com$|jotfor\.ms$/.test(new URL(e.origin).hostname)) return;
    const d = typeof e.data === "string" ? e.data : JSON.stringify(e.data || "");
    if (/submission-completed/i.test(d)) {
      const p = location.pathname;
      const name = p.indexOf("/home-valuation") === 0 ? "valuation_request"
                 : p.indexOf("/buy") === 0 ? "workshop_signup" : "inquiry_submit";
      track(name, { form_page: p });
    }
  });

  /* ---- Mobile navigation ---- */
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
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
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

  /* ---- Current year ---- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Jotform embeds ---- */
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

  // Optional form slots: Contact page inquiry form, Buy page workshop sign-up
  function fillSlot(slotId, formId, title, hideSelector) {
    const slot = document.getElementById(slotId);
    if (!slot || !formId) return;
    const iframe = document.createElement("iframe");
    iframe.id = "JotFormIFrame-" + formId;
    iframe.title = title;
    iframe.src = "https://form.jotform.com/" + formId;
    iframe.allow = "geolocation; microphone; camera";
    slot.appendChild(iframe);
    slot.hidden = false;
    document.querySelectorAll(hideSelector).forEach((el) => (el.hidden = true));
    loadJotformHandler(iframe.id);
  }
  fillSlot("inquiry-form", INQUIRY_FORM_ID, "Send McGuire a message", "[data-no-form]");
  fillSlot("workshop-form", WORKSHOP_FORM_ID, "Sign up for the first-time homebuyer workshop", "[data-no-workshop-form]");

  // Any static Jotform iframe (Home Value page)
  document.querySelectorAll("iframe[data-jotform]").forEach((f) => loadJotformHandler(f.id));
})();
