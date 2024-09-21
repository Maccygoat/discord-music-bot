import { On } from '@discord-nestjs/core';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Events, Message } from 'discord.js';
import {
  SongLinkProvider,
  SongLinkApiPlatformDisplayNames,
  SongLinkApiPlatform,
} from '../providers/index.js';
import {
  FetchedMessageGuard,
  MessageOnlyStandardChannelsGuard,
} from './guards/index.js';

const possibleSongLinkRegex =
  /(https?:\/\/(?:www\.)?((?:(music\.)?amazon|audiomack|play\.anghami|boomplay|deezer|geo\.music\.apple|play\.napster|pandora|soundcloud|listen\.tidal|((music|www)\.)?youtube|open\.spotify)\.com|youtu\.be|audius\.co|music\.yandex\.ru)\/[^\s)>]+)/;

@Injectable()
export class MusicLinkHandler {
  readonly #logger = new Logger(MusicLinkHandler.name);

  constructor(private readonly songLinks: SongLinkProvider) { }

  @On(Events.MessageCreate)
  @UseGuards(FetchedMessageGuard, MessageOnlyStandardChannelsGuard)
  async onMessageCreate(message: Message): Promise<void> {
    if (message.author.bot) {
      return;
    }

    const match = message.content.match(possibleSongLinkRegex);
    if (!match) {
      return;
    }

    const songLink = match[0];

    this.#logger.debug(`Found song link: ${songLink}`);

    const songLinkData = await this.songLinks.getPlatforms(songLink);

    if (!songLinkData) {
      this.#logger.debug('No song link data found');
      return;
    }

    const entries = (
      Object.entries(songLinkData.otherPlatformUrls) as [
        SongLinkApiPlatform,
        string,
      ][]
    ).sort(([a], [b]) =>
      SongLinkApiPlatformDisplayNames[a].localeCompare(
        SongLinkApiPlatformDisplayNames[b],
      ),
    );

    if (entries.length === 0) {
      this.#logger.debug('No other platforms found');
      return;
    }

    this.#logger.debug(
      `Found other platforms: ${entries.map(([p]) => p).join(', ')}`,
    );

    const otherPlatforms = entries
      .map(
        ([platform, url]) =>
          `[${SongLinkApiPlatformDisplayNames[platform]}](<${url}>)`,
      )
      .join(', ');

    const thumbnailUrl = songLinkData.thumbnailUrl;

    message.reply({
      content: `-# This song is also available on ${otherPlatforms}. [Thumbnail URL](${thumbnailUrl}) `,
      allowedMentions: { repliedUser: false },
    });
  }
}
