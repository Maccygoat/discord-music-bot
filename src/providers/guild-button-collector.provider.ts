import { Injectable, Logger } from '@nestjs/common';
import {
  ComponentType,
  InteractionCollector,
  ButtonInteraction,
  Client,
  TextBasedChannel,
  Events,
  ChannelType,
  ThreadChannel,
  PartialGroupDMChannel,
} from 'discord.js';
import { InjectDiscordClient } from '@discord-nestjs/core';

/**
 * Provides a way to collect button interactions from all channels and threads
 * in guilds that the bot is in.
 */
@Injectable()
export class GuildButtonCollectorProvider {
  #logger = new Logger(GuildButtonCollectorProvider.name);

  constructor(@InjectDiscordClient() private readonly client: Client) {
    // Add collectors to all channels that the bot is in when the bot is ready
    this.client.once(Events.ClientReady, () => {
      this.client.guilds.cache.forEach((guild) => {
        guild.channels.cache.forEach((channel) => {
          if (channel.isTextBased()) {
            this.#addCollector(channel);
          } else if (channel.type === ChannelType.GuildForum) {
            channel.threads.cache.forEach((thread) => {
              this.#addCollector(thread);
            });
          }
        });
      });
    });

    // Add collectors to new channels as they are created
    this.client.on(Events.ChannelCreate, (channel) => {
      if (channel.isTextBased()) {
        this.#addCollector(channel);
      }
    });

    // Add collectors to new threads as they are created
    this.client.on(Events.ThreadCreate, (thread) => {
      this.#addCollector(thread);
    });

    // Remove collectors from channels as they are deleted
    this.client.on(Events.ChannelDelete, (channel) => {
      if (channel.isTextBased()) {
        this.#collectors.get(channel.id)?.stop();
        this.#collectors.delete(channel.id);
      } else if (channel.type === ChannelType.GuildForum) {
        channel.threads.cache.forEach((thread) => {
          this.#collectors.get(thread.id)?.stop();
          this.#collectors.delete(thread.id);
        });
      }
    });

    // Remove collectors from threads as they are deleted
    this.client.on(Events.ThreadDelete, (thread) => {
      this.#collectors.get(thread.id)?.stop();
      this.#collectors.delete(thread.id);
    });
  }

  /** Collectors keyed by channel ID. */
  #collectors = new Map<string, InteractionCollector<ButtonInteraction>>();

  /** Handlers attached to collectors, keyed by button custom ID. */
  #handlers = new Map<string, (interaction: ButtonInteraction) => unknown>();

  /**
   * Adds a collector to the given channel.
   * @param channel The channel to add the collector to.
   */
  #addCollector(
    channel: Exclude<TextBasedChannel, PartialGroupDMChannel> | ThreadChannel,
  ): void {
    const collector = channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    collector.on('collect', async (collectorInteraction) => {
      const handler = this.#handlers.get(collectorInteraction.customId);

      if (handler) {
        await handler(collectorInteraction);
      }
    });

    this.#collectors.set(channel.id, collector);
  }

  /**
   * Adds a handler for a custom button interaction.
   * @param customId The custom ID of the button.
   * @param handler The handler to call when the button is clicked.
   */
  addHandler(
    customId: string,
    handler: (interaction: ButtonInteraction) => unknown,
  ): void {
    this.#handlers.set(customId, handler);
  }

  /**
   * Runs when the application is shutting down. Removes all collectors.
   */
  onApplicationShutdown(): void {
    this.#collectors.forEach((collector) => collector.stop());
  }
}
