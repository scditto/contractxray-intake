/* ============================================================
   Contract X-Ray Intake — shared client logic
   ------------------------------------------------------------
   Modal/EmailJS functions are preserved verbatim from v15.
   The only NEW code is the small state block at the top:
   sessionStorage helpers used to carry tier + form values
   between the four pages of the multi-page refactor.
   ============================================================ */

// ── Multi-page state (NEW) ─────────────────────────────────────────
const CXR_STATE_KEY = 'cxr_intake_state_v1';

function getCxrState() {
    try { return JSON.parse(sessionStorage.getItem(CXR_STATE_KEY)) || {}; }
    catch (_) { return {}; }
}
function setCxrState(partial) {
    const next = Object.assign({}, getCxrState(), partial || {});
    sessionStorage.setItem(CXR_STATE_KEY, JSON.stringify(next));
    return next;
}
function clearCxrState() {
    sessionStorage.removeItem(CXR_STATE_KEY);
}

// ── Lightbox (verbatim from v15) ───────────────────────────────────
function openLightbox(src, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-overlay').classList.add('visible');
    document.body.style.overflow = 'hidden';
}
function closeLightbox() {
    const lb = document.getElementById('lightbox-overlay');
    if (lb) lb.classList.remove('visible');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ── Waitlist Modal (verbatim from v15) ─────────────────────────────
function openWaitlistModal(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    document.getElementById('waitlist-form-body').style.display = '';
    document.getElementById('waitlist-thanks-body').style.display = 'none';
    document.getElementById('waitlist-footer').style.display = '';
    document.getElementById('waitlist-name').value = '';
    document.getElementById('waitlist-email').value = '';
    document.getElementById('waitlist-org').value = '';
    document.getElementById('modal-waitlist').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeWaitlistModal() {
    document.getElementById('modal-waitlist').classList.remove('visible');
    document.body.style.overflow = '';
}

async function submitWaitlist() {
    const name  = document.getElementById('waitlist-name').value.trim();
    const email = document.getElementById('waitlist-email').value.trim();
    const org   = document.getElementById('waitlist-org').value.trim();

    if (!name || !email || !email.includes('@')) {
        alert('Please enter your name and a valid email address.');
        return;
    }

    const btn = document.getElementById('waitlist-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
        emailjs.init('C7xembvd7srWMEvEU');
        await emailjs.send('service_3z4s8ya', 'template_ywq6kvq', {
            from_name:    name,
            from_email:   email,
            organization: org || 'Not provided',
            message:      'Premium waitlist signup'
        });
    } catch (err) {
        console.error('Waitlist submission error:', err);
    }

    document.getElementById('waitlist-form-body').style.display = 'none';
    document.getElementById('waitlist-footer').style.display = 'none';
    document.getElementById('waitlist-thanks-body').style.display = '';
}

// ── Contact Modal (verbatim from v15) ──────────────────────────────
function openContactModal() {
    document.getElementById('modal-contact').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    document.getElementById('modal-contact').classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(function() {
        document.getElementById('contact-form-body').style.display = '';
        document.getElementById('contact-footer').style.display = '';
        document.getElementById('contact-thanks-body').style.display = 'none';
        document.getElementById('contact-submit-btn').disabled = false;
        document.getElementById('contact-submit-btn').textContent = 'Send Message';
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('contact-org').value = '';
        document.getElementById('contact-message').value = '';
    }, 300);
}

async function submitContact() {
    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const org     = document.getElementById('contact-org').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !email.includes('@') || !message) {
        alert('Please enter your name, email address, and a message.');
        return;
    }

    const btn = document.getElementById('contact-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        emailjs.init('C7xembvd7srWMEvEU');
        await emailjs.send('service_3z4s8ya', 'template_ywq6kvq', {
            from_name:    name,
            from_email:   email,
            organization: org || 'Not provided',
            message:      message
        });
    } catch (err) {
        console.error('Contact submission error:', err);
    }

    document.getElementById('contact-form-body').style.display = 'none';
    document.getElementById('contact-footer').style.display = 'none';
    document.getElementById('contact-thanks-body').style.display = '';
}

// ── Tier deliverable modals (verbatim from v15) ────────────────────
function openModal(tier, event) {
    event.preventDefault();
    event.stopPropagation();
    const m = document.getElementById(`modal-${tier}`);
    if (m) {
        m.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(tier) {
    const m = document.getElementById(`modal-${tier}`);
    if (m) m.classList.remove('visible');
    document.body.style.overflow = '';
}

// ── Terms / Privacy modals (verbatim from v15) ─────────────────────
function openTermsModal(event) {
    event.preventDefault();
    document.getElementById('modal-terms').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeTermsModal() {
    document.getElementById('modal-terms').classList.remove('visible');
    document.body.style.overflow = '';
}

function openPrivacyModal(event) {
    event.preventDefault();
    document.getElementById('modal-privacy').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closePrivacyModal() {
    document.getElementById('modal-privacy').classList.remove('visible');
    document.body.style.overflow = '';
}

// ── Modal overlay click + Escape (verbatim from v15) ───────────────
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.visible').forEach(modal => {
            modal.classList.remove('visible');
        });
        document.body.style.overflow = '';
    }
});
