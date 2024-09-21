import { Injectable } from '@nestjs/common';
import { type Guild, type Message } from 'discord.js';

/**
 * Provides a way to fetch messages by ID.
 */
@Injectable()
export class FetchMessageProvider {
  /**
   * Fetches a message by its ID.
   * @param guild The guild to fetch the message from.
   * @param messageId The ID of the message to fetch.
   */
  async fetchMessage(guild: Guild, messageId: string): Promise<Message | null> {
    const results = Promise.all(
      guild.channels.cache
        .filter((channel) => channel.isTextBased())
        .map((channel) =>
          (async () => {
            try {
              return 'messages' in channel
                ? await channel.messages.fetch(messageId)
                : null;
            } catch {
              return null;
            }
          })(),
        ),
    );

    const messages = await results;

    return messages.find((message) => message !== null) ?? null;
  }

  /**
   * Fetches a message by its URL.
   * @param guild The guild to fetch the message from.
   * @param url The URL of the message to fetch.
   */
  async fetchMessageByUrl(guild: Guild, url: string): Promise<Message | null> {
    const match = url.match(
      /https:\/\/discord.com\/channels\/\d+\/(?<channelId>\d+)\/(?<messageId>\d+)/,
    );

    if (!match) {
      return null;
    }

    const { channelId, messageId } = match.groups!;

    const channel = guild.channels.cache.get(channelId);

    if (!channel || !('messages' in channel)) {
      return null;
    }

    return (await channel.messages.fetch(messageId)) ?? null;
  }
}
