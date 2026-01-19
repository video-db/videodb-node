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
export type SnakeKeysToCamelCase<T> = T extends Array<infer U>
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
export type CamelKeysToSnakeCase<T> = T extends Array<infer U>
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
      _.isObject(item) && item !== null ? fromCamelToSnake(item) : item
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
  return _(data)
    .mapKeys((_v: unknown, k: string) => _.snakeCase(k))
    .mapValues(convertValueCamelToSnake)
    .value() as CamelKeysToSnakeCase<T>;
};

export const playStream = (url: string) => `${PLAYER_URL}?url=${url}`;

export const isMediaAudio = (
  media: AudioBase | VideoBase
): media is AudioBase => {
  return media.id.startsWith('a-');
};
