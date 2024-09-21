import { Injectable, Logger } from '@nestjs/common';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

/**
 * A command for getting the user ID of the caller.
 */
@Injectable()
@Command({
  name: 'myuserid',
  description: 'Get your user ID',
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
})
export class MyUserIdCommand {
  #logger = new Logger(MyUserIdCommand.name);

  /**
   * Handles the command.
   * @param interaction The interaction event.
   * @param messageId The ID of the message to quote.
   */
  @Handler()
  async handle(
    @InteractionEvent() interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    await interaction.reply({
      content: `Your user ID is: \`${interaction.user.id}\``,
      ephemeral: true,
    });
  }
}
