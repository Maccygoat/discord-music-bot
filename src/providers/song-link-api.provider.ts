import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

export enum SongLinkApiPlatform {
  AmazonMusic = 'amazonMusic',
  AmazonStore = 'amazonStore',
  Anghami = 'anghami',
  Audiomack = 'audiomack',
  Audius = 'audius',
  Boomplay = 'boomplay',
  Deezer = 'deezer',
  AppleMusic = 'appleMusic',
  Itunes = 'itunes',
  Napster = 'napster',
  Pandora = 'pandora',
  Soundcloud = 'soundcloud',
  Spotify = 'spotify',
  Tidal = 'tidal',
  Yandex = 'yandex',
  Youtube = 'youtube',
  YoutubeMusic = 'youtubeMusic',
}

export const SongLinkApiPlatformDisplayNames: Record<
  SongLinkApiPlatform,
  string
> = {
  [SongLinkApiPlatform.AmazonMusic]: 'Amazon Music',
  [SongLinkApiPlatform.AmazonStore]: 'Amazon Store',
  [SongLinkApiPlatform.Anghami]: 'Anghami',
  [SongLinkApiPlatform.Audiomack]: 'Audiomack',
  [SongLinkApiPlatform.Audius]: 'Audius',
  [SongLinkApiPlatform.Boomplay]: 'Boomplay',
  [SongLinkApiPlatform.Deezer]: 'Deezer',
  [SongLinkApiPlatform.AppleMusic]: 'Apple Music',
  [SongLinkApiPlatform.Itunes]: 'iTunes',
  [SongLinkApiPlatform.Napster]: 'Napster',
  [SongLinkApiPlatform.Pandora]: 'Pandora',
  [SongLinkApiPlatform.Soundcloud]: 'SoundCloud',
  [SongLinkApiPlatform.Spotify]: 'Spotify',
  [SongLinkApiPlatform.Tidal]: 'Tidal',
  [SongLinkApiPlatform.Yandex]: 'Yandex',
  [SongLinkApiPlatform.Youtube]: 'YouTube',
  [SongLinkApiPlatform.YoutubeMusic]: 'YouTube Music',
};

export interface SongLinkApiResponse {
  entityUniqueId: string;
  userCountry: string;
  pageUrl: string;
  entitiesByUniqueId: { [key: string]: Song };
  linksByPlatform: Partial<Record<SongLinkApiPlatform, PlatformLink>>;
}

export interface Song {
  id: string;
  type: string;
  title: string;
  artistName: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  apiProvider: string;
  platforms: SongLinkApiPlatform[];
}

export interface PlatformLink {
  country: string;
  url: string;
  entityUniqueId: string;
  nativeAppUriMobile?: string;
  nativeAppUriDesktop?: string;
}

@Injectable()
export class SongLinkApiProvider {
  #logger = new Logger(SongLinkApiProvider.name);

  /**
   * Gets the different distribution platforms for a song, given a song link
   * from a music streaming service.
   */
  async getPlatforms(link: string): Promise<SongLinkApiResponse | null> {
    const apiBaseUrl = 'https://api.song.link/v1-alpha.1/links?url=';

    try {
      const response = await fetch(apiBaseUrl + encodeURIComponent(link));
      const data = await response.json();

      if ('statusCode' in data) {
        this.#logger.error(
          `Failed to get song link data: ${data.statusCode} - ${data.code}`,
        );
        return null;
      }

      return data as SongLinkApiResponse;
    } catch (error) {
      this.#logger.error('Failed to get song link data:', error);
      return null;
    }
  }
}
