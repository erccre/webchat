
// Widget de Chat CHANNEL
(function() {
    // Cria o elemento do widget
    const widgetHTML = `
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css" rel="stylesheet">
    <div id="channel-chat-widget">
        <button id="channel-chat-button">
            <img src="https://painel.maxzap.com.br/webchat-logo.png" alt="WebChat Logo">
        </button>
    </div>

    <div id="channel-chat-container">
        <div id="channel-chat-header">
            <h3>WEBChat</h3>
            <span id="channel-chat-session" style="font-size:11px;color:#e3f2fd;margin-left:8px;"></span>
            <div style="display: flex; gap: 8px;">
                <button id="channel-chat-clear" title="Nova sessão" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;"><i class="mdi mdi-reload" style="font-size:16px;"></i></button>
                <button id="channel-chat-close" title="Fechar" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;"><i class="mdi mdi-close" style="font-size:16px;"></i></button>
            </div>
        </div>
        <div id="channel-chat-messages"></div>
        <div id="channel-chat-input-area">
            <input type="text" id="channel-chat-input" placeholder="Digite sua mensagem...">
            <input type="file" id="channel-chat-file" style="display: none;" accept="image/*,video/*,audio/*,.pdf,.doc,.docx">
            <button id="channel-chat-attach" title="Anexar arquivo" style="background: none; border: none; color: #2196F3; cursor: pointer; font-size: 20px; padding: 0 8px;"><i class="mdi mdi-paperclip"></i></button>
            <button id="channel-chat-send" title="Enviar mensagem" style="background: none; border: none; color: #2196F3; cursor: pointer; font-size: 20px; padding: 0 8px;"><i class="mdi mdi-send"></i></button>
        </div>
    </div>

    <style>
        #channel-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }

        #channel-chat-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #2196F3;
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s;
        }

        #channel-chat-button:hover {
            transform: scale(1.1);
        }

        #channel-chat-button img {
            width: 30px;
            height: 30px;
        }

        #channel-chat-container {
            display: none;
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 320px;
            height: 500px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            flex-direction: column;
            transition: all 0.3s;
            z-index: 9998;
        }

        #channel-chat-container.show {
            display: flex;
        }

        #channel-chat-widget.hide {
            display: none;
        }

        #channel-chat-header {
            background: #2196F3;
            color: white;
            padding: 12px 16px;
            border-radius: 16px 16px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        #channel-chat-header h3 {
            margin: 0;
            font-size: 16px;
        }

        #channel-chat-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
        }

        #channel-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f7fafd;
        }

        #channel-chat-input-area {
            display: flex;
            padding: 12px;
            background: #f7fafd;
            border-top: 1px solid #e0e0e0;
            align-items: center;
        }

        #channel-chat-attach {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            transition: background-color 0.2s;
            color: #2196F3;
        }

        #channel-chat-attach:hover {
            background-color: rgba(33, 150, 243, 0.1);
        }

        #channel-chat-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #cfd8dc;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            margin-right: 8px;
        }

        #channel-chat-send {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            transition: background-color 0.2s;
            color: #2196F3;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 20px;
            padding: 0;
        }

        #channel-chat-send:hover {
            background-color: rgba(33, 150, 243, 0.1);
        }

        .mdi {
            font-size: 24px;
            line-height: 1;
        }

        .channel-message {
            max-width: 75%;
            margin-bottom: 8px;
            padding: 8px 12px;
            border-radius: 16px;
            word-break: break-word;
            font-size: 14px;
        }

        .channel-sent {
            background: #d1eaff;
            margin-left: auto;
            border-bottom-right-radius: 4px;
        }

        .channel-received {
            background: #fff;
            margin-right: auto;
            border-bottom-left-radius: 4px;
            border: 1px solid #e3f2fd;
            box-shadow: 0 1px 2px rgba(33,150,243,0.06);
        }

        .channel-ack {
            font-size: 10px;
            color: #888;
            margin-left: 8px;
        }

        .channel-media {
            max-width: 200px;
            margin: 4px 0;
        }

        .channel-media img {
            width: 100%;
            border-radius: 8px;
            cursor: pointer;
        }

        .channel-media video {
            width: 100%;
            border-radius: 8px;
            cursor: pointer;
        }

        .channel-media audio {
            width: 100%;
        }

        .channel-media-document {
            display: flex;
            align-items: center;
            padding: 8px;
            background: #f5f5f5;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
        }

        .channel-media-document i {
            margin-right: 8px;
            font-size: 24px;
        }

        .channel-media-caption {
            margin-top: 4px;
            font-size: 13px;
            color: #666;
            padding: 4px 8px;
            background: #f5f5f5;
            border-radius: 4px;
        }

        .channel-menu-wrapper {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .channel-menu-title {
            font-size: 13px;
            font-weight: 600;
            color: #1565c0;
            word-break: break-word;
        }
        .channel-menu-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .channel-menu-pill {
            border: 1px solid #2196F3;
            background: #ffffff;
            color: #2196F3;
            padding: 7px 10px;
            border-radius: 18px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
            max-width: 100%;
            word-break: break-word;
        }
        .channel-menu-pill:hover {
            background: #2196F3;
            color: #ffffff;
        }

        @media (max-width: 480px) {
            #channel-chat-container {
                width: 100%;
                height: 100vh;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
            #channel-chat-widget {
                right: 20px;
                bottom: 20px;
            }
        }
    </style>
    `;

    // Adiciona o widget ao documento
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Inicializa o widget
    const chatButton = document.getElementById('channel-chat-button');
    const chatContainer = document.getElementById('channel-chat-container');
    const chatClose = document.getElementById('channel-chat-close');
    const chatClear = document.getElementById('channel-chat-clear');
    const messagesDiv = document.getElementById('channel-chat-messages');
    const messageInput = document.getElementById('channel-chat-input');
    const sendButton = document.getElementById('channel-chat-send');
    const sessionSpan = document.getElementById('channel-chat-session');
    const widgetDiv = document.getElementById('channel-chat-widget');
    const fileInput = document.getElementById('channel-chat-file');
    const attachButton = document.getElementById('channel-chat-attach');

    // Variáveis globais para sessão e token
    let webchatId = null;
    let token = null;
    let ws = null;
    let chatLoaded = false;
    const tenantId = '2';

    // Funções de controle do widget
    chatButton.addEventListener('click', async () => {
        chatContainer.classList.add('show');
        if (!chatLoaded) {
            await loadMessageHistory();
            connectWebSocket();
            chatLoaded = true;
        }
    });

    chatClose.addEventListener('click', () => {
        chatContainer.classList.remove('show');
    });

    // Função para gerar ID único de sessão
    function generateUniqueId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${random}`;
    }
    function generateSessionId() {
        if (!sessionStorage.getItem('channelWebchatId')) {
            sessionStorage.setItem('channelWebchatId', generateUniqueId());
        }
        return sessionStorage.getItem('channelWebchatId');
    }

    // Função para registrar o usuário no backend
    async function registerWebchat() {
        webchatId = generateSessionId();
        const name = 'WebChat ' + webchatId;
        const email = 'webchat@webchat.com';
        const tenantId = '2';
        const wabaId = 'f0e8e993-97ff-40b1-8111-8f75d77a9343';
        const websocketToken = '20757fb5-0187-475d-8c6d-2d0778bdd96f';
        const response = await fetch(`https://api.maxzap.com.br/webchat/register/${wabaId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-websocket-token': websocketToken
            },
            body: JSON.stringify({ webchatId, name, email, tenantId })
        });
        const data = await response.json();
        token = data.token;
        return { webchatId, token };
    }

    // Exibe o ID da sessão
    async function showSessionId() {
        const { webchatId } = await registerWebchat();
        sessionSpan.textContent = `Sessão: ${webchatId}`;
    }
    showSessionId();

    // Função para formatar hora
    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // Função para formatar texto estilo WhatsApp
    function formatWhatsapp(text) {
        let formatted = String(text || '');
        formatted = formatted.replace(/\*(.*?)\*/g, '<b>$1</b>');
        formatted = formatted.replace(/NEW LINE/gi, '<br>');
        formatted = formatted.replace(/\\n/g, '<br>');
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function parseMenuMessage(text) {
        const raw = String(text || '').trim();
        if (!raw.startsWith('#MENU')) return null;
        const normalized = raw
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/NEW LINE/gi, '\n')
            .replace(/\\n/g, '\n');
        const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) return null;
        const title = lines[0].replace(/^#MENU\s*/i, '').trim() || 'Escolha uma opcao';
        const items = lines.slice(1).map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
        if (!items.length) return null;
        return { title, items };
    }

    function buildMenuHtml(menu) {
        const buttonsHtml = menu.items.map(item => {
            const safe = escapeHtml(item);
            return `<button type="button" class="channel-menu-pill" data-menu-send="${safe}">${safe}</button>`;
        }).join('');
        return `<div class="channel-menu-wrapper"><div class="channel-menu-title">${escapeHtml(menu.title)}</div><div class="channel-menu-container">${buttonsHtml}</div></div>`;
    }


    // Função para construir URL completa da mídia
    function buildMediaUrl(mediaUrl) {
        if (!mediaUrl) return null;
        if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
            return mediaUrl;
        }
        const baseUrl = `https://api.maxzap.com.br/public/${tenantId}`;
        return `${baseUrl}/${mediaUrl}`;
    }

    // Função para adicionar mensagem
    function appendMessage(text, type, time = '', ack = null, id = null, mediaType = null, mediaUrl = null) {
        const messageDiv = document.createElement('div');
        if (id) messageDiv.id = 'msg-' + id;
        messageDiv.className = `channel-message ${type}`;
        let ackHtml = '';
        if (type === 'channel-sent' && ack !== null && ack !== undefined) {
            ackHtml = `<span class="channel-ack">${getAckIcon(ack)}</span>`;
        }

        let contentHtml = '';
        let caption = '';
        
        if (text && text.startsWith('caption: ')) {
            caption = text.substring(9);
            text = '';
        }

        if (mediaType && mediaUrl) {
            const fullMediaUrl = buildMediaUrl(mediaUrl);
            switch (mediaType.toLowerCase()) {
                case 'image':
                    contentHtml = `<div class="channel-media">
                        <img src="${fullMediaUrl}" alt="Imagem" onclick="window.open('${fullMediaUrl}', '_blank')">
                        ${caption ? `<div class="channel-media-caption">${formatWhatsapp(caption)}</div>` : ''}
                    </div>`;
                    break;
                case 'video':
                    contentHtml = `<div class="channel-media">
                        <video controls><source src="${fullMediaUrl}" type="video/mp4"></video>
                        ${caption ? `<div class="channel-media-caption">${formatWhatsapp(caption)}</div>` : ''}
                    </div>`;
                    break;
                case 'audio':
                    contentHtml = `<div class="channel-media">
                        <audio controls><source src="${fullMediaUrl}" type="audio/mpeg"></audio>
                        ${caption ? `<div class="channel-media-caption">${formatWhatsapp(caption)}</div>` : ''}
                    </div>`;
                    break;
                case 'document':
                    contentHtml = `<a href="${fullMediaUrl}" class="channel-media-document" target="_blank">
                        <i>📄</i>${caption || 'Documento'}
                    </a>`;
                    break;
                default:
                    contentHtml = `<span>${formatWhatsapp(text)}</span>`;
            }
        } else {

            const menuData = parseMenuMessage(text);
            if (menuData) {
                contentHtml = buildMenuHtml(menuData);
            } else {
                contentHtml = `<span style="white-space:normal;">${formatWhatsapp(text)}</span>`;
            }

        }

        messageDiv.innerHTML = `${contentHtml}<br><span style="font-size:10px;color:#888;">${time} ${ackHtml}</span>`;
        messagesDiv.appendChild(messageDiv);

        messageDiv.querySelectorAll('[data-menu-send]').forEach(btn => {
            btn.addEventListener('click', () => {
                messageInput.value = btn.getAttribute('data-menu-send');
                sendButton.click();
            });
        });

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Função para atualizar o ack de uma mensagem
    function updateMessageAck(messageId, ack) {
        const msgDiv = document.getElementById('msg-' + messageId);
        if (msgDiv) {
            const ackSpan = msgDiv.querySelector('.channel-ack');
            if (ackSpan) {
                ackSpan.innerHTML = getAckIcon(ack);
            }
        }
    }

    // Função para obter ícone do ack
    function getAckIcon(ack) {
        if (ack === 0) return '🕓';
        if (ack === 1) return '✔️';
        if (ack === 2) return '<span style="color:#9E9E9E;">✔️</span>';
        if (ack === 3) return '<span style="color:#2196F3;">✔️✔️</span>';
        if (ack === -1) return '❌';
        return '';
    }

    // Função para renderizar o histórico completo
    function renderHistory(messages) {
        messagesDiv.innerHTML = '';
        messages.forEach(msg => {
            appendMessage(
                msg.body,
                msg.fromMe ? 'channel-received' : 'channel-sent',
                formatTime(msg.createdAt),
                msg.ack,
                msg.id,
                msg.mediaType,
                msg.mediaUrl
            );
        });
    }

    // Função para carregar histórico de mensagens
    async function loadMessageHistory() {
        try {
            const wabaId = 'f0e8e993-97ff-40b1-8111-8f75d77a9343';
            const websocketToken = '20757fb5-0187-475d-8c6d-2d0778bdd96f';
            const response = await fetch(`https://api.maxzap.com.br/webchat/messages/${wabaId}?from=${webchatId}&tenantId=2`, {
                headers: {
                    'x-websocket-token': websocketToken
                }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                renderHistory(data);
            } else {
                process.env.LOGGER_WARN === 'true' && console.warn('[WebChat] Resposta da API não é um array:', data);
            }
        } catch (error) {
            process.env.LOGGER_ERROR === 'true' && console.error('[WebChat] Erro ao carregar histórico:', error);
        }
    }

    // Função para gerar um ID temporário para mensagens enviadas
    function generateTempId() {
        return 'temp-' + Math.random().toString(36).substr(2, 9);
    }

    // Função para atualizar o ID de uma mensagem no DOM
    function updateMessageId(tempId, realId) {
        const tempDiv = document.getElementById('msg-' + tempId);
        if (tempDiv) {
            tempDiv.id = 'msg-' + realId;
        }
    }

    // Função para sanitizar o nome do arquivo
    function sanitizeFileName(filename) {
        if (!filename) return '';
        return filename
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.\-_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    // Função para enviar mídia
    async function sendMedia(file) {
        const sanitizedFileName = sanitizeFileName(file.name);
        const formData = new FormData();
        
        formData.append('medias', file, sanitizedFileName);
        
        const data = {
            body: 'caption: ' + (messageInput.value.trim() || 'Mídia enviada'),
            from: webchatId,
            name: webchatId,
            email: webchatId + '@webchat.com',
            tenantId: '2',
            event: 'messages.upsert',
            fromMe: false,
            channel: 'webchat',
            type: 'webchat',
            webchatId: webchatId,
            mediaType: file.type.split('/')[0],
            fileName: sanitizedFileName
        };

        formData.append('data', JSON.stringify(data));

        try {
            const wabaId = 'f0e8e993-97ff-40b1-8111-8f75d77a9343';
            const websocketToken = '20757fb5-0187-475d-8c6d-2d0778bdd96f';

            const response = await fetch(`https://api.maxzap.com.br/webchat-webhook/${wabaId}`, {
                method: 'POST',
                headers: {
                    'x-websocket-token': websocketToken
                },
                body: formData
            });
            
            const responseText = await response.text();

            let respData = {};
            if (responseText) {
                try {
                    respData = JSON.parse(responseText);
                } catch (parseError) {
                    process.env.LOGGER_ERROR === 'true' && console.error('[WebChat] Erro ao fazer parse da resposta:', parseError);
                    throw new Error('Resposta inválida do servidor');
                }
            }

            if (!response.ok) {
                throw new Error(respData.message || 'Erro ao enviar mídia');
            }

            messageInput.value = '';
            
            const tempId = generateTempId();
            appendMessage(
                data.body,
                'channel-sent',
                formatTime(new Date().toISOString()),
                0,
                tempId,
                data.mediaType,
                null
            );

            await loadMessageHistory();

        } catch (error) {
            process.env.LOGGER_ERROR === 'true' && console.error('[WebChat] Erro detalhado ao enviar mídia:', {
                mensagem: error.message,
                stack: error.stack,
                erro: error
            });
            alert('Erro ao enviar mídia. Por favor, tente novamente.');
        }
    }

    // Event listeners para envio de mensagem
    sendButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message) {
            const tempId = generateTempId();
            appendMessage(message, 'channel-sent', formatTime(new Date().toISOString()), 0, tempId);
            messageInput.value = '';
            const data = {
                body: message,
                from: webchatId,
                name: webchatId,
                email: webchatId + '@webchat.com',
                tenantId: '2',
                event: 'messages.upsert',
                fromMe: false,
                channel: 'webchat',
                type: 'webchat',
                webchatId: webchatId
            };
            try {
                const wabaId = 'f0e8e993-97ff-40b1-8111-8f75d77a9343';
                const websocketToken = '20757fb5-0187-475d-8c6d-2d0778bdd96f';
                const response = await fetch(`https://api.maxzap.com.br/webchat-webhook/${wabaId}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-websocket-token': websocketToken
                    },
                    body: JSON.stringify(data)
                });
                const respData = await response.json();
                if (respData && respData.id) {
                    updateMessageId(tempId, respData.id);
                }
                if (respData && respData.mediaUrl) {
                    appendMessage(
                        respData.body,
                        'channel-sent',
                        formatTime(new Date().toISOString()),
                        0,
                        respData.id || tempId,
                        respData.mediaType,
                        respData.mediaUrl
                    );
                }

                await loadMessageHistory();

            } catch (error) {
                process.env.LOGGER_ERROR === 'true' && console.error('[WebChat] Erro ao enviar mensagem:', error);
            }
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    // Event listener para o botão de anexo
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Event listener para seleção de arquivo
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            sendMedia(file);
        }
        fileInput.value = '';
    });

    // WebSocket para receber mensagens e ack em tempo real
    function connectWebSocket() {
        if (!webchatId || !token) return;
        
        let pingInterval;
        let historyInterval;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;
        const RECONNECT_DELAY = 5000;
        const PING_INTERVAL = 30000;
        const HISTORY_INTERVAL = 60000;

        function connect() {
            const wabaId = 'f0e8e993-97ff-40b1-8111-8f75d77a9343';
            const websocketToken = '20757fb5-0187-475d-8c6d-2d0778bdd96f';
            ws = new WebSocket(`wss://api.maxzap.com.br/wss?from=${webchatId}&token=${token}`);
            
            ws.onopen = () => {
                process.env.LOGGER_INFO === 'true' && console.log('[WebChat] WebSocket conectado!');
                reconnectAttempts = 0;
                
                pingInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, PING_INTERVAL);

                historyInterval = setInterval(async () => {
                    if (ws.readyState === WebSocket.OPEN) {
                        await loadMessageHistory();
                    }
                }, HISTORY_INTERVAL);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'webhook' && data.payload && data.payload.message) {
                        const msg = data.payload.message;
                        appendMessage(
                            msg.body,
                            'channel-received',
                            formatTime(msg.createdAt),
                            msg.ack,
                            msg.id,
                            msg.mediaType,
                            msg.mediaUrl
                        );
                        if (msg.mediaType) {
                            loadMessageHistory();
                        }
                    }
                    if (data.type === 'ack_update' && data.payload) {
                        if (data.payload.mediaType) {
                            const msgDiv = document.getElementById('msg-' + data.payload.id);
                            if (msgDiv) {
                                msgDiv.remove();
                                appendMessage(
                                    data.payload.body,
                                    'channel-sent',
                                    formatTime(data.payload.createdAt),
                                    data.payload.ack,
                                    data.payload.id,
                                    data.payload.mediaType,
                                    data.payload.mediaUrl
                                );
                            }
                        } else {
                            updateMessageAck(data.payload.messageId, data.payload.ack);
                        }
                    }
                    if (data.type === 'pong') {
                        process.env.LOGGER_INFO === 'true' && console.log('[WebChat] Pong recebido');
                    }
                } catch (error) {
                    process.env.LOGGER_ERROR === 'true' && console.error('[WebChat] Erro ao processar mensagem WebSocket:', error);
                }
            };

            ws.onerror = (error) => {
                process.env.LOGGER_ERROR === 'true' && console.error('[WebChat] Erro na conexão WebSocket:', error);
            };

            ws.onclose = () => {
                process.env.LOGGER_INFO === 'true' && console.log('[WebChat] Conexão WebSocket fechada');
                clearInterval(pingInterval);
                clearInterval(historyInterval);
                
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    process.env.LOGGER_INFO === 'true' && console.log(`[WebChat] Tentando reconectar (tentativa ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
                    setTimeout(connect, RECONNECT_DELAY);
                } else {
                    process.env.LOGGER_ERROR === 'true' && console.error('[WebChat] Número máximo de tentativas de reconexão atingido');
                }
            };
        }

        connect();
    }

    // Função para limpar a sessão
    async function clearSession() {
        if (confirm('Tem certeza que deseja limpar a sessão e começar uma nova conversa?')) {
            messagesDiv.innerHTML = '';
            sessionStorage.removeItem('channelWebchatId');
            if (ws) {
                ws.close();
            }
            webchatId = null;
            token = null;
            chatLoaded = false;
            await showSessionId();
            await loadMessageHistory();
            connectWebSocket();
        }
    }

    chatClear.addEventListener('click', clearSession);
})();
