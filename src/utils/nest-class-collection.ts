import { INJECTABLE_WATERMARK } from '@nestjs/common/constants.js';

export type ClassExports<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends new (...args: any[]) => any ? K : never;
}[keyof T];

export type ClassExportsArray<T extends Record<string, any>> = Array<
  T[ClassExports<T>]
>;

/**
 * An iterable collection of Nest.js injectable classes.
 */
export class NestClassCollection<T extends (new (...args: any[]) => any)[]> {
  readonly #providers: T;

  constructor(providers: Iterable<T[number]>) {
    this.#providers = Array.from(providers) as T;
  }

  /**
   * Creates a collection from the export object of only the exported injectable
   * classes.
   *
   * @example
   * ```ts
   * import { Module } from '@nestjs/common';
   * import { NestClassCollection } from './utils';
   * import * as providers from './providers';
   *
   * @Module({
   *   providers: NestClassCollection.fromInjectables(providers).toArray(),
   * })
   * export class AppModule {}
   * ```
   */
  static fromInjectables<T extends Record<string, any>>(
    providers: T,
  ): NestClassCollection<ClassExportsArray<T>> {
    return new NestClassCollection(
      Object.values(providers).filter((provider) =>
        Reflect.getMetadata(INJECTABLE_WATERMARK, provider),
      ),
    );
  }

  /**
   * Returns an array of the providers in the collection.
   */
  toArray(): T {
    return this.#providers.slice() as T;
  }

  /**
   * Filters the given providers out.
   */
  except<E extends T>(
    ...providers: E
  ): NestClassCollection<Exclude<T[number], E[number]>[]> {
    return new NestClassCollection(
      this.#providers.filter(
        (provider) => !providers.includes(provider),
      ) as Exclude<T[number], E[number]>[],
    );
  }

  /**
   * Concatenates the given collection of providers to the current collection.
   */
  concat<C extends (new (...args: any[]) => any)[]>(
    collection: NestClassCollection<C> | C,
  ): NestClassCollection<[...T, ...C]> {
    return new NestClassCollection<[...T, ...C]>(
      this.#providers.concat(
        collection instanceof NestClassCollection
          ? collection.#providers
          : collection,
      ),
    );
  }

  /**
   * Iterates over the providers.
   */
  *[Symbol.iterator](): IterableIterator<T[number]> {
    for (const provider of this.#providers) {
      yield provider;
    }
  }
}
