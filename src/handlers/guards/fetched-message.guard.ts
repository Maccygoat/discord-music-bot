import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Message, PartialMessage } from 'discord.js';

export class FetchedMessageGuard implements CanActivate {
  readonly #logger = new Logger(FetchedMessageGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const message = context.getArgByIndex(0) as Message | PartialMessage;

    if (message.partial) {
      try {
        await message.fetch();
      } catch (error) {
        this.#logger.error('Failed to fetch message', error);

        return false;
      }
    }

    return true;
  }
}
