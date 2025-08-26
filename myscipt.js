document.addEventListener('DOMContentLoaded', function() {
    // --- Element Selection ---
    const header = document.querySelector('header');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const sections = document.querySelectorAll('main section');
    const contactForm = document.getElementById('contact-form');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // --- 1. Theme Toggle (Corrected Logic) ---
    // The BB-8 toggle's "checked" state is the night sky (Dark Mode).
    // The "unchecked" state is the day sky (Light Mode).
    // We will make Dark Mode the default.

    // On page load, check for a saved theme. Default to dark if nothing is saved.
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        // If the user previously chose light mode, apply it.
        body.classList.add('light-mode');
        if (themeToggle) {
            themeToggle.checked = false; // Unchecked = Day/Light
        }
    } else {
        // Otherwise, default to dark mode.
        body.classList.remove('light-mode');
        if (themeToggle) {
            themeToggle.checked = true; // Checked = Night/Dark
        }
    }

    // Add listener for the toggle button
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                // If the toggle is CHECKED, it's Night/Dark Mode.
                body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                // If the toggle is UNCHECKED, it's Day/Light Mode.
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }


    // --- 2. Mobile Menu Toggle (with Accessibility) ---
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // --- 3. Header Style on Scroll ---
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('header-scrolled', window.scrollY > 50);
        }
    });

    // --- 4. Smooth Scrolling & Active Link Logic ---
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Close mobile menu on link click
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- 5. Active Nav Link on Scroll (Intersection Observer) ---
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    sections.forEach(section => sectionObserver.observe(section));

    // --- 6. Scroll Reveal Animation (Intersection Observer) ---
    const revealElements = document.querySelectorAll('#about > div, #projects .grid > div, #contact > div');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // **FIXED LOGIC HERE** The .observe() call must be inside the loop.
    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // --- 7. Functional Contact Form (EmailJS Integration) ---
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            // --- Instructions for EmailJS ---
            // 1. Sign up for a free account at https://www.emailjs.com/
            // 2. Add a new service (e.g., Gmail)
            // 3. Create an email template
            // 4. Find your keys under "Account > API Keys"
            
            const serviceID = 'YOUR_SERVICE_ID'; // Replace with your Service ID
            const templateID = 'YOUR_TEMPLATE_ID'; // Replace with your Template ID
            const publicKey = 'YOUR_PUBLIC_KEY'; // Replace with your Public Key

            // Check if EmailJS is loaded before calling it
            if (typeof emailjs !== 'undefined') {
                emailjs.sendForm(serviceID, templateID, this, publicKey)
                    .then(() => {
                        submitButton.textContent = 'Message Sent! Thank You.';
                        submitButton.style.backgroundColor = '#16a34a'; // Green
                        contactForm.reset();
                    }, (err) => {
                        submitButton.textContent = 'Send Message';
                        submitButton.style.backgroundColor = '#dc2626'; // Red
                        alert('Failed to send message. Please try again. Error: ' + JSON.stringify(err));
                    })
                    .finally(() => {
                        // Re-enable the button after a delay, except on success
                        if (submitButton.textContent !== 'Message Sent! Thank You.') {
                            setTimeout(() => {
                                submitButton.disabled = false;
                                submitButton.style.backgroundColor = ''; // Revert to original color
                            }, 2000);
                        }
                    });
            } else {
                alert('EmailJS library not loaded. Please check your setup.');
                submitButton.textContent = 'Send Message';
                submitButton.disabled = false;
            }
        });
    }
});