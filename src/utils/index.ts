import { PLAYER_URL } from '@/constants';
import _ from 'lodash';
import { Job } from './job';
import { AudioBase, VideoBase } from '@/interfaces/core';

/**
 * TS Interpretation of snake_case to camelCase conversion for better readability
 */
export type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

/**
 * Return type for function fromSnakeToCamel
 * - T = Type of the input object
 */
export type SnakeKeysToCamelCase<T> = {
  [K in keyof T as SnakeToCamelCase<K & string>]: T[K] extends Array<infer U>
    ? SnakeKeysToCamelCase<U>[]
    : T[K] extends object
      ? SnakeKeysToCamelCase<T[K]>
      : T[K];
};

/**
 * Converts the provided snake_case object into camelCase
 * @remarks
 * Performs an in-depth conversion. Be careful before passing
 * large objects with a lot of values.
 *
 * @param data - The object that needs to be converted
 * @returns The provided object with all the keys converted into camelCase
 *
 * TODO: Implement this safely at the HttpClient level to avoid rewrites throughout the codebase
 */
export const fromSnakeToCamel = <O extends object>(
  data: O
): SnakeKeysToCamelCase<O> => {
  const finalData = _(data)
    .mapKeys((__, k) => _.camelCase(k))
    .mapValues(v => {
      if (_.isArray(v)) {
        return v.map(item => fromSnakeToCamel(item));
      } else if (_.isObject(v)) {
        return fromSnakeToCamel(v);
      } else {
        return v;
      }
    })
    .value() as SnakeKeysToCamelCase<O>;
  return finalData;
};

export const fromCamelToSnake = <O extends object>(
  data: O
): SnakeKeysToCamelCase<O> => {
  const finalData = _(data)
    .mapKeys((__, k) => _.snakeCase(k))
    .mapValues(v => {
      if (_.isArray(v)) {
        return v.map(item => fromCamelToSnake(item));
      } else if (_.isObject(v)) {
        return fromCamelToSnake(v);
      } else {
        return v;
      }
    })
    .value() as SnakeKeysToCamelCase<O>;
  return finalData;
};

export const playStream = (url: string) => `${PLAYER_URL}?url=${url}`;

export const waitForJob = async (job: Job<any, any>): Promise<any> => {
  return new Promise((resolve, reject) => {
    job.on('success', async (data: any) => {
      resolve(data);
    });
    job.on('error', async (err: any) => {
      reject(err);
    });
    job
      .start()
      .then(() => {
        console.log('Job started');
      })
      .catch(err => {
        console.log('Job Failed');
        reject(err);
      });
  });
};

export const isMediaAudio = (
  media: AudioBase | VideoBase
): media is AudioBase => {
  return media.id.startsWith('a-');
};
