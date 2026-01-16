/**
 * NEXO GESTOR - Sistema de Notificações Dinâmico
 * Sistema centralizado para gerenciar todas as notificações do projeto
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.queue = [];
        this.activeNotifications = [];
        this.maxNotifications = 3;
        this.init();
    }

    /**
     * Inicializa o sistema de notificações
     */
    init() {
        // Cria o container de notificações se não existir
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }

        // Adiciona estilos CSS se não existirem
        if (!document.getElementById('notification-styles')) {
            this.injectStyles();
        }
    }

    /**
     * Injeta os estilos CSS para notificações
     */
    injectStyles() {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }

            .notification {
                min-width: 320px;
                max-width: 450px;
                background: white;
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                display: flex;
                align-items: center;
                gap: 12px;
                pointer-events: all;
                opacity: 0;
                transform: translateX(400px);
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                border-left: 4px solid;
                position: relative;
                overflow: hidden;
            }

            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }

            .notification.hide {
                opacity: 0;
                transform: translateX(400px);
            }

            .notification-icon {
                font-size: 24px;
                flex-shrink: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }

            .notification-content {
                flex: 1;
                min-width: 0;
            }

            .notification-title {
                font-weight: 600;
                font-size: 15px;
                margin-bottom: 4px;
                color: #1a1a1a;
            }

            .notification-message {
                font-size: 14px;
                color: #666;
                line-height: 1.4;
            }

            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                cursor: pointer;
                padding: 4px;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .notification-close:hover {
                background: rgba(0, 0, 0, 0.05);
                color: #333;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                transition: width linear;
                opacity: 0.3;
            }

            /* Tipos de notificação */
            .notification.success {
                border-left-color: #10b981;
            }

            .notification.success .notification-icon {
                background: #d1fae5;
                color: #10b981;
            }

            .notification.error {
                border-left-color: #ef4444;
            }

            .notification.error .notification-icon {
                background: #fee2e2;
                color: #ef4444;
            }

            .notification.warning {
                border-left-color: #f59e0b;
            }

            .notification.warning .notification-icon {
                background: #fef3c7;
                color: #f59e0b;
            }

            .notification.info {
                border-left-color: #3b82f6;
            }

            .notification.info .notification-icon {
                background: #dbeafe;
                color: #3b82f6;
            }

            .notification.loading {
                border-left-color: #8b5cf6;
            }

            .notification.loading .notification-icon {
                background: #ede9fe;
                color: #8b5cf6;
            }

            /* Animação de loading */
            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .notification-loading-spinner {
                animation: spin 1s linear infinite;
            }

            /* Responsivo */
            @media (max-width: 640px) {
                .notification-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                }

                .notification {
                    min-width: auto;
                    max-width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Ícones para cada tipo de notificação
     */
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            loading: '⟳'
        };
        return icons[type] || icons.info;
    }

    /**
     * Mostra uma notificação
     */
    show(message, type = 'info', options = {}) {
        const {
            title = '',
            duration = 5000,
            closable = true,
            id = null
        } = options;

        // Se já existem muitas notificações, adiciona à fila
        if (this.activeNotifications.length >= this.maxNotifications) {
            this.queue.push({ message, type, options });
            return null;
        }

        const notificationId = id || `notification-${Date.now()}-${Math.random()}`;
        
        // Cria o elemento da notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = notificationId;

        const icon = document.createElement('div');
        icon.className = `notification-icon ${type === 'loading' ? 'notification-loading-spinner' : ''}`;
        icon.textContent = this.getIcon(type);

        const content = document.createElement('div');
        content.className = 'notification-content';

        if (title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'notification-title';
            titleEl.textContent = title;
            content.appendChild(titleEl);
        }

        const messageEl = document.createElement('div');
        messageEl.className = 'notification-message';
        messageEl.textContent = message;
        content.appendChild(messageEl);

        notification.appendChild(icon);
        notification.appendChild(content);

        // Botão de fechar
        if (closable && type !== 'loading') {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'notification-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => this.hide(notificationId);
            notification.appendChild(closeBtn);
        }

        // Barra de progresso
        if (duration > 0 && type !== 'loading') {
            const progress = document.createElement('div');
            progress.className = 'notification-progress';
            progress.style.width = '100%';
            notification.appendChild(progress);

            // Anima a barra de progresso
            setTimeout(() => {
                progress.style.width = '0%';
                progress.style.transition = `width ${duration}ms linear`;
            }, 10);
        }

        // Adiciona ao container
        this.container.appendChild(notification);
        this.activeNotifications.push(notificationId);

        // Anima entrada
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto-remove
        if (duration > 0 && type !== 'loading') {
            setTimeout(() => this.hide(notificationId), duration);
        }

        return notificationId;
    }

    /**
     * Esconde uma notificação
     */
    hide(notificationId) {
        const notification = document.getElementById(notificationId);
        if (!notification) return;

        notification.classList.add('hide');
        notification.classList.remove('show');

        setTimeout(() => {
            notification.remove();
            this.activeNotifications = this.activeNotifications.filter(id => id !== notificationId);
            
            // Processa próxima da fila
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                this.show(next.message, next.type, next.options);
            }
        }, 300);
    }

    /**
     * Atualiza uma notificação existente
     */
    update(notificationId, message, type, options = {}) {
        this.hide(notificationId);
        return this.show(message, type, { ...options, id: notificationId });
    }

    /**
     * Remove todas as notificações
     */
    clearAll() {
        this.activeNotifications.forEach(id => this.hide(id));
        this.queue = [];
    }

    /**
     * Atalhos para tipos específicos
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { duration: 7000, ...options });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    loading(message, options = {}) {
        return this.show(message, 'loading', { duration: 0, closable: false, ...options });
    }
}

// Cria instância global
window.notify = new NotificationSystem();

// Funções de conveniência globais
window.showNotification = (message, type, options) => window.notify.show(message, type, options);
window.notifySuccess = (message, options) => window.notify.success(message, options);
window.notifyError = (message, options) => window.notify.error(message, options);
window.notifyWarning = (message, options) => window.notify.warning(message, options);
window.notifyInfo = (message, options) => window.notify.info(message, options);
window.notifyLoading = (message, options) => window.notify.loading(message, options);
