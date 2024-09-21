import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

export enum PosthogEvent {
  Interaction = 'interaction-created',
  SetPersonProperties = '$set',
}

export enum PosthogFeatureFlag {
  ShowTranslationDonationMessage = 'show-translation-donation-message',
  ShowTranslationUsesRemaining = 'show-translation-uses-remaining',
}

@Injectable()
export class PosthogProvider {
  readonly #client?: PostHog;
  readonly #logger = new Logger(PosthogProvider.name);

  constructor(private configService: ConfigService) {
    const posthogKey = this.configService.get<string>('POSTHOG_API_KEY');
    const posthogHost = this.configService.get<string>('POSTHOG_HOST');

    if (posthogKey) {
      this.#logger.log('Initializing PostHog client');
      this.#client = new PostHog(posthogKey, {
        host: posthogHost,
      });
    }
  }

  get client(): PostHog | undefined {
    return this.#client;
  }

  get isAvailable(): boolean {
    return Boolean(this.#client);
  }
}
