// Widget de Chat CHANNEL - Versão Simplificada
(function() {
    const CONFIG = {
        wabaId: 'f0e8e993-97ff-40b1-8111-8f75d77a9343',
        websocketToken: '20757fb5-0187-475d-8c6d-2d0778bdd96f',
        tenantId: '2',
        apiBase: 'https://api.maxzap.com.br',
        maxReconnectAttempts: 5,
        reconnectDelay: 5000,
        pingInterval: 30000,
        historyInterval: 60000
    };

    const HTML = `
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css" rel="stylesheet">
    <div id="channel-chat-widget">
        <button id="channel-chat-button">
            <img src="https://painel.maxzap.com.br/webchat-logo.png" alt="WebChat">
        </button>
    </div>
    <div id="channel-chat-container">
        <div id="channel-chat-header">
            <h3>WEBChat</h3>
            <span id="channel-chat-session" style="font-size:11px;color:#e3f2fd;margin-left:8px;"></span>
            <div style="display:flex;gap:8px;">
                <button id="channel-chat-clear" title="Nova sessão" style="background:none;border:none;color:white;cursor:pointer;">
                    <i class="mdi mdi-reload" style="font-size:16px;"></i>
                </button>
                <button id="channel-chat-close" title="Fechar" style="background:none;border:none;color:white;cursor:pointer;">
                    <i class="mdi mdi-close" style="font-size:16px;"></i>
                </button>
            </div>
        </div>
        <div id="channel-chat-messages"></div>
        <div id="channel-chat-input-area">
            <input type="text" id="channel-chat-input" placeholder="Digite sua mensagem...">
            <input type="file" id="channel-chat-file" style="display:none;" accept="image/*,video/*,audio/*,.pdf,.doc,.docx">
            <button id="channel-chat-attach" title="Anexar" style="background:none;border:none;color:#2196F3;cursor:pointer;padding:0 8px;">
                <i class="mdi mdi-paperclip"></i>
            </button>
            <button id="channel-chat-send" title="Enviar" style="background:none;border:none;color:#2196F3;cursor:pointer;padding:0 8px;">
                <i class="mdi mdi-send"></i>
            </button>
        </div>
    </div>
    <style>
        #channel-chat-widget{position:fixed;bottom:20px;right:20px;z-index:9999}
        #channel-chat-button{width:60px;height:60px;border-radius:50%;background:#2196F3;border:none;box-shadow:0 2px 10px rgba(0,0,0,.2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .3s}
        #channel-chat-button:hover{transform:scale(1.1)}
        #channel-chat-button img{width:30px;height:30px}
        #channel-chat-container{display:none;position:fixed;bottom:90px;right:20px;width:320px;height:500px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);flex-direction:column;z-index:9998}
        #channel-chat-container.show{display:flex}
        #channel-chat-header{background:#2196F3;color:white;padding:12px 16px;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center}
        #channel-chat-header h3{margin:0;font-size:16px}
        #channel-chat-messages{flex:1;overflow-y:auto;padding:16px;background:#f7fafd}
        #channel-chat-input-area{display:flex;padding:12px;background:#f7fafd;border-top:1px solid #e0e0e0;align-items:center}
        #channel-chat-input{flex:1;padding:8px;border:1px solid #cfd8dc;border-radius:8px;font-size:14px;outline:none;margin-right:8px}
        #channel-chat-attach,#channel-chat-send{width:32px;height:32px;border-radius:50%;transition:background-color .2s;background:none;border:none;cursor:pointer;font-size:20px;padding:0;display:flex;align-items:center;justify-content:center}
        #channel-chat-attach:hover,#channel-chat-send:hover{background-color:rgba(33,150,243,.1)}
        .channel-message{max-width:75%;margin-bottom:8px;padding:8px 12px;border-radius:16px;word-break:break-word;font-size:14px}
        .channel-sent{background:#d1eaff;margin-left:auto;border-bottom-right-radius:4px}
        .channel-received{background:#fff;margin-right:auto;border-bottom-left-radius:4px;border:1px solid #e3f2fd;box-shadow:0 1px 2px rgba(33,150,243,.06)}
        .channel-ack{font-size:10px;color:#888;margin-left:8px}
        .channel-media{max-width:200px;margin:4px 0}
        .channel-media img,.channel-media video{width:100%;border-radius:8px;cursor:pointer}
        .channel-media audio{width:100%}
        .channel-media-document{display:flex;align-items:center;padding:8px;background:#f5f5f5;border-radius:8px;text-decoration:none;color:#333}
        .channel-media-document i{margin-right:8px;font-size:24px}
        .channel-media-caption{margin-top:4px;font-size:13px;color:#666;padding:4px 8px;background:#f5f5f5;border-radius:4px}
        @media(max-width:480px){#channel-chat-container{width:100%;height:100vh;bottom:0;right:0;border-radius:0}}
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', HTML);

    // Elementos DOM
    const els = {
        button: document.getElementById('channel-chat-button'),
        container: document.getElementById('channel-chat-container'),
        close: document.getElementById('channel-chat-close'),
        clear: document.getElementById('channel-chat-clear'),
        messages: document.getElementById('channel-chat-messages'),
        input: document.getElementById('channel-chat-input'),
        send: document.getElementById('channel-chat-send'),
        session: document.getElementById('channel-chat-session'),
        file: document.getElementById('channel-chat-file'),
        attach: document.getElementById('channel-chat-attach')
    };

    // Estado
    let state = {
        webchatId: null,
        token: null,
        ws: null,
        chatLoaded: false,
        reconnectAttempts: 0,
        intervals: { ping: null, history: null }
    };

    // Utilitários
    const utils = {
        generateId: () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
        getSessionId: () => {
            if (!sessionStorage.getItem('channelWebchatId')) {
                sessionStorage.setItem('channelWebchatId', utils.generateId());
            }
            return sessionStorage.getItem('channelWebchatId');
        },
        formatTime: (dateString) => new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        formatText: (text) => {
            let formatted = String(text || '');
            formatted = formatted.replace(/\*(.*?)\*/g, '<b>$1</b>');
            formatted = formatted.replace(/NEW LINE|\\n|\n/gi, '<br>');
            return formatted;
        },
        buildMediaUrl: (mediaUrl) => {
            if (!mediaUrl || mediaUrl.startsWith('http')) return mediaUrl;
            return `${CONFIG.apiBase}/public/${CONFIG.tenantId}/${mediaUrl}`;
        },
        sanitizeFileName: (filename) => {
    if (!filename) return 'arquivo';

    const name = filename
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.\-_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');

    return name || 'arquivo';

        },
        getAckIcon: (ack) => {
            const icons = { 0: '🕓', 1: '✔️', 2: '<span style="color:#9E9E9E;">✔️</span>', 3: '<span style="color:#2196F3;">✔️✔️</span>', '-1': '❌' };
            return icons[ack] || '';
        }
    };

    // API
    const api = {
        register: async () => {
            state.webchatId = utils.getSessionId();
            const response = await fetch(`${CONFIG.apiBase}/webchat/register/${CONFIG.wabaId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-websocket-token': CONFIG.websocketToken },
                body: JSON.stringify({ webchatId: state.webchatId, name: `WebChat ${state.webchatId}`, email: 'webchat@webchat.com', tenantId: CONFIG.tenantId })
            });
            const data = await response.json();
            state.token = data.token;
            return data;
        },
        loadHistory: async () => {
            const response = await fetch(`${CONFIG.apiBase}/webchat/messages/${CONFIG.wabaId}?from=${state.webchatId}&tenantId=${CONFIG.tenantId}`, {
                headers: { 'x-websocket-token': CONFIG.websocketToken }
            });
            return await response.json();
        },
        sendMessage: async (body, mediaType = null, fileName = null) => {
            const data = {
                body, from: state.webchatId, name: state.webchatId, email: `${state.webchatId}@webchat.com`,
                tenantId: CONFIG.tenantId, event: 'messages.upsert', fromMe: false, channel: 'webchat', type: 'webchat', webchatId: state.webchatId
            };
            if (mediaType) { data.mediaType = mediaType; data.fileName = fileName; }

            const response = await fetch(`${CONFIG.apiBase}/webchat-webhook/${CONFIG.wabaId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-websocket-token': CONFIG.websocketToken },
                body: JSON.stringify(data)
            });
            return await response.json();
        },
        sendMedia: async (file) => {
            const formData = new FormData();
            const sanitized = utils.sanitizeFileName(file.name);
            formData.append('medias', file, sanitized);
            formData.append('data', JSON.stringify({
                body: `caption: ${els.input.value.trim() || 'Mídia enviada'}`,
                from: state.webchatId, name: state.webchatId, email: `${state.webchatId}@webchat.com`,
                tenantId: CONFIG.tenantId, event: 'messages.upsert', fromMe: false, channel: 'webchat', type: 'webchat',
                webchatId: state.webchatId, mediaType: file.type.split('/')[0], fileName: sanitized
            }));

            const response = await fetch(`${CONFIG.apiBase}/webchat-webhook/${CONFIG.wabaId}`, {
                method: 'POST',
                headers: { 'x-websocket-token': CONFIG.websocketToken },
                body: formData
            });
            return await response.json();
        }
    };

    // UI
    const ui = {
        appendMessage: (text, type, time = '', ack = null, id = null, mediaType = null, mediaUrl = null) => {
            const msgDiv = document.createElement('div');
            if (id) msgDiv.id = `msg-${id}`;
            msgDiv.className = `channel-message ${type}`;

            let caption = '';
            if (text && text.startsWith('caption: ')) {
                caption = text.substring(9);
                text = '';
            }

            let contentHtml = '';
            if (mediaType && mediaUrl) {
                const fullUrl = utils.buildMediaUrl(mediaUrl);
                const captionHtml = caption ? `<div class="channel-media-caption">${utils.formatText(caption)}</div>` : '';

                switch (mediaType.toLowerCase()) {
                    case 'image':
                        contentHtml = `<div class="channel-media"><img src="${fullUrl}" alt="Imagem" onclick="window.open('${fullUrl}','_blank')"></div>${captionHtml}`;
                        break;
                    case 'video':
                        contentHtml = `<div class="channel-media"><video controls><source src="${fullUrl}" type="video/mp4"></video></div>${captionHtml}`;
                        break;
                    case 'audio':
                        contentHtml = `<div class="channel-media"><audio controls><source src="${fullUrl}" type="audio/mpeg"></audio></div>${captionHtml}`;
                        break;
                    case 'document':
                        contentHtml = `<a href="${fullUrl}" class="channel-media-document" target="_blank">📄 ${caption || 'Documento'}</a>`;
                        break;
                    default:
                        contentHtml = `<span>${utils.formatText(text)}</span>`;
                }
            } else {
                contentHtml = `<span>${utils.formatText(text)}</span>`;
            }

            const ackHtml = type === 'channel-sent' && ack !== null ? `<span class="channel-ack">${utils.getAckIcon(ack)}</span>` : '';
            msgDiv.innerHTML = `${contentHtml}<br><span style="font-size:10px;color:#888;">${time} ${ackHtml}</span>`;
            els.messages.appendChild(msgDiv);
            els.messages.scrollTop = els.messages.scrollHeight;
        },
        renderHistory: (messages) => {
            els.messages.innerHTML = '';
            messages.forEach(msg => {
                ui.appendMessage(msg.body, msg.fromMe ? 'channel-received' : 'channel-sent', utils.formatTime(msg.createdAt), msg.ack, msg.id, msg.mediaType, msg.mediaUrl);
            });
        },
        updateAck: (messageId, ack) => {
            const msgDiv = document.getElementById(`msg-${messageId}`);
            if (msgDiv) {
                const ackSpan = msgDiv.querySelector('.channel-ack');
                if (ackSpan) ackSpan.innerHTML = utils.getAckIcon(ack);
            }
        },
        updateMessageId: (tempId, realId) => {
            const tempDiv = document.getElementById(`msg-${tempId}`);
            if (tempDiv) tempDiv.id = `msg-${realId}`;
        }
    };

    // WebSocket
    function connectWebSocket() {
        if (!state.webchatId || !state.token) return;

        function connect() {
            state.ws = new WebSocket(`wss://${CONFIG.apiBase.replace('https://', '')}/wss?from=${state.webchatId}&token=${state.token}`);

            state.ws.onopen = () => {
                state.reconnectAttempts = 0;
                state.intervals.ping = setInterval(() => {
                    if (state.ws.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify({ type: 'ping' }));
                }, CONFIG.pingInterval);
                state.intervals.history = setInterval(async () => {
                    if (state.ws.readyState === WebSocket.OPEN) {
                        const messages = await api.loadHistory();
                        if (Array.isArray(messages)) ui.renderHistory(messages);
                    }
                }, CONFIG.historyInterval);
            };

            state.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'webhook' && data.payload?.message) {
                        const msg = data.payload.message;
                        ui.appendMessage(msg.body, 'channel-received', utils.formatTime(msg.createdAt), msg.ack, msg.id, msg.mediaType, msg.mediaUrl);
                        if (msg.mediaType) api.loadHistory().then(msgs => Array.isArray(msgs) && ui.renderHistory(msgs));
                    }
                    if (data.type === 'ack_update' && data.payload) {
                        if (data.payload.mediaType) {
                            const msgDiv = document.getElementById(`msg-${data.payload.id}`);
                            if (msgDiv) msgDiv.remove();
                            ui.appendMessage(data.payload.body, 'channel-sent', utils.formatTime(data.payload.createdAt), data.payload.ack, data.payload.id, data.payload.mediaType, data.payload.mediaUrl);
                        } else {
                            ui.updateAck(data.payload.messageId, data.payload.ack);
                        }
                    }
                } catch (error) {
                    console.error('[WebChat] Erro ao processar mensagem:', error);
                }
            };

            state.ws.onclose = () => {
                clearInterval(state.intervals.ping);
                clearInterval(state.intervals.history);
                if (state.reconnectAttempts < CONFIG.maxReconnectAttempts) {
                    state.reconnectAttempts++;
                    setTimeout(connect, CONFIG.reconnectDelay);
                }
            };
        }

        connect();
    }

    // Event Listeners
    els.button.addEventListener('click', async () => {
        els.container.classList.add('show');
        if (!state.chatLoaded) {
            const messages = await api.loadHistory();
            if (Array.isArray(messages)) ui.renderHistory(messages);
            connectWebSocket();
            state.chatLoaded = true;
        }
    });

    els.close.addEventListener('click', () => els.container.classList.remove('show'));

    els.send.addEventListener('click', async () => {
        const message = els.input.value.trim();
        if (message) {
            const tempId = utils.generateId();
            ui.appendMessage(message, 'channel-sent', utils.formatTime(new Date().toISOString()), 0, tempId);
            els.input.value = '';
            const respData = await api.sendMessage(message);
            if (respData?.id) ui.updateMessageId(tempId, respData.id);
            const messages = await api.loadHistory();
            if (Array.isArray(messages)) ui.renderHistory(messages);
        }
    });

    els.input.addEventListener('keypress', (e) => e.key === 'Enter' && els.send.click());

    els.attach.addEventListener('click', () => els.file.click());

    els.file.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const tempId = utils.generateId();
            ui.appendMessage(`caption: ${els.input.value.trim() || 'Mídia'}`, 'channel-sent', utils.formatTime(new Date().toISOString()), 0, tempId);
            els.input.value = '';
            await api.sendMedia(file);
            const messages = await api.loadHistory();
            if (Array.isArray(messages)) ui.renderHistory(messages);
        }
        els.file.value = '';
    });

    els.clear.addEventListener('click', async () => {
        if (confirm('Deseja limpar a sessão?')) {
            els.messages.innerHTML = '';
            sessionStorage.removeItem('channelWebchatId');
            if (state.ws) state.ws.close();
            state = { webchatId: null, token: null, ws: null, chatLoaded: false, reconnectAttempts: 0, intervals: { ping: null, history: null } };
            await api.register();
            els.session.textContent = `Sessão: ${state.webchatId}`;
            const messages = await api.loadHistory();
            if (Array.isArray(messages)) ui.renderHistory(messages);
            connectWebSocket();
        }
    });

    // Inicializar
    (async () => {
        await api.register();
        els.session.textContent = `Sessão: ${state.webchatId}`;
    })();
})();
