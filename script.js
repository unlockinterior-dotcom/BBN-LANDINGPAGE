// ============================================
// BBN SOLUTIONS - Landing Page JavaScript
// ============================================

(function () {
  'use strict';

  /* ---- EmailJS Initialisation ---- */
  const EMAILJS_SERVICE_ID  = 'service_y679b8o';
  const EMAILJS_CONTACT_TPL = 'template_taih55y';
  const EMAILJS_WELCOME_TPL = 'template_0qrr2cs';
  emailjs.init('BjnEQ1uxyz_GQANV9');

  /* ---- Sticky Navbar ---- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* ---- Mobile Menu ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---- Smooth Scroll for Anchor Links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Intersection Observer for Animations ---- */
  const animEls = document.querySelectorAll('.fade-in, .slide-left, .slide-right');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  animEls.forEach(el => observer.observe(el));

  /* ---- Counter Animation ---- */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('active');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      // Open clicked if it was closed
      if (!isOpen) item.classList.add('active');
    });
  });

  /* ---- Hero Lead Form ---- */
  const heroForm = document.getElementById('heroLeadForm');
  if (heroForm) {
    heroForm.addEventListener('submit', handleFormSubmit);
  }

  /* ---- Contact Lead Form ---- */
  const contactForm = document.getElementById('contactLeadForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const wrapper = form.closest('.form-wrapper');
    const overlay = wrapper ? wrapper.querySelector('.form-overlay') : null;

    // ---- Client-side validation ----
    const nameField  = form.querySelector('[name="name"]');
    const phoneField = form.querySelector('[name="phone"]');

    if (!nameField || nameField.value.trim().length < 2) {
      showFieldError(nameField, 'Please enter your full name.');
      return;
    }
    if (!phoneField || !validatePhone(phoneField.value.trim())) {
      showFieldError(phoneField, 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // ---- Show loading overlay ----
    if (overlay) overlay.classList.add('show');

    // ---- Collect template params ----
    const getValue = (n) => { const el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };

    const templateParams = {
      from_name         : getValue('name'),
      phone             : getValue('phone'),
      from_email        : getValue('email') || '(not provided)',
      city              : getValue('city') || '(not provided)',
      installation_type : getValue('installation_type') || '(not provided)',
      system_size       : getValue('system_size') || '(not provided)',
      message           : getValue('message') || '(not provided)',
      source            : form.getAttribute('aria-label') || 'BBN Landing Page',
      to_email          : 'unlockinterior@gmail.com',
      reply_to          : getValue('email') || 'unlockinterior@gmail.com',
    };

    // ---- Google Ads conversion tracking ----
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXX/XXXXXXXXXXXXXXXXXX' });
    }

    // ---- Send contact-notification email to business ----
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TPL, templateParams)
      .then(function () {
        // ---- Send welcome email to customer (if they gave their email) ----
        const customerEmail = getValue('email');
        if (customerEmail) {
          const welcomeParams = Object.assign({}, templateParams, { to_email: customerEmail });
          return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_WELCOME_TPL, welcomeParams);
        }
      })
      .then(function () {
        // ---- Success — redirect to thank-you page ----
        window.location.href = 'thank-you.html';
      })
      .catch(function (err) {
        if (overlay) overlay.classList.remove('show');
        console.error('EmailJS error:', err);
        // Show a user-visible error below the submit button
        let errBanner = form.querySelector('.ejs-send-error');
        if (!errBanner) {
          errBanner = document.createElement('p');
          errBanner.className = 'ejs-send-error';
          errBanner.style.cssText = 'color:#e53935;font-size:0.82rem;margin-top:10px;text-align:center;';
          form.appendChild(errBanner);
        }
        errBanner.textContent = '⚠️ Submission failed. Please call us directly at +91-97176-52229 or try again.';
      });
  }

  function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone.replace(/\s|-/g, ''));
  }

  function showFieldError(field, msg) {
    if (!field) return;
    field.style.borderColor = '#e53935';
    field.focus();
    let err = field.parentNode.querySelector('.field-err');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-err';
      err.style.cssText = 'color:#e53935;font-size:0.78rem;margin-top:4px;display:block;';
      field.parentNode.appendChild(err);
    }
    err.textContent = msg;
    field.addEventListener('input', function clear() {
      field.style.borderColor = '';
      if (err) err.remove();
      field.removeEventListener('input', clear);
    }, { once: true });
  }

  /* ---- Phone number input: digits only ---- */
  document.querySelectorAll('input[name="phone"]').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (!/\d/.test(e.key) && e.key !== 'Backspace') e.preventDefault();
    });
  });

  /* ---- Floating scroll-to-form ---- */
  const floatFormBtn = document.getElementById('floatFormBtn');
  if (floatFormBtn) {
    floatFormBtn.addEventListener('click', () => {
      const target = document.getElementById('contact');
      if (target) {
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  /* ---- Year in footer ---- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Show/hide floating CTA on scroll ---- */
  const floatingCta = document.getElementById('floatingCta');
  if (floatingCta) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        floatingCta.style.opacity = '1';
        floatingCta.style.transform = 'translateY(0)';
      } else {
        floatingCta.style.opacity = '0';
        floatingCta.style.transform = 'translateY(60px)';
      }
    });
    // Init hidden
    floatingCta.style.opacity = '0';
    floatingCta.style.transform = 'translateY(60px)';
    floatingCta.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  }

})();
