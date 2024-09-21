import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ChannelType, MessageReaction } from 'discord.js';

export class ReactionOnlyStandardChannelsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const reaction = context.getArgByIndex(0) as MessageReaction;

    return Boolean(
      [
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.GuildVoice,
        ChannelType.GuildText,
      ].includes(reaction.message.channel.type),
    );
  }
}
