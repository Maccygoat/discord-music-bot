import { Locale } from 'discord.js';

/**
 * Lagar ein funksjon som hentar ei melding eller meldingsfunksjon frå ei mappe
 * med den gjeve nykelen.
 * @param messages Ei mappe med meldingar.
 * @param defaultLocale Standardlokalen.
 */
export function createi18n<
  T extends Record<
    string,
    Record<string, string | ((...args: any[]) => string)>
  >,
  L extends Locale & keyof T,
>(
  messages: T,
  defaultLocale: L,
): <K extends keyof T[L]>(locale: Locale, key: K) => T[L][K] {
  return <K extends keyof T[L]>(locale: Locale, key: K): T[L][K] =>
    (messages[locale]?.[key as string] ??
      messages[defaultLocale][key as keyof T[L]]) as T[L][K];
}
