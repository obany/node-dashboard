/* eslint-disable unicorn/prefer-add-event-listener */
import { IWebSocketMessage } from "../models/websocket/IWebSocketMessage";
import { WebSocketTopic } from "../models/websocket/webSocketTopic";
import { Converter } from "../utils/converter";
import { RandomHelper } from "../utils/randomHelper";

/**
 * Service to handle the websocket connection.
 */
export class WebSocketService {
    /**
     * Timer to retry failed connections.
     */
    private _reconnectTimer?: NodeJS.Timer;

    /**
     * The last time we received a message.
     */
    private _lastMessage: number;

    /**
     * The web socket connection.
     */
    private _webSocket?: WebSocket;

    /**
     * Subscribers to the messages.
     */
    private readonly _subscriptions: {
        [topic: number]: {
            subscriptionId: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: (data: any) => void;
        }[];
    };

    /**
     * Create a new instance of WebSocketService.
     */
    constructor() {
        this._subscriptions = {};
        this._lastMessage = 0;
    }

    /**
     * Subscribe to a topic.
     * @param topic The topic to subscribe to.
     * @param callback The callback to send the data to.
     * @returns The subscription id.
     */
    public subscribe<T>(topic: WebSocketTopic, callback: (data: T) => void): string {
        if (!this._subscriptions[topic]) {
            this._subscriptions[topic] = [];
        }

        const subscriptionId = Converter.bytesToHex(RandomHelper.generate(32));

        this._subscriptions[topic].push({
            subscriptionId,
            callback
        });

        if (this._webSocket && this._webSocket.readyState === WebSocket.OPEN) {
            // If we are already connected just subscribe to the topic.
            this.subscribeTopic(topic);
        } else if (!this._webSocket) {
            // Otherwise connect the socket which will in turn subscribe to
            // all the topics with callbacks.
            this.connectSocket();
        }

        return subscriptionId;
    }

    /**
     * Unsubscribe from a topic.
     * @param subscriptionId The subscription to unsubscribe.
     */
    public unsubscribe(subscriptionId: string): void {
        for (const topic of Object.keys(this._subscriptions).map(k => Number(k))) {
            const subscriptionIdx = this._subscriptions[topic].findIndex(s => s.subscriptionId === subscriptionId);
            if (subscriptionIdx >= 0) {
                this._subscriptions[topic].splice(subscriptionIdx, 1);

                if (this._subscriptions[topic].length === 0) {
                    // No more subscriptions for this topic so unsubscribe the topic.
                    delete this._subscriptions[topic];
                    this.unsubscribeTopic(topic);
                    break;
                }
            }
        }

        // No more subscriptions so disconnect the socket.
        if (Object.keys(this._subscriptions).length === 0) {
            this.clearTimer();
            this.disconnectSocket();
        }
    }

    /**
     * Connect the web socket.
     */
    private connectSocket(): void {
        this.clearTimer();
        this.disconnectSocket();

        let uri = "ws:";

        if (window.location.protocol === "https:") {
            uri = "wss:";
        }
        uri += `//${window.location.hostname}:${process.env.REACT_APP_SOCKET ?? window.location.port}/ws`;

        this._webSocket = new WebSocket(uri);

        this._webSocket.onopen = () => {
            // Socket has opened so subscribe for all the registered subscription topics
            for (const topic of Object.keys(this._subscriptions).map(k => Number(k))) {
                this.subscribeTopic(topic);
            }
        };

        this._webSocket.onclose = () => {
            this.disconnectSocket();
        };

        this._webSocket.onerror = err => {
            console.error("Socket error", err);
        };

        this._webSocket.onmessage = msg => {
            this._lastMessage = Date.now();
            this.handleMessage(msg.data);
        };

        this._lastMessage = Date.now();
        this._reconnectTimer = setInterval(() => this.reconnect(), 5000);
    }

    /**
     * Disconnect the web socket.
     */
    private disconnectSocket(): void {
        if (this._webSocket) {
            try {
                if (this._webSocket.readyState === WebSocket.OPEN) {
                    this._webSocket.close();
                }
            } catch { }
            this._webSocket = undefined;
        }
    }

    /**
     * Clear the timer.
     */
    private clearTimer(): void {
        if (this._reconnectTimer) {
            clearInterval(this._reconnectTimer);
            this._reconnectTimer = undefined;
        }
    }

    /**
     * Subscribe to a topic.
     * @param topicId The topic to subscribe to.
     */
    private subscribeTopic(topicId: number) {
        const arrayBuf = new ArrayBuffer(2);
        const view = new Uint8Array(arrayBuf);
        view[0] = 0; // register
        view[1] = topicId;

        if (this._webSocket) {
            this._webSocket.send(arrayBuf);
        }
    }

    /**
     * Unsubscribe from a topic.
     * @param topicId The topic to unsubscribe from.
     */
    private unsubscribeTopic(topicId: number) {
        const arrayBuf = new ArrayBuffer(2);
        const view = new Uint8Array(arrayBuf);
        view[0] = 1; // unregister
        view[1] = topicId;

        if (this._webSocket) {
            this._webSocket.send(arrayBuf);
        }
    }

    /**
     * Handle the messages.
     * @param msg The mesage data.
     */
    private handleMessage(msg: string): void {
        const message = JSON.parse(msg) as IWebSocketMessage;

        if (this._subscriptions[message.type]) {
            for (const subscriber of this._subscriptions[message.type]) {
                subscriber.callback(message.data);
            }
        }
    }

    /**
     * Reconnect if we have not received messages.
     */
    private reconnect(): void {
        // Only reconnect if we have subscriptions.
        if (Object.keys(this._subscriptions)) {
            const now = Date.now();
            if (now - this._lastMessage > 10000) {
                this.connectSocket();
            }
        }
    }
}
