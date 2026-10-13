/**
 * CONFIGURATION GOOGLE SHEETS ACTIVE :
 * Chaque inscription est automatiquement envoyée et enregistrée en temps réel !
 */
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxrhWbuJwC9Xmz-oZMZz45htNdeTeAOz7YZrBNM8mMJ8zCNikCEzxgKrgTpWGh9QpoYAQ/exec";

document.addEventListener('DOMContentLoaded', () => {
  initEnvelopeExperience();
  initScrollReveal();
  initOptionCheckboxes();
  initRsvpForm();
  initThankYouActions();
  initSectionNavButton();
});

/**
 * 1. Système d'animation d'apparition au défilement (Scroll Reveal)
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // On peut cesser d'observer une fois l'élément révélé
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback pour anciens navigateurs
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }
}

/**
 * 2. Gestion des cases à cocher personnalisées orange
 */
function initOptionCheckboxes() {
  const optionCards = document.querySelectorAll('.day-option-card');

  optionCards.forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    // Fonction de synchronisation de l'état visuel avec l'état réel de la case
    const syncState = () => {
      if (checkbox.checked) {
        card.classList.add('is-checked');
      } else {
        card.classList.remove('is-checked');
      }

      // Supprime le message d'erreur si au moins une case est cochée
      const anyChecked = document.querySelectorAll('.day-option-card input[type="checkbox"]:checked').length > 0;
      const daysError = document.getElementById('days-error');
      if (daysError && anyChecked) {
        daysError.classList.remove('visible');
      }
    };

    // État initial au chargement
    syncState();

    // Écoute de l'événement natif 'change' déclenché automatiquement par le <label>
    checkbox.addEventListener('change', syncState);
  });
}

/**
 * 3. Validation & Soumission du Formulaire RSVP avec transition animée (Option 1)
 */
function initRsvpForm() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const nameInput = document.getElementById('full-name');
  const nameError = document.getElementById('name-error');
  const daysError = document.getElementById('days-error');
  const submitBtn = document.getElementById('submit-btn');

  // Retrait immédiat des erreurs lors de la saisie
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length >= 2) {
        nameInput.classList.remove('is-invalid');
        if (nameError) nameError.classList.remove('visible');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    const fullName = nameInput ? nameInput.value.trim() : '';

    // Validation Nom
    if (!fullName || fullName.length < 2) {
      if (nameInput) nameInput.classList.add('is-invalid');
      if (nameError) nameError.classList.add('visible');
      isValid = false;
    } else {
      if (nameInput) nameInput.classList.remove('is-invalid');
      if (nameError) nameError.classList.remove('visible');
    }

    // Validation au moins une journée sélectionnée
    const checkedBoxes = document.querySelectorAll('.day-option-card input[type="checkbox"]:checked');
    const selectedDays = Array.from(checkedBoxes).map(cb => cb.value);

    if (selectedDays.length === 0) {
      if (daysError) daysError.classList.add('visible');
      isValid = false;
    } else {
      if (daysError) daysError.classList.remove('visible');
    }

    if (!isValid) {
      const firstInvalid = document.querySelector('.form-input.is-invalid') || daysError;
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Animation de chargement sur le bouton
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }

    const payload = {
      fullName,
      days: selectedDays,
      timestamp: new Date().toISOString()
    };

    // 1. Sauvegarde locale dans le navigateur
    try {
      const existingHistory = JSON.parse(localStorage.getItem('sad_confirmations') || '[]');
      existingHistory.unshift(payload);
      localStorage.setItem('sad_confirmations', JSON.stringify(existingHistory));
    } catch (err) {
      console.warn('LocalStorage non disponible', err);
    }

    // 2. Envoi direct et automatique vers votre Google Sheet
    if (typeof GOOGLE_SHEET_URL !== 'undefined' && GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.startsWith('http')) {
      const params = new URLSearchParams();
      params.append('date', new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Ouagadougou' }));
      params.append('nom', fullName);
      params.append('journees', selectedDays.join(', '));

      fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }).catch(err => console.warn('Erreur envoi Google Sheet:', err));
    }

    // 3. Synchronisation API PHP en arrière-plan (si actif sur serveur local)
    try {
      fetch('api/confirm.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (_) {}

    // Déclenchement fluide de la transition et de la célébration
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }

      showToastNotification();
      showThankYouView();
      triggerConfetti();
    }, 550);
  });
}

/**
 * 4. Notification Toast discrète "Inscription Enregistrée"
 */
function showToastNotification() {
  const toast = document.getElementById('toast-success');
  if (!toast) return;

  toast.classList.add('is-active');
  setTimeout(() => {
    toast.classList.remove('is-active');
  }, 4000);
}

/**
 * 5. Transition vers la vue de remerciement (Maquette 2.jpg)
 */
function showThankYouView() {
  const onePageView = document.getElementById('one-page-view');
  const thankYouView = document.getElementById('thank-you-view');
  const floatingBtn = document.getElementById('floating-scroll-btn');

  if (!onePageView || !thankYouView) return;

  // Masquer le bouton flottant sur la page de remerciement
  if (floatingBtn) {
    floatingBtn.classList.add('is-hidden');
  }

  // Animation de sortie de la page 1
  onePageView.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  onePageView.style.opacity = '0';
  onePageView.style.transform = 'translateY(-12px)';

  setTimeout(() => {
    onePageView.style.display = 'none';
    thankYouView.classList.add('is-visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 320);
}

/**
 * 6. Actions de l'écran de remerciement
 */
function initThankYouActions() {
  const backBtn = document.getElementById('btn-back-home');
  const whatsappBtn = document.getElementById('btn-share-whatsapp');
  const onePageView = document.getElementById('one-page-view');
  const thankYouView = document.getElementById('thank-you-view');
  const form = document.getElementById('rsvp-form');

  // Bouton Retour à l'accueil
  if (backBtn && onePageView && thankYouView) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();

      thankYouView.classList.remove('is-visible');

      setTimeout(() => {
        onePageView.style.display = 'flex';
        void onePageView.offsetWidth;
        onePageView.style.opacity = '1';
        onePageView.style.transform = 'translateY(0)';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const floatingBtn = document.getElementById('floating-scroll-btn');
        if (floatingBtn) {
          floatingBtn.classList.remove('is-hidden');
        }

        if (form) {
          form.reset();
          document.querySelectorAll('.day-option-card').forEach(card => {
            const cb = card.querySelector('input[type="checkbox"]');
            if (cb) {
              cb.checked = false;
              card.classList.remove('is-checked');
            }
          });
        }
      }, 250);
    });
  }

  // Bouton Partager sur WhatsApp
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const siteUrl = window.location.href.split('#')[0];
      const message = `🌟 Je participe à la 2ᵉ Édition de la Semaine de l'Autodidacte 2026 (30 oct - 1er nov à Ouagadougou) !\n\nRejoignez-nous pour célébrer et valoriser le génie créatif burkinabè.\nConfirmez votre présence ici : ${siteUrl}`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }
}

/**
 * 7. Effet Célébration : Confettis festifs sans aucune librairie externe
 */
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('is-active');

  const colors = ['#f26522', '#ea580c', '#136c57', '#25d366', '#f59e0b', '#ffffff'];
  const particles = [];
  const particleCount = 70;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2 - 50,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 4,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      gravity: 0.38,
      drag: 0.96,
      opacity: 1
    });
  }

  let animationFrame;
  const startTime = Date.now();

  function render() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRotation;

      if (elapsed > 1600) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      ctx.restore();
    });

    if (elapsed < 2800) {
      animationFrame = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.remove('is-active');
      cancelAnimationFrame(animationFrame);
    }
  }

  render();
}

/**
 * 8. Expérience interactive d'ouverture d'enveloppe VIP
 */
function initEnvelopeExperience() {
  const overlay = document.getElementById('envelope-overlay');
  const card = document.getElementById('envelope-card');
  const waxBtn = document.getElementById('wax-seal-btn');
  const openCta = document.getElementById('open-envelope-cta');
  const floatingBtn = document.getElementById('floating-scroll-btn');

  if (!overlay || !card) return;

  // Masquer le bouton flottant tant que l'enveloppe est ouverte
  if (floatingBtn && !overlay.classList.contains('is-hidden')) {
    floatingBtn.classList.add('is-hidden');
  }

  let isOpening = false;

  function openEnvelope() {
    if (isOpening) return;
    isOpening = true;

    // Déclencher l'animation 3D sur l'enveloppe (rabat s'ouvre, lettre sort)
    card.classList.add('is-open');

    // Petite explosion de confettis festifs
    setTimeout(() => {
      triggerConfetti();
    }, 320);

    // Après l'animation d'extraction de la lettre, fondu gracieux vers la One Page
    setTimeout(() => {
      overlay.classList.add('is-hidden');
      if (floatingBtn) {
        floatingBtn.classList.remove('is-hidden');
      }
      isOpening = false;
      try {
        sessionStorage.setItem('sad_envelope_seen', 'true');
      } catch (_) {}
    }, 1450);
  }

  // Événements d'ouverture au clic sur le sceau de cire
  if (waxBtn) {
    waxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }

  // Événement au clic sur le gros bouton CTA sous l'enveloppe
  if (openCta) {
    openCta.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }

  // Clic n'importe où sur l'enveloppe pour l'ouvrir
  card.addEventListener('click', openEnvelope);
}

/**
 * 9. Bouton flottant de navigation pas-à-pas à travers les sections (centré, fond blanc, flèche orange)
 */
function initSectionNavButton() {
  const floatingBtn = document.getElementById('floating-scroll-btn');
  const overlay = document.getElementById('envelope-overlay');
  if (!floatingBtn) return;

  // Masquer initialement si l'enveloppe est affichée
  if (overlay && !overlay.classList.contains('is-hidden')) {
    floatingBtn.classList.add('is-hidden');
  }

  const sectionIds = ['section-hero', 'section-sponsors', 'section-program', 'section-rsvp'];

  // Met à jour la direction de la flèche (vers le bas ou vers le haut) selon le défilement
  function updateArrowDirection() {
    const scrollPos = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const lastSection = document.getElementById('section-rsvp');

    let isAtEnd = false;

    // Si on est à proximité de la fin du document ou dans la dernière section
    if (scrollPos + windowHeight >= docHeight - 80) {
      isAtEnd = true;
    } else if (lastSection) {
      const rect = lastSection.getBoundingClientRect();
      if (rect.top <= 140) {
        isAtEnd = true;
      }
    }

    if (isAtEnd) {
      floatingBtn.classList.add('is-up');
      floatingBtn.setAttribute('title', 'Retour en haut de page');
      floatingBtn.setAttribute('aria-label', 'Retour en haut de page');
    } else {
      floatingBtn.classList.remove('is-up');
      floatingBtn.setAttribute('title', 'Section suivante');
      floatingBtn.setAttribute('aria-label', 'Section suivante');
    }
  }

  floatingBtn.addEventListener('click', () => {
    // Si la flèche est vers le haut, retour en haut de page
    if (floatingBtn.classList.contains('is-up')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Trouver la prochaine section
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    let nextSection = null;
    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top > 80) {
        nextSection = sec;
        break;
      }
    }

    if (nextSection) {
      const headerOffset = 15;
      const targetY = nextSection.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  window.addEventListener('scroll', updateArrowDirection, { passive: true });
  updateArrowDirection();
}
