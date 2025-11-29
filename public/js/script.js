// Mobile Navigation Toggle
function toggleNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Close mobile nav when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(event) {
        const nav = document.querySelector('nav');
        if (!nav.contains(event.target) && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});