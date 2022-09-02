import type { ServerResponse } from 'node:http';
import { pipeline } from 'node:stream/promises';
import type { DiscordAPIError, HTTPError, RateLimitError } from '@discordjs/rest';
import type { Response } from 'undici';

/**
 * Populates a server response with the data from a Discord 2xx REST response
 *
 * @param res - The server response to populate
 * @param data - The data to populate the response with
 */
export async function populateSuccessfulResponse(res: ServerResponse, data: Response): Promise<void> {
	res.statusCode = data.status;

	for (const [header, value] of data.headers.entries()) {
		// Strip ratelimit headers
		if (header.toLowerCase().startsWith('x-ratelimit')) {
			continue;
		}

		res.setHeader(header, value);
	}

	await pipeline(data.body!, res);
}

/**
 * Populates a server response with the data from a Discord non-2xx REST response that is NOT a 429
 *
 * @param res - The server response to populate
 * @param error - The error to populate the response with
 */
export function populateGeneralErrorResponse(res: ServerResponse, error: DiscordAPIError | HTTPError): void {
	res.statusCode = error.status;

	if ('rawError' in error) {
		res.setHeader('Content-Type', 'application/json');
		res.write(JSON.stringify(error.rawError));
	}
}

/**
 * Populates a server response with the data from a Discord 429 REST response
 *
 * @param res - The server response to populate
 * @param error - The error to populate the response with
 */
export function populateRatelimitErrorResponse(res: ServerResponse, error: RateLimitError): void {
	res.statusCode = 429;
	res.setHeader('Retry-After', error.timeToReset / 1_000);
}

/**
 * Populates a server response with data relevant for a timeout
 *
 * @param res - The sever response to populate
 */
export function populateAbortErrorResponse(res: ServerResponse): void {
	res.statusCode = 504;
	res.statusMessage = 'Upstream timed out';
}
