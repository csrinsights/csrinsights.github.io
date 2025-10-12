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
            slideInterval = setInterval(nextSlide, 5000);
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
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject') ? document.getElementById('subject').value : 'General';
        const message = document.getElementById('message').value;
        
        // In a real application, you would send this data to your server
        console.log('Form submitted:', { name, email, subject, message });
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
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

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
});