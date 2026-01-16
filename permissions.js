// Sistema de Permissões por Função
// Gerencia controle de acesso baseado em roles

class PermissionManager {
    constructor() {
        this.userRole = null;
        this.isOwner = false;
        this.dashboardId = localStorage.getItem('dashboardId');
        this.token = localStorage.getItem('token');
    }

    async loadUserRole() {
        if (!this.dashboardId || !this.token) {
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/user-role', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'dashboard-id': this.dashboardId
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.userRole = data.role;
                this.isOwner = data.isOwner;
                localStorage.setItem('userRole', this.userRole);
                localStorage.setItem('isOwner', this.isOwner);
            }
        } catch (error) {
            console.error('Error loading user role:', error);
        }
    }

    // Verifica se o usuário pode editar determinado módulo
    canEdit(module) {
        if (this.isOwner) return true; // Owner tem acesso total

        const permissions = {
            'member': [], // Membro: apenas visualizar
            'tesoureiro': ['financeiro', 'drivdoc'],
            'secretario': ['membros', 'drivdoc', 'drivfotos'],
            'midia': ['drivfotos'],
            'admin': ['financeiro', 'drivdoc', 'drivfotos', 'membros', 'gestao', 'agenda', 'projetos'] // Admin: acesso total
        };

        const userPermissions = permissions[this.userRole] || [];
        return userPermissions.includes(module);
    }

    // Retorna o papel do usuário
    getRole() {
        return this.userRole || localStorage.getItem('userRole') || 'member';
    }

    // Checa se é owner
    checkIsOwner() {
        return this.isOwner || localStorage.getItem('isOwner') === 'true';
    }

    // Desabilita elementos de edição baseado no módulo
    applyRestrictions(module) {
        if (this.canEdit(module)) {
            return; // Tem permissão, não desabilita nada
        }

        // Desabilita botões de criar/editar/deletar
        const editButtons = document.querySelectorAll(
            'button[type="submit"], ' +
            'button:not([id="logout"]):not([id="printButton"]):not([id="applyFilter"]), ' +
            'input[type="submit"]'
        );

        editButtons.forEach(btn => {
            // Não desabilita botões de navegação ou logout
            if (!btn.textContent.includes('Ver') && 
                !btn.textContent.includes('Voltar') && 
                !btn.textContent.includes('Aplicar Filtro') &&
                !btn.textContent.includes('Imprimir') &&
                btn.id !== 'logout') {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.title = 'Você não tem permissão para esta ação';
            }
        });

        // Desabilita inputs e textareas
        const inputs = document.querySelectorAll('input:not([type="search"]):not([id*="filter"]), textarea, select');
        inputs.forEach(input => {
            if (!input.id.includes('filter') && !input.id.includes('search')) {
                input.disabled = true;
                input.style.opacity = '0.7';
            }
        });

        // Mostra mensagem de apenas leitura
        const main = document.querySelector('main');
        if (main && !document.getElementById('readOnlyMessage')) {
            const message = document.createElement('div');
            message.id = 'readOnlyMessage';
            message.style.cssText = 'background: #fff3cd; border: 1px solid #ffc107; padding: 12px; margin: 10px 0; border-radius: 4px; color: #856404;';
            message.innerHTML = `<strong>⚠️ Modo Somente Leitura:</strong> Você tem permissão apenas para visualizar este módulo.`;
            main.insertBefore(message, main.firstChild);
        }
    }
}

// Instância global
window.permissionManager = new PermissionManager();
