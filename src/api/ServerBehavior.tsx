const SERVER_DOWN_STATUS_CODES = new Set([502, 503, 504]);
const SERVER_DOWN_COOLDOWN_MS = 10000;

export const SERVER_DOWN_MESSAGE = "Server is down.";

export class ServerDownError extends Error {
  constructor() {
    super(SERVER_DOWN_MESSAGE);
    this.name = "ServerDownError";
  }
}

export default class ServerBehavior {
  private serverDownUntil: number;
  private lastServerDownNotificationAt: number;
  private onServerDown?: () => void;

  constructor(onServerDown?: () => void) {
    this.serverDownUntil = 0;
    this.lastServerDownNotificationAt = 0;
    this.onServerDown = onServerDown;
  }

  private markServerDown() {
    const now = Date.now();
    this.serverDownUntil = now + SERVER_DOWN_COOLDOWN_MS;

    // Avoid spamming duplicate toasts when multiple requests fail at once.
    if (now - this.lastServerDownNotificationAt > 1000) {
      this.lastServerDownNotificationAt = now;
      this.onServerDown?.();
    }
  }

  private shouldShortCircuitForServerDown(): boolean {
    return Date.now() < this.serverDownUntil;
  }

  public setOnServerDown(onServerDown: () => void) {
    this.onServerDown = onServerDown;
  }

  public async serverApiFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    if (this.shouldShortCircuitForServerDown()) {
      this.markServerDown();
      throw new ServerDownError();
    }

    try {
      const response = await fetch(input, init);

      if (SERVER_DOWN_STATUS_CODES.has(response.status)) {
        this.markServerDown();
        throw new ServerDownError();
      }

      return response;
    } catch (err) {
      if (err instanceof ServerDownError) {
        throw err;
      }

      // Let explicit aborts bubble unchanged.
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }

      this.markServerDown();
      throw new ServerDownError();
    }
  }
}
