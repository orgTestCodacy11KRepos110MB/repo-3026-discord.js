'use strict';

let erlpack;
const { Buffer } = require('node:buffer');
const process = require('node:process');

try {
  erlpack = require('erlpack');
  if (!erlpack.pack) erlpack = null;
} catch {} // eslint-disable-line no-empty

const hasNativeWebSocket =
  typeof globalThis.WebSocket !== 'undefined' && (typeof process === 'undefined' || 'deno' in process.versions);

exports.WebSocket = hasNativeWebSocket ? globalThis.WebSocket ?? require('ws') : require('ws');

const ab = new TextDecoder();

exports.encoding = erlpack ? 'etf' : 'json';

exports.pack = erlpack ? erlpack.pack : JSON.stringify;

exports.unpack = (data, type) => {
  if (exports.encoding === 'json' || type === 'json') {
    if (typeof data !== 'string') {
      data = ab.decode(data);
    }
    return JSON.parse(data);
  }
  if (!Buffer.isBuffer(data)) data = Buffer.from(new Uint8Array(data));
  return erlpack.unpack(data);
};

exports.create = (gateway, query = {}, ...args) => {
  const [g, q] = gateway.split('?');
  query.encoding = exports.encoding;
  query = new URLSearchParams(query);
  if (q) new URLSearchParams(q).forEach((v, k) => query.set(k, v));
  const ws = new exports.WebSocket(`${g}?${query}`, ...(hasNativeWebSocket ? [] : args));
  return ws;
};

for (const state of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) exports[state] = exports.WebSocket[state];
