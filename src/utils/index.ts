import { PLAYER_URL } from '@/constants';
import _ from 'lodash';
import { AudioBase, VideoBase } from '@/interfaces/core';

/**
 * Type-level conversion of snake_case string to camelCase
 */
export type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

/**
 * Type-level conversion of camelCase string to snake_case
 */
export type CamelToSnakeCase<S extends string> =
  S extends `${infer T}${infer U}`
    ? T extends Uppercase<T>
      ? `_${Lowercase<T>}${CamelToSnakeCase<U>}`
      : `${T}${CamelToSnakeCase<U>}`
    : S;

/**
 * Recursively converts all keys in an object type from snake_case to camelCase
 */
export type SnakeKeysToCamelCase<T> =
  T extends Array<infer U>
    ? U extends object
      ? SnakeKeysToCamelCase<U>[]
      : U[]
    : T extends object
      ? {
          [K in keyof T as SnakeToCamelCase<K & string>]: SnakeKeysToCamelCase<
            T[K]
          >;
        }
      : T;

/**
 * Recursively converts all keys in an object type from camelCase to snake_case
 */
export type CamelKeysToSnakeCase<T> =
  T extends Array<infer U>
    ? U extends object
      ? CamelKeysToSnakeCase<U>[]
      : U[]
    : T extends object
      ? {
          [K in keyof T as CamelToSnakeCase<K & string>]: CamelKeysToSnakeCase<
            T[K]
          >;
        }
      : T;

/**
 * Recursively converts a value from snake_case to camelCase
 */
const convertValueSnakeToCamel = (v: unknown): unknown => {
  if (_.isArray(v)) {
    return v.map((item: unknown) =>
      _.isObject(item) && item !== null ? fromSnakeToCamel(item) : item
    );
  }
  if (_.isObject(v) && v !== null) {
    return fromSnakeToCamel(v);
  }
  return v;
};

/**
 * Recursively converts object keys from snake_case to camelCase
 */
export const fromSnakeToCamel = <T extends object>(
  data: T
): SnakeKeysToCamelCase<T> => {
  return _(data)
    .mapKeys((_v: unknown, k: string) => _.camelCase(k))
    .mapValues(convertValueSnakeToCamel)
    .value() as SnakeKeysToCamelCase<T>;
};

/**
 * Recursively converts a value from camelCase to snake_case
 */
const convertValueCamelToSnake = (v: unknown): unknown => {
  if (_.isArray(v)) {
    return v.map((item: unknown) =>
      _.isObject(item) && item !== null && !_.isArray(item)
        ? fromCamelToSnake(item)
        : _.isArray(item)
          ? convertValueCamelToSnake(item)
          : item
    );
  }
  if (_.isObject(v) && v !== null) {
    return fromCamelToSnake(v);
  }
  return v;
};

/**
 * Recursively converts object keys from camelCase to snake_case
 */
export const fromCamelToSnake = <T extends object>(
  data: T
): CamelKeysToSnakeCase<T> => {
  if (_.isArray(data)) {
    return data.map((item: unknown) =>
      _.isObject(item) && item !== null && !_.isArray(item)
        ? fromCamelToSnake(item)
        : item
    ) as CamelKeysToSnakeCase<T>;
  }

  return _(data)
    .mapKeys((_v: unknown, k: string) => _.snakeCase(k))
    .mapValues(convertValueCamelToSnake)
    .value() as CamelKeysToSnakeCase<T>;
};

export const playStream = (url: string) => `${PLAYER_URL}?url=${url}`;

/**
 * Sleep for the given number of milliseconds. Used by the client-side
 * poll loops (`waitUntilComplete`, `GenerationJob.wait`, `Sandbox.waitForReady`).
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Convert a `/watch` player URL into an `/embed` URL.
 * Mirrors `videodb._utils._video.player_url_to_embed_url`.
 *
 * @param playerUrl - e.g. `https://player.videodb.io/watch?v=slug`
 * @returns e.g. `https://player.videodb.io/embed?v=slug`
 * @throws {Error} If the URL is empty, missing `/watch?`, or missing the `v` param.
 */
export const playerUrlToEmbedUrl = (playerUrl: string): string => {
  if (!playerUrl) {
    throw new Error('player_url is required to generate embed URL');
  }
  if (!playerUrl.includes('/watch?')) {
    throw new Error("player_url must contain '/watch?' path");
  }
  if (!playerUrl.split('/watch?')[1].includes('v=')) {
    throw new Error("player_url must contain a 'v' query parameter");
  }
  return playerUrl.replace('/watch?', '/embed?');
};

/**
 * Build an iframe embed HTML string from a player URL.
 * Mirrors `videodb._utils._video.build_iframe_embed_code`.
 *
 * @param playerUrl - The player URL to embed
 * @param width - Width of the iframe (default `"100%"`)
 * @param height - Height of the iframe in pixels (default `405`)
 * @param title - Title attribute for the iframe (default `"VideoDB Player"`)
 * @param allowFullscreen - Whether to allow fullscreen (default `true`)
 * @throws {Error} If `playerUrl` is empty or `height` is not positive.
 */
export const buildIframeEmbedCode = (
  playerUrl: string,
  width: string = '100%',
  height: number = 405,
  title: string = 'VideoDB Player',
  allowFullscreen: boolean = true
): string => {
  if (!playerUrl) {
    throw new Error('player_url is required to generate embed code');
  }
  if (height <= 0) {
    throw new Error('height must be a positive integer');
  }
  const embedUrl = playerUrlToEmbedUrl(playerUrl);
  const fullscreenAttr = allowFullscreen ? ' allowfullscreen' : '';
  return (
    `<iframe src="${embedUrl}" ` +
    `width="${width}" height="${height}" ` +
    `title="${title}" frameborder="0"${fullscreenAttr}></iframe>`
  );
};

export const isMediaAudio = (
  media: AudioBase | VideoBase
): media is AudioBase => {
  return media.id.startsWith('a-');
};
