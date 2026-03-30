/* =========================================
   BBN SOLUTION – MAIN JAVASCRIPT
   EmailJS integration + UI enhancements
   =========================================

   EmailJS Setup Instructions
   --------------------------
   1. Sign up at https://www.emailjs.com (free plan supports 200 emails/month).
   2. Create an Email Service (e.g. Gmail, Outlook) and note the SERVICE_ID.
   3. Create an Email Template with the variables below and note the TEMPLATE_ID.
      Template variables used: {{user_name}}, {{user_email}}, {{user_phone}},
      {{service_type}}, {{message}}
   4. Copy your Public Key from Account > API Keys and replace the placeholder below.
   5. Replace SERVICE_ID and TEMPLATE_ID with your real values.

   Never commit real credentials to source control.
   Use environment variables or a backend proxy for production.
   ========================================= */

(function () {
  "use strict";

  /* ── EmailJS Configuration ──────────────────────────────────────────────
     Replace the three placeholders below with your actual EmailJS values.
     ──────────────────────────────────────────────────────────────────────── */
  var EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";   // e.g. "abc123XYZ"
  var EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";   // e.g. "service_xxxxxxx"
  var EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";  // e.g. "template_xxxxxxx"

  /* ── Initialise EmailJS ─────────────────────────────────────────────── */
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  /* ── DOM references ─────────────────────────────────────────────────── */
  var navbar     = document.getElementById("navbar");
  var hamburger  = document.getElementById("hamburger");
  var navLinks   = document.getElementById("navLinks");
  var form       = document.getElementById("contact-form");
  var submitBtn  = document.getElementById("submit-btn");
  var btnText    = submitBtn && submitBtn.querySelector(".btn-text");
  var btnLoading = submitBtn && submitBtn.querySelector(".btn-loading");
  var successBox = document.getElementById("form-success");
  var errorBox   = document.getElementById("form-error");
  var yearSpan   = document.getElementById("year");

  /* ── Footer year ────────────────────────────────────────────────────── */
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* ── Sticky navbar ──────────────────────────────────────────────────── */
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // run once on load

  /* ── Mobile menu toggle ─────────────────────────────────────────────── */
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen.toString());
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
  }

  // Close menu when a link is clicked
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        hamburger && hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  // Close menu on outside click
  document.addEventListener("click", function (e) {
    if (navLinks && navLinks.classList.contains("open")) {
      if (!navLinks.contains(e.target) && e.target !== hamburger && !hamburger.contains(e.target)) {
        navLinks.classList.remove("open");
        hamburger && hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    }
  });

  /* ── Active nav link on scroll ──────────────────────────────────────── */
  var sections = document.querySelectorAll("section[id]");
  var navAnchors = document.querySelectorAll(".nav-links a[href^='#']");

  function setActiveLink() {
    var scrollY = window.scrollY + 100;
    sections.forEach(function (sec) {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navAnchors.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + sec.id);
        });
      }
    });
  }
  window.addEventListener("scroll", setActiveLink, { passive: true });

  /* ── Form validation helpers ─────────────────────────────────────────── */
  function showFieldError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById("error-" + fieldId);
    if (field) field.classList.add("invalid");
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(fieldId) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById("error-" + fieldId);
    if (field) field.classList.remove("invalid");
    if (errorEl) errorEl.textContent = "";
  }

  function clearAllErrors() {
    ["user_name", "user_email", "message"].forEach(clearFieldError);
  }

  function validateForm(data) {
    var valid = true;
    clearAllErrors();

    if (!data.user_name || data.user_name.trim().length < 2) {
      showFieldError("user_name", "Please enter your full name (at least 2 characters).");
      valid = false;
    }

    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!data.user_email || !emailRegex.test(data.user_email.trim())) {
      showFieldError("user_email", "Please enter a valid email address.");
      valid = false;
    }

    if (!data.message || data.message.trim().length < 10) {
      showFieldError("message", "Please enter a message (at least 10 characters).");
      valid = false;
    }

    return valid;
  }

  /* ── Real-time validation clearing ──────────────────────────────────── */
  ["user_name", "user_email", "message"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", function () { clearFieldError(id); });
    }
  });

  /* ── Loading state helpers ───────────────────────────────────────────── */
  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (btnText)    btnText.hidden    =  loading;
    if (btnLoading) btnLoading.hidden = !loading;
  }

  /* ── Show / hide feedback banners ────────────────────────────────────── */
  function showFeedback(type) {
    if (successBox) {
      successBox.hidden = (type !== "success");
      successBox.classList.toggle("is-visible", type === "success");
    }
    if (errorBox) {
      errorBox.hidden = (type !== "error");
      errorBox.classList.toggle("is-visible", type === "error");
    }

    if (type === "success" && successBox) {
      successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (type === "error" && errorBox) {
      errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /* ── Form submit handler ─────────────────────────────────────────────── */
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Collect field values
      var data = {
        user_name:    form.user_name.value,
        user_email:   form.user_email.value,
        user_phone:   form.user_phone ? form.user_phone.value : "",
        service_type: form.service_type ? form.service_type.value : "",
        message:      form.message.value,
      };

      // Client-side validation
      if (!validateForm(data)) return;

      // Guard: warn if EmailJS is not configured
      if (
        EMAILJS_PUBLIC_KEY  === "YOUR_PUBLIC_KEY"  ||
        EMAILJS_SERVICE_ID  === "YOUR_SERVICE_ID"  ||
        EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
      ) {
        showFeedback("error");
        if (errorBox) {
          var p = errorBox.querySelector("p");
          if (p) p.innerHTML =
            "<strong>EmailJS is not yet configured.</strong> " +
            "Please add your Public Key, Service ID, and Template ID in <code>js/main.js</code>.";
        }
        return;
      }

      setLoading(true);
      showFeedback(null); // hide both banners

      emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data)
        .then(function () {
          setLoading(false);
          showFeedback("success");
          form.reset();
          clearAllErrors();
        })
        .catch(function (err) {
          console.error("EmailJS error:", err);
          setLoading(false);
          showFeedback("error");
        });
    });
  }

  /* ── Smooth scroll for in-page anchors ──────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      var navHeight = navbar ? navbar.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ── Simple fade-in on scroll (IntersectionObserver) ────────────────── */
  var animateEls = document.querySelectorAll(
    ".service-card, .why-card, .about-content, .about-visual, .contact-info, .contact-form-wrap"
  );

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    animateEls.forEach(function (el) {
      el.classList.add("fade-in");
      observer.observe(el);
    });
  }

})();
