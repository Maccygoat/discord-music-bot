import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {
  SongLinkApiProvider,
  SongLinkApiPlatform,
} from './song-link-api.provider.js';

export interface SongLinks {
  originalPlatform: SongLinkApiPlatform;
  otherPlatformUrls: Partial<Record<SongLinkApiPlatform, string>>;
  thumbnailUrl: string;
  songTitle: string;
  songArtistName: string;
}

@Injectable()
export class SongLinkProvider {
  #logger = new Logger(SongLinkProvider.name);

  constructor(private readonly songLinks: SongLinkApiProvider) { }

  async getPlatforms(link: string): Promise<SongLinks | null> {
    const songLinkData = await this.songLinks.getPlatforms(link);

    if (!songLinkData) {
      return null;
    }

    const originalEntity = songLinkData.entitiesByUniqueId[songLinkData.entityUniqueId];

    if (!originalEntity) {
      return null;
    }

    const originalPlatform = originalEntity.platforms[0];

    const otherPlatformUrls = Object.entries(songLinkData.linksByPlatform).reduce(
      (acc, [platform, { url }]) => {
        if (platform === originalPlatform) {
          return acc;
        }

        acc[platform as SongLinkApiPlatform] = url;
        return acc;
      },
      {} as Partial<Record<SongLinkApiPlatform, string>>,
    );

    let thumbnailUrl = originalEntity.thumbnailUrl;

    if (originalPlatform !== SongLinkApiPlatform.Spotify) {
      const spotifyEntity = Object.values(songLinkData.entitiesByUniqueId).find(
        entity => entity.platforms.includes(SongLinkApiPlatform.Spotify)
      );
      if (spotifyEntity) {
        thumbnailUrl = spotifyEntity.thumbnailUrl;
      }
    }

    if (
      originalPlatform === SongLinkApiPlatform.Youtube &&
      Object.keys(otherPlatformUrls).length === 1 &&
      SongLinkApiPlatform.YoutubeMusic in otherPlatformUrls
    ) {
      return null;
    }

    const songTitle = originalEntity.title;
    const songArtistName = originalEntity.artistName;

    return { originalPlatform, otherPlatformUrls, thumbnailUrl, songTitle, songArtistName };
  }
}
