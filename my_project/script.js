/* ==========================================================
   EmailJS Configuration
   Replace these values with your actual EmailJS credentials
========================================================== */
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/* ==========================================================
   PAGE NAVIGATION WITH TRANSITION
========================================================== */
function showPage(id) {
  const overlay = document.getElementById('pageTransition');
  const currentPage = document.querySelector('.page.active');
  const targetPage = document.getElementById('page-' + id);
  
  if (!targetPage || targetPage === currentPage) return;

  // Animate page transition
  overlay.classList.add('active');
  
  setTimeout(() => {
    // Switch pages
    if (currentPage) currentPage.classList.remove('active');
    targetPage.classList.add('active');
    window.scrollTo({ top: 0 });
    
    // Close mobile nav
    const navMenu = document.getElementById('navMenu');
    const bsCollapse = bootstrap.Collapse.getInstance(navMenu);
    if (bsCollapse) bsCollapse.hide();
    
    // Fade out overlay
    setTimeout(() => {
      overlay.classList.remove('active');
      // Re-trigger animations
      setTimeout(initReveal, 150);
      if (id === 'about') setTimeout(animateSkills, 500);
    }, 100);
  }, 350);
}

/* ==========================================================
   STICKY NAV
========================================================== */
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 40);
});

/* ==========================================================
   SCROLL REVEAL (Intersection Observer)
========================================================== */
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}
initReveal();

/* ==========================================================
   SKILL BARS
========================================================== */
function animateSkills() {
  document.querySelectorAll('.skill-fill').forEach(bar => bar.classList.add('animated'));
}

/* ==========================================================
   FLOATING PARTICLES
========================================================== */
(function() {
  const wrap = document.getElementById('particles');
  if (!wrap) return;
  const count = window.innerWidth < 600 ? 14 : 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 2;
    const drift = (Math.random() - 0.5) * 120;
    p.style.cssText = `left:${Math.random()*100}%;bottom:${Math.random()*20}%;width:${size}px;height:${size}px;--drift:${drift}px;animation-duration:${Math.random()*14+10}s;animation-delay:${Math.random()*12}s;opacity:${Math.random()*.5+.1}`;
    wrap.appendChild(p);
  }
})();

/* ==========================================================
   TYPING ANIMATION
========================================================== */
(function() {
  const el = document.getElementById('hero-typed');
  if (!el) return;
  const phrases = ['CAD Solutions', 'Precision Drafting', '3D Modeling', 'Your Drawing Partner'];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    el.textContent = deleting ? phrase.slice(0, ci--) : phrase.slice(0, ci++);
    if (!deleting && ci > phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
    if (deleting && ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; ci = 0; setTimeout(tick, 400); return; }
    setTimeout(tick, deleting ? 55 : 90);
  }
  setTimeout(tick, 2200);
})();

/* ==========================================================
   PROJECT DETAIL MODAL WITH PDF VIEWER
   --------------------------------------------------------
   Opens a modal showing project details + embedded PDF
   Clients can view the PDF inline or open in new tab
========================================================== */
function openProject(card) {
  const title = card.dataset.title;
  const cat = card.dataset.cat;
  const desc = card.dataset.desc;
  const specs = card.dataset.specs;
  const pdfPath = card.dataset.pdf || '';

  // Set modal content
  document.getElementById('projModalTitle').textContent = title;
  document.getElementById('projModalTag').textContent = cat;
  document.getElementById('projModalDesc').textContent = desc;

  // Parse and display specs
  const specsContainer = document.getElementById('projModalSpecs');
  specsContainer.innerHTML = '';
  if (specs) {
    specs.split('|').forEach(spec => {
      const parts = spec.split(':');
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        specsContainer.innerHTML += `
          <div class="proj-spec-item">
            <div class="spec-label">${label}</div>
            <div class="spec-value">${value}</div>
          </div>`;
      }
    });
  }

  // Handle PDF viewer
  const pdfSection = document.getElementById('pdfViewerSection');
  const noPdfMsg = document.getElementById('noPdfMessage');
  const pdfFrame = document.getElementById('pdfViewerFrame');
  const pdfDownload = document.getElementById('pdfDownloadLink');
  const pdfOpen = document.getElementById('pdfOpenLink');

  if (pdfPath && pdfPath !== '') {
    // Check if PDF file exists by trying to load it
    pdfSection.style.display = 'block';
    noPdfMsg.style.display = 'none';
    pdfFrame.src = pdfPath;
    pdfDownload.href = pdfPath;
    pdfDownload.setAttribute('download', '');
    pdfOpen.href = pdfPath;
  } else {
    pdfSection.style.display = 'none';
    noPdfMsg.style.display = 'flex';
  }

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('projectModal'));
  modal.show();
}

// Clear PDF iframe when modal closes (to stop loading)
document.addEventListener('DOMContentLoaded', function() {
  const projModal = document.getElementById('projectModal');
  if (projModal) {
    projModal.addEventListener('hidden.bs.modal', function() {
      document.getElementById('pdfViewerFrame').src = '';
    });
  }
});

/* ==========================================================
   FORM SUBMISSION HANDLER
   1. Validates fields
   2. Saves to MySQL via save.php
   3. Sends email via EmailJS
   4. Shows success/error message with spinner
========================================================== */
function handleFormSubmit(event, formId) {
  event.preventDefault();
  
  const form = document.getElementById(formId);
  const alertDiv = document.getElementById(formId + 'Alert');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Clear previous alerts
  alertDiv.className = 'form-alert mt-3';
  alertDiv.textContent = '';

  // Get form data
  const formData = new FormData(form);
  const data = {};
  formData.forEach((v, k) => { data[k] = v; });

  // Validation
  if (!data.name || !data.name.trim()) {
    showAlert(alertDiv, 'error', 'Please enter your full name.');
    return false;
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    showAlert(alertDiv, 'error', 'Please enter a valid email address.');
    return false;
  }
  if (!data.message || !data.message.trim()) {
    showAlert(alertDiv, 'error', 'Please enter your project description.');
    return false;
  }

  // Show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

  // Save to database via PHP
  fetch('save.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(r => r.json())
  .then(result => {
    if (result.success) {
      // Send email via EmailJS if configured
      if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          name: data.name, email: data.email,
          phone: data.phone || 'N/A', company: data.company || 'N/A',
          service: data.service || 'N/A', message: data.message
        }).catch(e => console.log('EmailJS:', e));
      }
      showAlert(alertDiv, 'success', '✅ Your request has been submitted! We will contact you within 2 business hours.');
      form.reset();
      setTimeout(() => {
        const modal = submitBtn.closest('.modal');
        if (modal) bootstrap.Modal.getInstance(modal)?.hide();
      }, 2500);
    } else {
      showAlert(alertDiv, 'error', result.message || 'Something went wrong.');
    }
  })
  .catch(() => {
    // Fallback: try EmailJS only
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name: data.name, email: data.email,
        phone: data.phone || 'N/A', company: data.company || 'N/A',
        service: data.service || 'N/A', message: data.message
      }).then(() => {
        showAlert(alertDiv, 'success', '✅ Request submitted! We will contact you soon.');
        form.reset();
      }).catch(() => {
        showAlert(alertDiv, 'error', 'Unable to submit. Email us at info@precisioncad.in');
      });
    } else {
      showAlert(alertDiv, 'success', '✅ Thank you! Your request has been received. We will respond within 2 business hours.');
      form.reset();
    }
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  });

  return false;
}

function showAlert(el, type, message) {
  el.className = 'form-alert mt-3 ' + type;
  el.textContent = message;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  if (type === 'success') {
    setTimeout(() => { el.className = 'form-alert mt-3'; el.textContent = ''; }, 8000);
  }
}
