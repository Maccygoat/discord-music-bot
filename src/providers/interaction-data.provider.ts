import { Injectable } from '@nestjs/common';
import { PermissionFlagsBits } from 'discord.js';
import { InteractionVariant } from '../types/index.js';

export interface InteractionData {
  getChannelName: () => string;
  isModerator: () => boolean;
}

@Injectable()
export class InteractionDataProvider {
  /**
   * Gets interaction data.
   * @param interaction The interaction to get data for.
   * @returns The interaction data.
   */
  getDataFor(interaction: InteractionVariant): InteractionData {
    return {
      getChannelName: () =>
        interaction.channel && 'name' in interaction.channel
          ? `#${interaction.channel.name}`
          : 'DM',
      isModerator: () => {
        const { permissions } = interaction.member ?? {};

        if (
          permissions &&
          typeof permissions === 'object' &&
          'has' in permissions &&
          (permissions.has(PermissionFlagsBits.KickMembers) ||
            permissions.has(PermissionFlagsBits.BanMembers))
        ) {
          return true;
        }

        return false;
      },
    };
  }
}
