import { Injectable, Logger } from '@nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

/**
 * A command for reporting the bot's ping.
 */
@Injectable()
@Command({
  name: 'ping',
  description: 'Get the bot\'s ping',
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
})
export class PingCommand {
  #logger = new Logger(PingCommand.name);

  /**
   * Handles the command.
   * @param interaction The interaction event.
   */
  @Handler()
  async handle(
    @InteractionEvent() interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const ping = Date.now() - interaction.createdTimestamp;
    const heartbeat = interaction.client.ws.ping;

    await interaction.reply({
      content: `Pong! 🏓\nRoundtrip latency: \`${ping}ms\`\nWebSocket heartbeat: \`${heartbeat}ms\``,
      ephemeral: true,
    });
  }
}
