/**
 * Sistema de Notificações Modernas - NEXO GESTOR
 * Uso: notify.success('Mensagem'), notify.error('Erro'), notify.warning('Aviso')
 */

const notify = {
    // Configurações padrão
    config: {
        position: 'top-right',
        duration: 4000,
        maxNotifications: 5
    },

    // Container de notificações
    container: null,

    // Inicializar container
    init() {
        if (this.container) return;
        
        this.container = document.createElement('div');
        this.container.id = 'nexo-notifications';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);

        // Adicionar estilos CSS
        if (!document.getElementById('nexo-notify-styles')) {
            const style = document.createElement('style');
            style.id = 'nexo-notify-styles';
            style.textContent = `
                @keyframes nexo-slide-in {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes nexo-slide-out {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
                .nexo-notification {
                    padding: 16px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                    animation: nexo-slide-in 0.3s ease-out;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    position: relative;
                    overflow: hidden;
                }
                .nexo-notification::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: rgba(255,255,255,0.3);
                    animation: nexo-progress linear;
                }
                @keyframes nexo-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .nexo-notification.nexo-out {
                    animation: nexo-slide-out 0.3s ease-in forwards;
                }
                .nexo-notification-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                .nexo-notification-content {
                    flex: 1;
                }
                .nexo-notification-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .nexo-notification-message {
                    font-weight: 400;
                    opacity: 0.95;
                }
                .nexo-notification-close {
                    font-size: 18px;
                    opacity: 0.7;
                    cursor: pointer;
                    flex-shrink: 0;
                    padding: 0 4px;
                }
                .nexo-notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Mostrar notificação
    show(message, type = 'info', options = {}) {
        this.init();

        const {
            title = '',
            duration = this.config.duration,
            onClick = null
        } = options;

        // Cores e ícones por tipo
        const types = {
            success: {
                bg: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
                icon: '✓'
            },
            error: {
                bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                icon: '✕'
            },
            warning: {
                bg: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
                icon: '⚠'
            },
            info: {
                bg: 'linear-gradient(135deg, #4c6ef5 0%, #3b5bdb 100%)',
                icon: 'ⓘ'
            }
        };

        const config = types[type] || types.info;

        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'nexo-notification';
        notification.style.background = config.bg;

        // Conteúdo
        notification.innerHTML = `
            <div class="nexo-notification-icon">${config.icon}</div>
            <div class="nexo-notification-content">
                ${title ? `<div class="nexo-notification-title">${title}</div>` : ''}
                <div class="nexo-notification-message">${message}</div>
            </div>
            <div class="nexo-notification-close">×</div>
        `;

        // Animação da barra de progresso
        const progressBar = notification.querySelector('::before');
        if (progressBar) {
            progressBar.style.animationDuration = `${duration}ms`;
        }

        // Evento de fechar ao clicar no X
        const closeBtn = notification.querySelector('.nexo-notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(notification);
        });

        // Evento de clique na notificação
        if (onClick) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', onClick);
        } else {
            notification.addEventListener('click', () => this.remove(notification));
        }

        // Adicionar ao container
        this.container.appendChild(notification);

        // Limitar número de notificações
        const notifications = this.container.querySelectorAll('.nexo-notification');
        if (notifications.length > this.config.maxNotifications) {
            this.remove(notifications[0]);
        }

        // Auto-remover após duração
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    this.remove(notification);
                }
            }, duration);
        }

        return notification;
    },

    // Remover notificação
    remove(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.add('nexo-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    // Atalhos para tipos específicos
    success(message, options = {}) {
        return this.show(message, 'success', options);
    },

    error(message, options = {}) {
        return this.show(message, 'error', options);
    },

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    },

    info(message, options = {}) {
        return this.show(message, 'info', options);
    },

    // Limpar todas as notificações
    clear() {
        if (this.container) {
            const notifications = this.container.querySelectorAll('.nexo-notification');
            notifications.forEach(n => this.remove(n));
        }
    }
};

// Compatibilidade com código existente (se houver)
window.notify = notify;

// Exemplo de uso:
// notify.success('Operação concluída!');
// notify.error('Erro ao processar solicitação');
// notify.warning('Atenção: dados não salvos');
// notify.info('Nova versão disponível');
// notify.success('Salvo!', { title: 'Sucesso', duration: 3000 });
