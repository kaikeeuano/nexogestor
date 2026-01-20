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

        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000'
            : window.location.origin;

        try {
            const response = await fetch(`${API_BASE}/user-role`, {
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
        if (this.userRole === 'admin') return true; // Admin tem acesso total a TODOS os módulos

        const permissions = {
            'member': [], // Membro: apenas visualizar
            'tesoureiro': ['financeiro', 'drivdoc'],
            'secretario': ['membros', 'drivdoc', 'drivfotos'], // Secretário tem acesso TOTAL a membros
            'midia': ['drivfotos']
        };

        const userPermissions = permissions[this.userRole] || [];
        
        // Secretário tem permissão TOTAL em membros (sem restrições)
        if (this.userRole === 'secretario' && module === 'membros') {
            console.log('✅ Secretário tem permissão TOTAL em membros');
            return true;
        }
        
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
        console.log('🔒 applyRestrictions:', { module, canEdit: this.canEdit(module), userRole: this.userRole });
        
        // Secretário tem permissão TOTAL em membros - sem restrições
        if (this.userRole === 'secretario' && module === 'membros') {
            console.log('✅ Secretário tem PERMISSÃO TOTAL em membros. Nenhuma restrição aplicada.');
            return;
        }
        
        if (this.canEdit(module)) {
            console.log('✅ Usuário tem permissão para editar. Nenhuma restrição aplicada.');
            return; // Tem permissão, não desabilita nada
        }

        console.log('⚠️ Aplicando restrições - usuário não tem permissão de edição');

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
                console.log('🔒 Botão desabilitado:', btn.textContent);
            }
        });

        // Desabilita inputs e textareas (mas NÃO os selects de formulário)
        const inputs = document.querySelectorAll('input:not([type="search"]):not([id*="filter"]):not([type="file"]), textarea');
        inputs.forEach(input => {
            if (!input.id.includes('filter') && !input.id.includes('search')) {
                input.disabled = true;
                input.style.opacity = '0.7';
                console.log('🔒 Input desabilitado:', input.id || input.name);
            }
        });
        
        // IMPORTANTE: NÃO desabilitar selects - eles são necessários para formulários
        console.log('ℹ️ Selects mantidos habilitados para permitir visualização de opções');

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
