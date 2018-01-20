'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var console = require('console');
var fs = require('fs');
var request = require('request');
var papaparse = require('papaparse');

var menus = {};
var dir = './menues';

// getMenuOfDay('mo');

function getMenuOfThisWeek() {
	var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	var currentWeek = getCurrentWeek();
	if (menus.hasOwnProperty(currentWeek)) {
		if (callback != null) {
			callback(menus.currentWeek);
		}
	} else {
		downloadCSV(currentWeek, function (pathToCSV) {
			fs.readFile(pathToCSV, 'utf8', function (err, data) {
				menus.currentWeek = papaparse.parse(data, { header: true }).data;
				// console.log(menus.currentWeek);
				if (callback != null) {
					callback(menus.currentWeek);
				}
			});
		});
	}
}

function getMenuOfDay(day, callback) {
	console.log("Day: ", day);
	getMenuOfThisWeek(function (menuOfWeek) {
		var menuOfDay = menuOfWeek.filter(function (el) {
			return el.hasOwnProperty('tag') && el.tag.toLowerCase() == day.toLowerCase();
		}).map(function (el) {
			console.log("Meal of today: ", el);
			return el.name;
		});
		console.log("All meals of today: ", menuOfDay);
		callback(menuOfDay);
	});
}

function downloadCSV(week, callback) {
	var url = getUrl(week);
	var pathToCSV = dir + '/' + week + '.csv';
	var writeStream = fs.createWriteStream(pathToCSV);
	writeStream.on('close', function () {
		console.log("File downloaded...");
		callback(pathToCSV);
	});
	request.get(url).pipe(writeStream);
}

function getUrl(week) {
	return 'http://www.stwno.de/infomax/daten-extern/csv/UNI-R/' + week + '.csv';
}

function getCurrentWeek() {
	var date = new Date();
	var firstJanuary = new Date(date.getFullYear(), 0, 1);
	return Math.ceil(((date - firstJanuary) / 86400000 + firstJanuary.getDay() + 1) / 7);
}

exports.getMenuOfDay = getMenuOfDay;