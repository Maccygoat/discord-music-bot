import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ChannelType, Message } from 'discord.js';

export class MessageOnlyStandardChannelsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const reaction = context.getArgByIndex(0) as Message;

    return Boolean(
      [
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.GuildVoice,
        ChannelType.GuildText,
      ].includes(reaction.channel.type),
    );
  }
}
