/* ==========================================================================
   WELLPATH MAIN SCRIPT
   Builds the shared announcement bar, header, footer and mobile contact bar
   on every page, so a new page only needs two placeholders:
       <div id="wp-header"></div>   (first thing inside <body>)
       <div id="wp-footer"></div>   (last thing before the scripts)
   All contact details come from assets/js/config.js.
   ========================================================================== */

(function () {
  "use strict";

  var CONFIG = window.WELLPATH_CONFIG || {};
  var NUMBER = CONFIG.contactDisplayNumber || "";
  var LABEL = CONFIG.contactLabel || "Contact Us Toll-Free";

  /* ---------- Navigation (edit here to change menu on every page) ---------- */
  var NAV = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "weight-loss", label: "Weight Loss", href: "weight-loss.html" },
    { key: "fat-loss", label: "Fat Loss", href: "fat-loss.html" },
    { key: "meal-plans", label: "Meal Plans", href: "meal-plans.html" },
    { key: "recipes", label: "Recipes", href: "recipes.html" },
    { key: "calculators", label: "Calculators", href: "calculators.html" },
    { key: "blog", label: "Blog", href: "blog.html" },
    { key: "about", label: "About Us", href: "about.html" }
  ];

  /* ---------- Helpers ---------- */
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Returns the number as plain text, or as a click-to-call link ONLY when
  // the number has been marked verified and a tel: link is configured.
  function numberHtml(extraClass) {
    var cls = "contact-number" + (extraClass ? " " + extraClass : "");
    var safe = escapeHtml(NUMBER);
    var href = CONFIG.contactTelephoneHref;
    if (CONFIG.contactNumberVerified === true && typeof href === "string" && /^tel:\+?[0-9\-() ]+$/.test(href)) {
      return '<a class="' + cls + '" href="' + escapeHtml(href) + '">' + safe + "</a>";
    }
    return '<span class="' + cls + '">' + safe + "</span>";
  }

  var LOGO_SVG =
    '<svg class="logo__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
    '<circle cx="20" cy="20" r="20" fill="currentColor"/>' +
    '<path d="M11 25c5.5-1 9.5-4.5 12-10.5 1 4.8-.4 8.8-4.2 11.4 3.6.2 6.8-1.2 9.7-4.1-1.7 6-6.6 9.2-12.4 8.5-2.3-.3-4-1.9-5.1-5.3z" fill="#F6F3EC"/>' +
    '<circle cx="27.5" cy="12.5" r="2.4" fill="#C9E4B5"/></svg>';

  /* ---------- Announcement bar + header ---------- */
  function buildHeader(activeKey) {
    var links = NAV.map(function (item) {
      var current = item.key === activeKey ? ' aria-current="page"' : "";
      return '<li><a href="' + item.href + '"' + current + ">" + item.label + "</a></li>";
    }).join("");

    return (
      '<a class="skip-link" href="#main">Skip to main content</a>' +
      '<div class="topbar" role="region" aria-label="Toll-free contact">' +
      '  <div class="container topbar__inner">' +
      '    <span class="topbar__question">Questions about your weight-loss journey?</span>' +
      '    <span class="topbar__contact">' + escapeHtml(LABEL) + ": " + numberHtml("topbar__number") + "</span>" +
      "  </div>" +
      "</div>" +
      '<header class="site-header">' +
      '  <div class="container header__inner">' +
      '    <a class="logo" href="index.html" aria-label="FIT and Well Living home">' + LOGO_SVG + '<span class="logo__text">FIT and Well Living</span></a>' +
      '    <nav class="main-nav" id="main-nav" aria-label="Main navigation"><ul>' + links + "</ul>" +
      '      <a class="btn btn--primary main-nav__cta" href="weight-loss.html">Get Started</a>' +
      "    </nav>" +
      '    <div class="header__contact">' +
      '      <span class="header__label">' + escapeHtml(LABEL) + "</span>" +
      "      " + numberHtml("header__number") +
      "    </div>" +
      '    <a class="btn btn--primary header__cta" href="weight-loss.html">Get Started</a>' +
      '    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">' +
      '      <span class="menu-toggle__bars" aria-hidden="true"></span><span class="sr-only">Open menu</span>' +
      "    </button>" +
      "  </div>" +
      "</header>"
    );
  }

  /* ---------- Footer ---------- */
  function buildFooter() {
    var email = CONFIG.contactEmail
      ? '<p class="footer-contact__email">Email: <a href="mailto:' + escapeHtml(CONFIG.contactEmail) + '">' + escapeHtml(CONFIG.contactEmail) + "</a></p>"
      : "";
    var year = new Date().getFullYear();

    return (
      '<footer class="site-footer">' +
      '  <div class="container">' +
      '    <div class="footer-grid">' +
      '      <div class="footer-brand">' +
      '        <a class="logo logo--light" href="index.html" aria-label="FIT and Well Living home">' + LOGO_SVG + '<span class="logo__text">FIT and Well Living</span></a>' +
      '        <p>' + escapeHtml(CONFIG.tagline || "") + " Practical, evidence-informed guidance for sustainable weight management.</p>" +
      "      </div>" +
      '      <div class="footer-col"><h2 class="footer-col__title">Guides</h2><ul>' +
      '        <li><a href="weight-loss.html">Weight Loss Guide</a></li>' +
      '        <li><a href="fat-loss.html">Fat Loss Guide</a></li>' +
      '        <li><a href="belly-fat.html">How to Lose Belly Fat</a></li>' +
      '        <li><a href="meal-plans.html">Healthy Meal Plans</a></li>' +
      '        <li><a href="recipes.html">Healthy Recipes</a></li>' +
      '        <li><a href="blog.html">Blog</a></li>' +
      "      </ul></div>" +
      '      <div class="footer-col"><h2 class="footer-col__title">Calculators</h2><ul>' +
      '        <li><a href="bmi-calculator.html">BMI Calculator</a></li>' +
      '        <li><a href="calorie-calculator.html">Calorie Calculator</a></li>' +
      '        <li><a href="ideal-weight.html">Ideal Weight Calculator</a></li>' +
      '        <li><a href="water-calculator.html">Water Intake Calculator</a></li>' +
      "      </ul></div>" +
      '      <div class="footer-contact">' +
      '        <h2 class="footer-col__title">Contact FIT and Well Living</h2>' +
      '        <p class="footer-contact__label">' + escapeHtml(LABEL) + "</p>" +
      "        " + numberHtml("footer-contact__number") +
      email +
      '        <a class="footer-contact__link" href="contact.html">Visit our Contact Us page &rarr;</a>' +
      "      </div>" +
      "    </div>" +
      '    <nav class="footer-legal" aria-label="Legal and company">' +
      '      <a href="about.html">About Us</a>' +
      '      <a href="contact.html">Contact Us</a>' +
      '      <a href="privacy-policy.html">Privacy Policy</a>' +
      '      <a href="terms.html">Terms and Conditions</a>' +
      '      <a href="medical-disclaimer.html">Medical Disclaimer</a>' +
      '      <a href="editorial-policy.html">Editorial Policy</a>' +
      "    </nav>" +
      '    <p class="footer-note">FIT and Well Living provides general educational information and is not a substitute for professional medical advice, diagnosis or treatment. ' +
      'Talk with a qualified health professional before making changes to your diet, exercise or medication.</p>' +
      '    <p class="footer-copy">&copy; ' + year + " FIT and Well Living. All rights reserved.</p>" +
      '    <p class="footer-address">285 W 12th St, New York, NY 10014, United States</p>' +
      "  </div>" +
      "</footer>" +
      (CONFIG.showMobileContactBar
        ? '<div class="mobile-contact-bar" role="region" aria-label="Toll-free contact"><span>' + escapeHtml(LABEL) + ":</span> " + numberHtml("mobile-contact-bar__number") + "</div>"
        : "")
    );
  }

  /* ---------- Fill contact placeholders inside page content ---------- */
  // Any element with data-contact="number" or data-contact="label" is filled
  // from the config, so page content never hardcodes a different number.
  function fillContactPlaceholders() {
    document.querySelectorAll('[data-contact="number"]').forEach(function (el) {
      var extra = el.getAttribute("data-class") || "";
      var wrapper = document.createElement("span");
      wrapper.innerHTML = numberHtml(extra);
      el.replaceWith(wrapper.firstChild);
    });
    document.querySelectorAll('[data-contact="label"]').forEach(function (el) {
      el.textContent = LABEL;
    });
    document.querySelectorAll('[data-contact="email"]').forEach(function (el) {
      if (CONFIG.contactEmail) {
        el.innerHTML = 'Email: <a href="mailto:' + escapeHtml(CONFIG.contactEmail) + '">' + escapeHtml(CONFIG.contactEmail) + "</a>";
        el.hidden = false;
      }
    });
  }

  /* ---------- Mobile menu ---------- */
  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.querySelector(".sr-only").textContent = "Open menu";
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) {
        close();
      } else {
        toggle.setAttribute("aria-expanded", "true");
        toggle.querySelector(".sr-only").textContent = "Close menu";
        nav.classList.add("is-open");
        document.body.classList.add("menu-open");
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1240) close();
    });
  }

  /* ---------- Gentle reveal-on-scroll (skipped if reduced motion) ---------- */
  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Start ---------- */
  function init() {
    var page = document.body.getAttribute("data-page") || "";
    var headerSlot = document.getElementById("wp-header");
    var footerSlot = document.getElementById("wp-footer");

    if (headerSlot) headerSlot.outerHTML = buildHeader(page);
    if (footerSlot) footerSlot.outerHTML = buildFooter();
    if (CONFIG.showMobileContactBar) document.body.classList.add("has-mobile-bar");

    fillContactPlaceholders();
    setupMenu();
    setupReveal();
    document.documentElement.classList.add("js-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
