import { CanActivate, ExecutionContext } from '@nestjs/common';
import { MessageReaction } from 'discord.js';

export class ReactionInServerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const message = context.getArgByIndex(0) as MessageReaction;

    return Boolean(message.message.guild);
  }
}
