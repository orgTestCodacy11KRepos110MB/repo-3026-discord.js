import { WebSocket as NPMWebSocket } from 'ws';

export const hasNativeWebSocket =
	// @ts-expect-error Checking if we are in Deno and using global WebSocket instead of npm ws
	typeof globalThis.WebSocket !== 'undefined' && (typeof process === 'undefined' || 'deno' in process);

// @ts-expect-error Checking if we are in Deno
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-assignment -- Its necessary.
export const WebSocket: typeof NPMWebSocket = hasNativeWebSocket ? globalThis.WebSocket ?? NPMWebSocket : NPMWebSocket;

export function createWebSocket(url: string, handshakeTimeout?: number | null) {
	const ws = new WebSocket(url, hasNativeWebSocket ? undefined : { handshakeTimeout: handshakeTimeout ?? undefined });
	ws.binaryType = 'arraybuffer';

	return ws;
}

export type WebSocketConnection = ReturnType<typeof createWebSocket>;
