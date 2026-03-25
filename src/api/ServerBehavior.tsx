import type React from "react";

const SERVER_DOWN_STATUS_CODES = new Set([502, 503, 504]);
const SERVER_DOWN_COOLDOWN_MS = 10000;
const PROXY_DOWN_ERROR_PATTERNS = [
  /ECONNREFUSED/i,
  /proxy error/i,
  /upstream connect error/i,
  /fetch failed/i,
];

export const SERVER_DOWN_MESSAGE = "Server is down.";

export class ServerDownError extends Error {
  constructor() {
    super(SERVER_DOWN_MESSAGE);
    this.name = "ServerDownError";
  }
}

export default class ServerBehavior {
  private serverDownUntil: number;
  private setIsServerDown: React.Dispatch<React.SetStateAction<boolean>>;

  constructor(setIsServerDown: React.Dispatch<React.SetStateAction<boolean>>) {
    this.serverDownUntil = 0;
    this.setIsServerDown = setIsServerDown;
  }

  private markServerDown() {
    const now = Date.now();
    this.serverDownUntil = now + SERVER_DOWN_COOLDOWN_MS;

    // Always mark the state as down immediately.
    this.setIsServerDown(true);
  }

  private shouldShortCircuitForServerDown(): boolean {
    return Date.now() < this.serverDownUntil;
  }

  private isHealthEndpoint(input: RequestInfo | URL): boolean {
    if (typeof input === "string") {
      return input.includes("/api/health");
    }

    if (input instanceof URL) {
      return input.pathname.startsWith("/api/health");
    }

    return input.url.includes("/api/health");
  }

  private async isServerDownResponse(
    response: Response,
    input: RequestInfo | URL,
  ): Promise<boolean> {
    if (SERVER_DOWN_STATUS_CODES.has(response.status)) {
      return true;
    }

    if (response.status !== 500) {
      return false;
    }

    if (this.isHealthEndpoint(input)) {
      return true;
    }

    try {
      const responseText = await response.clone().text();
      if (
        PROXY_DOWN_ERROR_PATTERNS.some((pattern) => pattern.test(responseText))
      ) {
        return true;
      }
    } catch {
      // Ignore body read issues and continue with active probe.
    }

    try {
      const health = await fetch("/api/health", {
        method: "GET",
        cache: "no-store",
      });
      return !health.ok;
    } catch {
      return true;
    }
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

      if (await this.isServerDownResponse(response, input)) {
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
