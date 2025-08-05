// frontend/assets/js/websocket.js

class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectInterval = 5000;
        this.maxReconnectAttempts = 10;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.messageHandlers = new Map();
    }

    connect() {
        try {
            console.log('🔌 Tentative de connexion WebSocket...');
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('✅ WebSocket connecté !');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.onConnect();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 WebSocket message reçu:', data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Erreur parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket déconnecté');
                this.isConnected = false;
                this.onDisconnect();
                this.scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('❌ Erreur WebSocket:', error);
                this.isConnected = false;
            };

        } catch (error) {
            console.error('❌ Erreur connexion WebSocket:', error);
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnexion dans ${this.reconnectInterval/1000}s (tentative ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.log('❌ Nombre maximum de tentatives de reconnexion atteint');
        }
    }

    send(data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            console.log('📤 Message envoyé via WebSocket:', data);
        } else {
            console.warn('⚠️ WebSocket non connecté, impossible d\'envoyer le message');
        }
    }

    on(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type).push(handler);
    }

    handleMessage(data) {
        const handlers = this.messageHandlers.get(data.type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data.data);
                } catch (error) {
                    console.error(`❌ Erreur handler WebSocket pour ${data.type}:`, error);
                }
            });
        }
    }

    onConnect() {
        // Override dans main.js
    }

    onDisconnect() {
        // Override dans main.js
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
}

// Instance globale (sera initialisée dans main.js)
let wsClient = null;
