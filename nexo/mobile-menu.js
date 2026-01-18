// =====================================
//  NEXO GESTOR - Mobile Menu Handler
// =====================================

(function() {
    'use strict';

    // Initialize mobile menu on DOM ready
    function initMobileMenu() {
        const navList = document.querySelector('.nav-list');
        
        if (!navList) return;

        // Create mobile menu toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'mobile-menu-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle mobile menu');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        // Insert toggle button before nav list
        navList.parentNode.insertBefore(toggleButton, navList);

        // Create overlay for mobile menu
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 99;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(overlay);

        // Toggle menu function
        function toggleMenu() {
            const isActive = navList.classList.contains('active');
            
            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        function openMenu() {
            navList.classList.add('active');
            toggleButton.classList.add('active');
            overlay.style.display = 'block';
            toggleButton.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            
            // Animate overlay
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        }

        function closeMenu() {
            navList.classList.remove('active');
            toggleButton.classList.remove('active');
            overlay.style.opacity = '0';
            toggleButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }

        // Event listeners
        toggleButton.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', closeMenu);

        // Close menu when clicking nav links
        const navLinks = navList.querySelectorAll('a, button');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navList.classList.contains('active')) {
                closeMenu();
            }
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && navList.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });

        console.log('✅ Mobile menu initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }

})();
