type MessageHandler = (data: unknown) => void;

export class WsClient {
  private socket: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();

  constructor(private url: string = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws") {}

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handlers.forEach((handler) => handler(data));
    };
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
