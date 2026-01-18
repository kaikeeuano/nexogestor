/**
 * Sistema de navegação com ícones para NEXO GESTOR
 * Atualiza automaticamente todos os links do nav com ícones
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mapeamento de páginas para ícones
    const navIcons = {
        'sitem.html': '📊',
        'gestao.html': '📋',
        'agenda.html': '📅',
        'projetos.html': '🎯',
        'membros.html': '👥',
        'relatorios.html': '📈',
        'financeiro.html': '💰',
        'drivfotos.html': '📸',
        'drivdoc.html': '📄',
        'configuracao.html': '⚙️',
        'logout': '🚪' // Para o botão de logout
    };

    // Função para adicionar ícones aos links do nav
    function addIconsToNav() {
        const navItems = document.querySelectorAll('.nav-item a, .nav-item button');
        
        navItems.forEach(item => {
            // Extrair o nome da página do href ou id
            let pageName = '';
            
            if (item.tagName === 'A') {
                const href = item.getAttribute('href');
                if (href) {
                    pageName = href.split('/').pop();
                }
            } else if (item.tagName === 'BUTTON') {
                pageName = item.id || '';
            }
            
            // Se já tem ícone, não adicionar novamente
            if (item.querySelector('.nav-icon')) {
                return;
            }
            
            // Pegar o ícone correspondente
            const icon = navIcons[pageName];
            
            if (icon) {
                // Salvar o texto original
                const originalText = item.textContent.trim();
                
                // Criar elementos de ícone e texto
                const iconSpan = document.createElement('span');
                iconSpan.className = 'nav-icon';
                iconSpan.textContent = icon;
                
                const textSpan = document.createElement('span');
                textSpan.className = 'nav-text';
                textSpan.textContent = originalText;
                
                // Limpar e adicionar novos elementos
                item.textContent = '';
                item.appendChild(iconSpan);
                item.appendChild(textSpan);
            }
        });
    }
    
    // Executar ao carregar
    addIconsToNav();
});
