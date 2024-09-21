import { Injectable, Logger } from '@nestjs/common';
import { InteractionDataProvider } from './interaction-data.provider.js';
import { InteractionVariant } from '../types/index.js';

export interface RateLimiterOptions {
  /**
   * The length of the sliding window in milliseconds. Defaults to 1 minute.
   */
  window?: number;

  /**
   * The maximum number of uses per window. Defaults to 3.
   */
  maxPerWindow?: number;

  /**
   * Whether to rate limit by user rather than by user, channel, and guild.
   * Defaults to false.
   */
  byUser?: boolean;
}

export type RateLimiterResponse = {
  /**
   * Whether the user is rate limited.
   */
  isRateLimited: boolean;

  /**
   * The time in milliseconds until the user can use the command again. This is
   * only set if the user is rate limited.
   */
  timeUntilNextUse?: number;

  /**
   * The number of uses the user has left in the current window. This is only
   * set if rate limiting applies to the user (i.e. they are not a moderator).
   */
  usesLeft?: number;
};

/**
 * Rate limits commands by keeping track of the last time a command was used by
 * a user in the same channel. Implements a sliding window algorithm.
 */
@Injectable()
export class RateLimiterProvider {
  #logger = new Logger(RateLimiterProvider.name);
  #numberFormat = new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: 'second',
    unitDisplay: 'long',
    maximumFractionDigits: 0,
  });

  #lastUsed = new Map<string, { windowStart: number; uses: number }>();

  constructor(
    private readonly interactionDataProvider: InteractionDataProvider,
  ) {}

  /**
   * Rate limits the given action. Returns information about the rate limiting
   * status.
   * @param key The key to use for rate limiting. This should be unique to the
   * command.
   * @param interaction The interaction to check rate limiting for.
   * @param options The rate limiting options.
   * @returns Information about the rate limiting status.
   */
  rateLimit(
    key: string,
    interaction: InteractionVariant,
    {
      window = 1 * 60 * 1000,
      maxPerWindow = 3,
      byUser,
    }: RateLimiterOptions = {},
  ): RateLimiterResponse {
    const interactionData =
      this.interactionDataProvider.getDataFor(interaction);

    if (interactionData.isModerator()) {
      return { isRateLimited: false };
    }

    const mapKey = byUser
      ? `${interaction.user.id}:${key}`
      : `${interaction.guildId}:${interaction.channelId}:${interaction.user.id}:${key}`;
    const now = Date.now();
    let entry = this.#lastUsed.get(mapKey);

    if (!entry) {
      entry = { windowStart: now, uses: 0 };
      this.#lastUsed.set(mapKey, entry);
    } else if (now - entry.windowStart > window) {
      entry.windowStart = now;
      entry.uses = 0;
    }

    if (entry.uses + 1 > maxPerWindow) {
      this.#logger.log(
        `Rate limited ${interaction.user.tag} in ${interactionData.getChannelName()} for ${key}`,
      );

      return {
        isRateLimited: true,
        timeUntilNextUse: entry.windowStart + window - now,
        usesLeft: 0,
      };
    }

    entry.uses++;

    return {
      isRateLimited: false,
      usesLeft: maxPerWindow - entry.uses,
    };
  }

  /**
   * Checks if the user is rate limited. If they are, responds with an ephemeral
   * message. If not, updates the last used time for the user and channel. Users
   * with the ability to kick members are not rate limited.
   * @param key The key to use for rate limiting. This should be unique to the
   * command.
   * @param interaction The interaction to check rate limiting for.
   * @param options The rate limiting options.
   * @returns Whether the user is rate limited.
   */
  isRateLimited(
    key: string,
    interaction: InteractionVariant,
    options?: RateLimiterOptions,
  ): boolean {
    const interactionData =
      this.interactionDataProvider.getDataFor(interaction);

    const { isRateLimited, timeUntilNextUse } = this.rateLimit(
      key,
      interaction,
      options,
    );

    if (!isRateLimited) {
      return false;
    }

    interaction
      .reply({
        content: `You are doing that too much. Please try again in ${this.#numberFormat.format(
          (timeUntilNextUse ?? 0) / 1000,
        )}.`,
        ephemeral: true,
      })
      .catch((error) => {
        this.#logger.warn(
          `Failed to send rate limit message to ${interaction.user.tag} in ${interactionData.getChannelName()}`,
          error,
        );
      });

    return true;
  }
}
