import {
  User,
  GuildMember,
  Channel,
  MessageReaction,
  APIInteractionGuildMember,
  ChatInputCommandInteraction,
  Message,
  MessageCreateOptions,
  MessageContextMenuCommandInteraction,
  ChannelType,
} from 'discord.js';

export type InteractionVariant =
  | ChatInputCommandInteraction
  | MessageContextMenuCommandInteraction
  | PseudoInteraction;

export interface PseudoInteractionReplyOptions extends MessageCreateOptions {
  ephemeral?: boolean;
}

export interface PseudoInteraction {
  isPseudoInteraction: true;
  user: User;
  member: APIInteractionGuildMember | GuildMember | null;
  channel: Channel | null;
  guildId: string | null;
  channelId: string;
  deferReply(
    ...options: Parameters<ChatInputCommandInteraction['deferReply']>
  ): Promise<void>;
  editReply(options: PseudoInteractionReplyOptions): Promise<Message>;
  reply(options: PseudoInteractionReplyOptions): Promise<Message>;
}

/**
 * Returns a pseudo interaction from a MessageReaction and a User.
 * @param reaction The reaction that was added.
 * @param user The user that added the reaction.
 */
export function interactionFromReaction(
  reaction: MessageReaction,
  user: User,
): PseudoInteraction {
  return {
    isPseudoInteraction: true,
    user,
    member: reaction.message.guild?.members.cache.get(user.id) ?? null,
    channel: reaction.message.channel,
    guildId: reaction.message.guild?.id ?? null,
    channelId: reaction.message.channel.id,
    deferReply: async () => {}, // do nothing for defers as they are not needed
    // don't edit just send a new message
    async editReply(options) {
      return this.reply(options);
    },
    async reply(options) {
      if (reaction.message.channel.type === ChannelType.GroupDM) {
        throw new Error('Cannot reply to a message in a Group DM.');
      }

      return reaction.message.channel.send({
        ...options,
        reply:
          options.reply === null
            ? undefined
            : {
                messageReference: reaction.message.id,
                ...(options.reply ?? {}),
              },
      });
    },
  };
}
