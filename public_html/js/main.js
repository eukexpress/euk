// Main JavaScript for EukExpress

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navToggle.click();
                }
            }
        });
    });

    // Active Link Highlight on Scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Tracking Form Preview (optional enhancement)
    const trackingForm = document.getElementById('tracking-form');
    const trackingInput = document.getElementById('tracking-input');
    const trackingPreview = document.getElementById('tracking-preview');

    if (trackingInput) {
        trackingInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && value.length >= 8) {
                // Optional: Show preview of tracking number
                if (trackingPreview) {
                    trackingPreview.innerHTML = `
                        <div class="tracking-info">
                            <i class="fas fa-check-circle"></i>
                            <span>Tracking number format valid</span>
                        </div>
                    `;
                    trackingPreview.classList.add('active');
                }
            } else {
                if (trackingPreview) {
                    trackingPreview.classList.remove('active');
                }
            }
        });
    }

    // Contact Form Submission (with API integration)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Collect form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            try {
                // Send to your backend API (adjust endpoint as needed)
                const response = await fetch('/api/v1/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
                    this.reset();
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                console.error('Contact form error:', error);
                showToast('Failed to send message. Please try again later.', 'error');
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Newsletter Form Submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;

            try {
                // Send to your backend API (adjust endpoint as needed)
                const response = await fetch('/api/v1/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    showToast('Successfully subscribed to newsletter!', 'success');
                    this.reset();
                } else {
                    throw new Error('Failed to subscribe');
                }
            } catch (error) {
                console.error('Newsletter error:', error);
                showToast('Failed to subscribe. Please try again.', 'error');
            }
        });
    }
});

// Toast Notification Function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 5000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);