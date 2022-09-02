import { fetch as undiciFetch, Response as UndiciResponse } from 'undici';
import { parseHeader } from './utils/utils';

export const hasNativeFetch =
	// @ts-expect-error Checking if we are in Deno and using global fetch instead of undici fetch
	typeof globalThis.fetch !== 'undefined' && (typeof process === 'undefined' || 'deno' in process);

// @ts-expect-error Checking if we are in Deno
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-assignment -- Its necessary.
export const fetch: typeof undiciFetch = hasNativeFetch ? globalThis.fetch ?? undiciFetch : undiciFetch;

export type Response = UndiciResponse;

/**
 * Converts the response to usable data
 *
 * @param res - The fetch response
 */
export function parseResponse(res: Response): Promise<unknown> {
	const header = parseHeader(res.headers.get('content-type'));
	if (header?.startsWith('application/json')) {
		return res.json();
	}

	return res.arrayBuffer();
}
