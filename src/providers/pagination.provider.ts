import { Injectable, Logger } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  ComponentType,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { InteractionDataProvider } from './interaction-data.provider.js';

export interface PaginationOptions {
  /** The interaction to paginate for. */
  interaction: ChatInputCommandInteraction;

  /** The embeds to paginate. */
  embeds: EmbedBuilder[];

  /**
   * The time in milliseconds before the data is considered expired. In other
   * words, how long to keep the embeds in memory and interactable. Defaults to
   * 2 minutes.
   */
  timeout?: number;

  /** Any additional buttons to add to the pagination row. */
  additionalButtons?: ButtonBuilder[];
}

/**
 * Provides a way to paginate embeds.
 */
@Injectable()
export class PaginationProvider {
  #logger = new Logger(PaginationProvider.name);
  #cancellationFns = new Set<() => Promise<void>>();

  constructor(
    private readonly interactionDataProvider: InteractionDataProvider,
  ) {}

  /**
   * Paginates the given embeds. Does this by creating a pagination embed that
   * can be interacted with to change the current page.
   * @param options The options for pagination.
   * @returns The message with the pagination embed.
   */
  async paginate({
    interaction,
    embeds,
    timeout = 2 * 60 * 1000,
    additionalButtons = [],
  }: PaginationOptions) {
    if (!embeds.length) {
      throw new Error('Pages must be defined and contain at least one page.');
    }

    if (embeds.length === 1) {
      if (!additionalButtons.length) {
        return interaction.editReply({ embeds: [embeds[0]] });
      }

      return interaction.editReply({
        embeds: [embeds[0]],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            additionalButtons,
          ),
        ],
      });
    }

    const interactionData =
      this.interactionDataProvider.getDataFor(interaction);

    // Initialize pagination controls
    const controls = [
      { id: 'prev', label: 'Forrige', style: ButtonStyle.Secondary },
      { id: 'next', label: 'Neste', style: ButtonStyle.Primary },
    ].map((control) =>
      new ButtonBuilder()
        .setCustomId(control.id)
        .setLabel(control.label)
        .setStyle(control.style),
    );

    let currentPageIndex = 0;

    // Create a row of buttons for pagination
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(controls);

    // Add any additional buttons
    if (additionalButtons.length) {
      row.addComponents(additionalButtons);
    }

    // Send the initial page
    const curPage = await interaction.editReply({
      embeds: [
        embeds[currentPageIndex].setFooter({
          text: `Resultat ${currentPageIndex + 1} / ${embeds.length}`,
        }),
      ],
      components: [row],
    });

    const collector = curPage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: timeout,
    });

    const handleError = (error: unknown) => {
      this.#logger.error(
        `Failed to paginate for ${interaction.user.tag} in ${interactionData.getChannelName()}`,
        error,
      );
    };

    const cancel = async () => {
      this.#cancellationFns.delete(cancel);

      // remove buttons and add a message to the embed letting the user know that
      // they'll have to send the command again to see other pages of results
      await interaction
        .editReply({
          components: [],
          embeds: [
            embeds[currentPageIndex].setFooter({
              text: `Resultat ${currentPageIndex + 1} / ${embeds.length}
Denne meldinga er no utdatert. Send kommandoen på nytt for å sjå andre resultat.`,
            }),
          ],
        })
        .catch(handleError);
    };

    this.#cancellationFns.add(cancel);

    collector.on('collect', (collectorInteraction) => {
      if (
        collectorInteraction.customId !== 'prev' &&
        collectorInteraction.customId !== 'next'
      ) {
        return;
      }

      // Update page index based on which button was clicked
      currentPageIndex =
        collectorInteraction.customId === 'prev'
          ? currentPageIndex > 0
            ? currentPageIndex - 1
            : embeds.length - 1
          : (currentPageIndex + 1) % embeds.length;

      // Update the message with the new page
      collectorInteraction
        .update({
          embeds: [
            embeds[currentPageIndex].setFooter({
              text: `Resultat ${currentPageIndex + 1} / ${embeds.length}`,
            }),
          ],
          components: [row],
        })
        .catch(handleError);
    });

    collector.on('end', cancel);

    return curPage;
  }

  /**
   * Cancels all active pagination collectors when the application is shutting
   * down.
   */
  async onModuleDestroy() {
    this.#logger.log('Cancelling all active pagination collectors');

    for (const cancel of this.#cancellationFns) {
      await cancel();
    }

    this.#logger.log('All active pagination collectors cancelled');
  }
}
