document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Hamburger Menu Toggle ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function(event) {
            event.stopPropagation();
            mainNav.classList.toggle('active');
        });
    }

    // --- Dropdown Menu Logic for Mobile ---
    // This now targets the new button, not the link
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const parentLi = this.parentElement;
            parentLi.classList.toggle('dropdown-active');
        });
    });

    // --- Close Menus When Clicking Elsewhere ---
    document.addEventListener('click', function(event) {
        // Close the mobile nav if clicking outside of it
        if (mainNav && mainNav.classList.contains('active') && !mainNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            mainNav.classList.remove('active');
        }
    });
});