import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizationProvider {
  /**
   * Sanitizes a string to prevent markdown from being rendered.
   * @param value The value to sanitize.
   */
  sanitize(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\~');
  }

  /**
   * Sanitizes a string to limit it to only numbers.
   * @param value The value to sanitize.
   */
  sanitizeNumber(value: string): string {
    return value.replace(/[^0-9]/g, '');
  }

  /**
   * Keeps only the first `n` characters of a string. If the string is longer
   * than `n` characters, an ellipsis is appended.
   * @param value The value to truncate.
   * @param n The number of characters to keep.
   */
  truncate(value: string, n: number): string {
    return value.length > n ? `${value.slice(0, n)}…` : value;
  }
}
