// ============================================
// BBN SOLUTIONS - Landing Page JavaScript
// ============================================

(function () {
  'use strict';

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
    // Form submits to formsubmit.co — no need to prevent default
    // Just show loading state
    const form = e.target;
    const overlay = form.closest('.form-wrapper')
      ? form.closest('.form-wrapper').querySelector('.form-overlay')
      : null;

    if (overlay) {
      overlay.classList.add('show');
    }

    // Validate
    const name = form.querySelector('[name="name"]');
    const phone = form.querySelector('[name="phone"]');

    if (!name || name.value.trim().length < 2) {
      e.preventDefault();
      if (overlay) overlay.classList.remove('show');
      showFieldError(name, 'Please enter your full name.');
      return;
    }
    if (!phone || !validatePhone(phone.value.trim())) {
      e.preventDefault();
      if (overlay) overlay.classList.remove('show');
      showFieldError(phone, 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // Let formsubmit.co handle the actual submission
    // Google Ads conversion tracking
    // TODO: Replace 'AW-XXXXXXXXX/XXXXXXXXXXXXXXXXXX' with your actual
    // Google Ads Conversion ID and Label from your Google Ads account
    // (Google Ads → Tools → Conversions → select conversion → Tag setup)
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXX/XXXXXXXXXXXXXXXXXX' });
    }
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
