// Search Box Functionality (Small version)
const searchIcon = document.getElementById('searchIcon');
const mobileSearchIcon = document.getElementById('mobileSearchIcon');
const searchBox = document.getElementById('searchBox');
const searchInput = document.getElementById('searchInput');

function toggleSearch() {
    if (searchBox) {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 300);
        }
    }
}

if (searchIcon) {
    searchIcon.addEventListener('click', toggleSearch);
}

if (mobileSearchIcon) {
    mobileSearchIcon.addEventListener('click', toggleSearch);
}

// Close search when clicking outside
document.addEventListener('click', (e) => {
    if (searchBox && searchBox.classList.contains('active')) {
        if (!searchBox.contains(e.target) && 
            e.target !== searchIcon && 
            e.target !== mobileSearchIcon) {
            searchBox.classList.remove('active');
        }
    }
});

// Handle search form submission
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchQuery = searchInput.value.trim();
            if (searchQuery) {
                console.log('Searching for:', searchQuery);
                // Redirect to search results page
                // window.location.href = `search.html?q=${encodeURIComponent(searchQuery)}`;
                alert(`Searching for: ${searchQuery}`);
            }
        }
    });
}

// Mobile dropdown and hamburger menu
const navDropdown = document.querySelector('.nav-dropdown');
const dropdownToggle = document.getElementById('dropdownToggle');
const servicesLink = document.querySelector('.services-link');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Make dropdown toggle clickable
if (dropdownToggle) {
    dropdownToggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();
            navDropdown.classList.toggle('active');
        }
    });
}

// Make services link clickable for dropdown toggle
if (servicesLink) {
    servicesLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();
            navDropdown.classList.toggle('active');
        }
    });
}

// On desktop, allow services link to navigate
if (servicesLink && window.innerWidth > 768) {
    servicesLink.style.pointerEvents = 'auto';
}

// Hamburger menu toggle
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');

        // Always close dropdown when hamburger menu opens or closes
        if (navDropdown) {
            navDropdown.classList.remove('active');
        }
    });

    // Close menu when clicking on a link (except services link which toggles dropdown)
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Don't close menu if clicking on services link
            if (!link.classList.contains('services-link')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                if (navDropdown) {
                    navDropdown.classList.remove('active');
                }
            }
        });
    });

    // Also close menu when clicking on dropdown menu links
    const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            if (navDropdown) {
                navDropdown.classList.remove('active');
            }
        });
    });
}

// Update on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navDropdown) {
        navDropdown.classList.remove('active');
    }
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // Ensure dropdown is closed on page load
    const navDropdown = document.querySelector('.nav-dropdown');
    if (navDropdown) {
        navDropdown.classList.remove('active');
    }

    // Hero Slider Functionality
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        // Function to show specific slide
        function showSlide(n) {
            // Wrap around
            if (n >= slides.length) {
                currentSlide = 0;
            } else if (n < 0) {
                currentSlide = slides.length - 1;
            } else {
                currentSlide = n;
            }
            
            // Remove active class from all slides and dots
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Add active class to current slide and dot
            if (slides[currentSlide]) {
                slides[currentSlide].classList.add('active');
            }
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add('active');
            }
        }

        // Next slide
        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        // Previous slide
        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        // Auto play slider
        function startSlider() {
            slideInterval = setInterval(nextSlide, 7000);
        }

        function stopSlider() {
            clearInterval(slideInterval);
        }

        // Event listeners for arrows
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                prevSlide();
                stopSlider();
                startSlider();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                nextSlide();
                stopSlider();
                startSlider();
            });
        }

        // Event listeners for dots
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
                stopSlider();
                startSlider();
            });
        });

        // Pause slider on hover
        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', stopSlider);
            sliderContainer.addEventListener('mouseleave', startSlider);
        }

        // Initialize first slide
        showSlide(0);
        
        // Start auto-rotation
        startSlider();
        
        console.log('Slider initialized with', slides.length, 'slides');
    }

});

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    // Check if success or error parameter is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const formStatus = document.getElementById('formStatus');

    if (urlParams.get('success') === 'true' && formStatus) {
        formStatus.style.display = 'block';
        formStatus.style.backgroundColor = '#d4edda';
        formStatus.style.color = '#155724';
        formStatus.style.border = '1px solid #c3e6cb';
        formStatus.innerHTML = '<strong>Success!</strong> Thank you for your message. We will get back to you soon.';

        // Scroll to form status
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Hide success message after 8 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 8000);
    }

    // Check for error messages
    const errorParam = urlParams.get('error');
    if (errorParam && formStatus) {
        let errorMessage = '';

        switch(errorParam) {
            case 'missing':
                errorMessage = '<strong>Error!</strong> Please fill in all required fields.';
                break;
            case 'invalid_email':
                errorMessage = '<strong>Error!</strong> Please enter a valid email address.';
                break;
            case 'invalid_length':
                errorMessage = '<strong>Error!</strong> Your input exceeds the maximum allowed length.';
                break;
            case 'invalid_input':
                errorMessage = '<strong>Error!</strong> Invalid characters detected in your submission.';
                break;
            case 'rate_limit':
                errorMessage = '<strong>Error!</strong> Too many submissions. Please try again later.';
                break;
            case 'send_failed':
                errorMessage = '<strong>Error!</strong> Failed to send message. Please try again or contact us directly at contact@csrinsights.net';
                break;
            default:
                errorMessage = '<strong>Error!</strong> Something went wrong. Please try again.';
        }

        formStatus.style.display = 'block';
        formStatus.style.backgroundColor = '#f8d7da';
        formStatus.style.color = '#721c24';
        formStatus.style.border = '1px solid #f5c6cb';
        formStatus.innerHTML = errorMessage;

        // Scroll to form status
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Hide error message after 8 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 8000);
    }

    contactForm.addEventListener('submit', (e) => {
        const submitButton = contactForm.querySelector('button[type="submit"]');

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Form will submit naturally to PHP handler
    });
}

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    }
});

// Animate elements on scroll (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Scroll animation for home service cards
const homeServiceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Add staggered delay for each card
            setTimeout(() => {
                entry.target.classList.add('animate-in');
            }, entry.target.dataset.index * 100);
            homeServiceObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

// Observe elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Animate service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });

    // Animate value cards
    const valueCards = document.querySelectorAll('.value-card');
    valueCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate home service cards with staggered effect
    const homeServiceCards = document.querySelectorAll('.home-service-card');
    homeServiceCards.forEach((card, index) => {
        card.dataset.index = index;
        homeServiceObserver.observe(card);
    });

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ======================================
    // SERVICE PAGE INTERACTIVE FEATURES
    // ======================================

    // Testimonials Carousel
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    let currentTestimonial = 0;
    let testimonialInterval;

    function showTestimonial(n) {
        if (testimonialSlides.length === 0) return;

        if (n >= testimonialSlides.length) {
            currentTestimonial = 0;
        } else if (n < 0) {
            currentTestimonial = testimonialSlides.length - 1;
        } else {
            currentTestimonial = n;
        }

        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        testimonialDots.forEach(dot => dot.classList.remove('active'));

        if (testimonialSlides[currentTestimonial]) {
            testimonialSlides[currentTestimonial].classList.add('active');
        }
        if (testimonialDots[currentTestimonial]) {
            testimonialDots[currentTestimonial].classList.add('active');
        }
    }

    function nextTestimonial() {
        showTestimonial(currentTestimonial + 1);
    }

    function startTestimonialSlider() {
        testimonialInterval = setInterval(nextTestimonial, 6000);
    }

    function stopTestimonialSlider() {
        clearInterval(testimonialInterval);
    }

    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showTestimonial(index);
            stopTestimonialSlider();
            startTestimonialSlider();
        });
    });

    if (testimonialSlides.length > 0) {
        startTestimonialSlider();

        const testimonialCarousel = document.querySelector('.testimonials-carousel');
        if (testimonialCarousel) {
            testimonialCarousel.addEventListener('mouseenter', stopTestimonialSlider);
            testimonialCarousel.addEventListener('mouseleave', startTestimonialSlider);
        }
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Scroll Animation for Service Page Elements
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateOnScrollElements.forEach(element => {
        scrollObserver.observe(element);
    });

    // Split Section Animation
    const splitSections = document.querySelectorAll('.split-section');

    const splitObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const splitImage = entry.target.querySelector('.split-image');
                const splitText = entry.target.querySelector('.split-text');

                if (splitImage) {
                    splitImage.style.opacity = '0';
                    splitImage.style.transform = 'translateX(-30px)';
                    splitImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

                    setTimeout(() => {
                        splitImage.style.opacity = '1';
                        splitImage.style.transform = 'translateX(0)';
                    }, 100);
                }

                if (splitText) {
                    splitText.style.opacity = '0';
                    splitText.style.transform = 'translateX(30px)';
                    splitText.style.transition = 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s';

                    setTimeout(() => {
                        splitText.style.opacity = '1';
                        splitText.style.transform = 'translateX(0)';
                    }, 100);
                }

                splitObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    splitSections.forEach(section => {
        splitObserver.observe(section);
    });



    // Process Steps Animation
    const processSteps = document.querySelectorAll('.process-step');

    const processObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 50);
                }, Array.from(processSteps).indexOf(entry.target) * 150);

                processObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    processSteps.forEach(step => {
        processObserver.observe(step);
    });

    // Related Services Cards Animation
    const relatedServiceCards = document.querySelectorAll('.related-service-card');

    const relatedObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 50);
                }, Array.from(relatedServiceCards).indexOf(entry.target) * 150);

                relatedObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    relatedServiceCards.forEach(card => {
        relatedObserver.observe(card);
    });

    // Pricing Cards Animation
    const pricingCards = document.querySelectorAll('.pricing-card');

    const pricingObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 50);
                }, Array.from(pricingCards).indexOf(entry.target) * 150);

                pricingObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    pricingCards.forEach(card => {
        pricingObserver.observe(card);
    });
});