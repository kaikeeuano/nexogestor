/**
 * NEXO GESTOR - Sistema de Menu Mobile Interativo
 * Inicializa automaticamente quando o DOM estiver pronto
 */

(function() {
    'use strict';
    
    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
    
    function initMobileMenu() {
        // Verifica se o menu já existe
        let menuToggle = document.querySelector('.mobile-menu-toggle');
        
        // Se não existir, cria o botão de menu
        if (!menuToggle) {
            createMenuToggle();
            menuToggle = document.querySelector('.mobile-menu-toggle');
        }
        
        // Cria overlay se não existir
        let overlay = document.querySelector('.mobile-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
        }
        
        const navList = document.querySelector('.nav-list');
        
        if (!navList || !menuToggle) return;
        
        // Toggle menu ao clicar no botão
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
        
        // Fechar menu ao clicar no overlay
        overlay.addEventListener('click', function() {
            closeMenu();
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = navList.querySelectorAll('a, button');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });
        
        // Fechar menu com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navList.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // Prevenir scroll do body quando menu estiver aberto
        function preventBodyScroll() {
            if (navList.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        function toggleMenu() {
            menuToggle.classList.toggle('active');
            navList.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Adiciona feedback tátil (vibração) em dispositivos móveis
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
            
            preventBodyScroll();
        }
        
        function closeMenu() {
            menuToggle.classList.remove('active');
            navList.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Atualiza estado do menu ao redimensionar a janela
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // Se a tela ficar grande, fecha o menu
                if (window.innerWidth > 768) {
                    closeMenu();
                }
            }, 250);
        });
    }
    
    function createMenuToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.setAttribute('aria-label', 'Menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        // Adiciona o botão no início do body
        document.body.insertBefore(toggle, document.body.firstChild);
        
        console.log('✅ Menu mobile inicializado');
    }
    
})();
