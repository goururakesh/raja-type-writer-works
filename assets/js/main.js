(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Contact links from config ---------- */
  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function withCountryCode(number) {
    var n = digits(number);
    var cc = digits(config.countryCode || "91");
    return n.length === 10 ? cc + n : n;
  }

  function whatsappUrl(message) {
    var text = message || config.whatsappMessage || "";
    return "https://wa.me/" + withCountryCode(config.whatsapp) + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  var builders = {
    call: function () { return config.phone ? "tel:+" + withCountryCode(config.phone) : null; },
    whatsapp: function (el) { return config.whatsapp ? whatsappUrl(el.getAttribute("data-wa-message")) : null; },
    maps: function () { return config.mapsUrl || null; },
    review: function () { return config.googleReviewUrl || config.mapsUrl || null; },
  };

  document.querySelectorAll("[data-link]").forEach(function (el) {
    var build = builders[el.getAttribute("data-link")];
    var href = build && build(el);
    if (href) el.setAttribute("href", href);
  });

  document.querySelectorAll("[data-text]").forEach(function (el) {
    var value = config[el.getAttribute("data-text")];
    if (value) el.textContent = value;
  });

  var map = document.querySelector("[data-map-embed]");
  if (map && config.mapEmbedQuery) {
    map.src = "https://maps.google.com/maps?q=" + encodeURIComponent(config.mapEmbedQuery) + "&output=embed";
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header & mobile menu ---------- */
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !header.contains(e.target)) setMenu(false);
  });

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll("ul a[href^='#']"));
  var linkFor = {};
  navLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var current = linkFor[entry.target.id];
        if (!current) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a === current); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll("main section[id]").forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    revealEls.forEach(function (el) {
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(":scope > [data-reveal]") : [];
      if (siblings.length > 2) {
        var index = Array.prototype.indexOf.call(siblings, el);
        el.style.setProperty("--reveal-delay", (index % 4) * 70 + "ms");
      }
    });

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealEls.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.querySelector(".lightbox");
  var canDialog = lightbox && typeof lightbox.showModal === "function";

  document.querySelectorAll(".gallery-open").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var full = btn.getAttribute("data-full");
      var thumb = btn.querySelector("img");
      var caption = btn.closest("figure").querySelector("figcaption");

      if (!canDialog) {
        window.open(full, "_blank", "noopener");
        return;
      }

      var label = "";
      if (caption) {
        var tag = caption.querySelector(".tag");
        label = caption.firstChild.textContent.trim() + (tag ? " (" + tag.textContent.trim() + " image)" : "");
      }

      var img = lightbox.querySelector("img");
      img.src = full;
      img.alt = thumb ? thumb.alt : "";
      lightbox.querySelector(".lightbox-caption").textContent = label;
      lightbox.showModal();
    });
  });

  if (canDialog) {
    lightbox.querySelector(".lightbox-close").addEventListener("click", function () { lightbox.close(); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close();
    });
  }
})();
