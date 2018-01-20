"use strict";

var _server = require("./server");

var Discord = require("discord.io");
var logger = require("winston");
var auth = require("./auth.json");

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});

logger.level = "debug";

var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

bot.on('ready', function (evt) {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' - ' + bot.id);
});

bot.on('message', function (user, userID, channelID, message, evt) {
	if (message.substring(0, 1) == '!') {
		var args = message.substring(1).split(' ');
		var cmd = args[0];

		args = args.splice(1);
		switch (cmd) {
			case 'schroeder':
				{
					bot.sendMessage({
						to: channelID,
						message: 'Ich erzähl ihnen jetzt mal was...'
					});
					break;
				}
			case 'karte':
				{
					var _message = '';
					(0, _server.getMenuOfDay)(args[0].substring(0, 2), function (meals) {
						for (var i = 0; i < meals.length; i++) {
							_message += meals[i] + "\n";
						}
						bot.sendMessage({
							to: channelID,
							message: _message
						});
					});
					break;
				}
			case 'suche':
				{
					var _message2 = '';
					(0, _server.findInMenu)(args[0], function (days) {
						for (var i = 0; i < days.length; i++) {
							_message2 += days[i].datum + " (" + days[i].tag + "): " + days[i].name + " \n";
						}
						bot.sendMessage({
							to: channelID,
							message: _message2
						});
					});
					break;
				}
			case 'hilfe':
				{
					var _message3 = "\n\t\t\t\t\t\t!karte <tag>\n\t\t\t\t\t<tag> = montag, dienstag, mittwoch, donnerstag, freitag\n\t\t\t\t\t";
					bot.sendMessage({
						to: channelID,
						message: _message3
					});
					break;
				}
		}
	}
});