/**
 * Creates a union of the given property decorators.
 * @param decorators The decorators to union.
 * @example
 * ```ts
 * class Example {
 *   @Union(PrimaryGeneratedColumn(), Column())
 *   id: number;
 * }
 *
 * // or, if making your own decorator
 *
 * function MyUnion() {
 *   return Union(PrimaryGeneratedColumn(), Column());
 * }
 * ```
 */
export function Union(...decorators: PropertyDecorator[]): PropertyDecorator {
  return (target, propertyKey) => {
    for (const decorator of decorators) {
      decorator(target, propertyKey);
    }
  };
}
