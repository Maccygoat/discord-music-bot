import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { MessageReaction, PartialMessageReaction } from 'discord.js';

export class FetchedReactionGuard implements CanActivate {
  readonly #logger = new Logger(FetchedReactionGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reaction = context.getArgByIndex(0) as
      | MessageReaction
      | PartialMessageReaction;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        this.#logger.error('Failed to fetch reaction', error);

        return false;
      }
    }

    return true;
  }
}
