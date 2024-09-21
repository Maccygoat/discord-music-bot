import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ChannelType, Message } from 'discord.js';

export class NewForumThreadGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const message = context.getArgByIndex(0) as Message;

    return Boolean(
      // Check that this is the first message of a thread in a forum channel
      (message.channel.type === ChannelType.PublicThread ||
        message.channel.type === ChannelType.PrivateThread) &&
        message.channel.parent?.type === ChannelType.GuildForum &&
        (await message.channel.fetchStarterMessage())?.id === message.id,
    );
  }
}
