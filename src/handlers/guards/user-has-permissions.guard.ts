import { CanActivate, ExecutionContext } from '@nestjs/common';
import { MessageReaction, User, PermissionFlagsBits } from 'discord.js';

export class UserHasPermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const reaction = context.getArgByIndex(0) as MessageReaction;
    const user = context.getArgByIndex(1) as User;

    // Check if the user has the required permissions to send a message in the
    // channel the reaction was added in.

    const member = reaction.message.guild?.members.cache.get(user.id);

    if (!member) {
      return false;
    }

    const { permissions } = member;

    if (
      permissions &&
      typeof permissions === 'object' &&
      'has' in permissions &&
      permissions.has(PermissionFlagsBits.SendMessages)
    ) {
      return true;
    }

    return false;
  }
}
