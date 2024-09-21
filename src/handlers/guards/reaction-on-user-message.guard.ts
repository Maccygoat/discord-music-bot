import { CanActivate, ExecutionContext } from '@nestjs/common';
import { MessageReaction, User } from 'discord.js';

export class ReactionOnUserMessageGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const reaction = context.getArgByIndex(0) as MessageReaction;
    const user = context.getArgByIndex(1) as User;

    return Boolean(!reaction.message.author?.bot && !user.bot);
  }
}
