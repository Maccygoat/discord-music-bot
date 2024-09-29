# Music Bot

Music Bot is a Discord bot that looks out for song links (e.g. Spotify or YouTube) and then replies to the songlink message with various other sources, so that everyone can listen on their prefered platform. It also attaches the song thumbnail if available (mostly because native Spotify embeds often do not work).

The bot is written in [TypeScript](https://www.typescriptlang.org/) and uses the [Discord.js](https://discord.js.org) library. [discord-nestjs](https://github.com/fjodor-rybakov/discord-nestjs) is used to provide a modular, dependency-injected architecture as a [NestJS](https://nestjs.com/) application.

## Contributing

Make sure you have [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/) installed.

> [!TIP]
> It is recommended to use [Volta](https://volta.sh/) to manage Node.js versions. If Volta is installed, you do not need to do anything. When you run any commands in this repository, Volta will automatically install and install the correct versions of both Node.js and Yarn.

1. Clone the repository.
2. Run `yarn` to install dependencies.
3. Configure the environment variables by copying the `template.env` file to `.env` and filling in the values. See [Environment Variables](#environment-variables) for more information.
4. Run `yarn start:dev` to start the bot in development mode. The bot will now be running and you can make changes to the code. The bot should automatically restart when you save changes.

This bot was stolen and modified from https://github.com/nllcommunity/discord-norsk-bott. I am not a good programmer. I mostly deleted stuff what I didn't need and added like 5 lines of code. Feel free to improve upon it yourself.

```sh
git clone https://github.com/Maccygoat/discord-music-bot.git
cd discord-music-bot

yarn
cp template.env .env
# Fill in the values in the .env file

yarn start:dev
```

You start the final bot with:

```sh
yarn start:prod
```

## Environment Variables

The bot requires the following environment variables to be set.

### `DISCORD_TOKEN`

Required. The bot token from the [Discord Developer Portal](https://discord.com/developers/applications).

## Licence

[ISC](LICENCE)
