import {getMenuOfDay, findInMenu} from './server';

const Discord = require("discord.io");
const logger  = require("winston");
const auth    = require("./auth.json");

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});

logger.level = "debug";

const bot = new Discord.Client({
	token  : auth.token,
	autorun: true
});

bot.on('ready', function (evt) {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' - ' + bot.id)
});

bot.on('message', function (user, userID, channelID, message, evt) {
	if (message.substring(0, 1) == '!') {
		let args = message.substring(1).split(' ');
		let cmd  = args[0];

		args = args.splice(1);
		switch (cmd) {
			case 'schröder': {
				bot.sendMessage({
					to     : channelID,
					message: 'Ich erzähl ihnen jetzt mal was...'
				});
				break;
			}
			case 'karte': {
				let message = '';
				getMenuOfDay(args[0].substring(0, 2), (meals) => {
					for (let i = 0; i < meals.length; i++) {
						message += `${meals[i]}\n`;
					}
					bot.sendMessage({
						to     : channelID,
						message: message
					});
				});
				break;
			}
			case 'suche': {
				let message = '';
				findInMenu(args[0], (days) => {
					for (let i = 0; i < days.length; i++) {
						message += `${days[i].datum} (${days[i].tag}): ${days[i].name} \n`;
					}
					bot.sendMessage({
						to     : channelID,
						message: message
					});
				});
				break;
			}
			case 'hilfe': {
				let message = '!karte <tag>\n' +
					'\t\t\t<tag> = montag, dienstag, mittwoch, donnerstag, freitag (die ersten zwei Buchstaben reichen)\n' +
					'!suche <string>';
				bot.sendMessage({
					to     : channelID,
					message: message
				});
				break;
			}
		}
	}
});