'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var console = require('console');
var fs = require('fs');
var request = require('request');
var papaparse = require('papaparse');
var iconv = require('iconv-lite');

var menus = {};
var dir = './menues';

createFolder();

function createFolder() {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}

function getMenuOfThisWeek() {
	var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	var currentWeek = getCurrentWeek();
	if (menus.hasOwnProperty('' + currentWeek)) {
		if (callback != null) {
			callback(menus['' + currentWeek]);
		}
	} else {
		downloadCSV(currentWeek, function (pathToCSV) {
			fs.readFile(pathToCSV, 'utf8', function (err, data) {
				menus['' + currentWeek] = papaparse.parse(data, { header: true }).data;
				if (callback != null) {
					callback(menus['' + currentWeek]);
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

function findInMenu(needle, callback) {
	console.log("Search for: ", needle);
	needle = needle.toLowerCase();
	getMenuOfThisWeek(function (menuOfWeek) {
		var daysOfMeal = menuOfWeek.filter(function (el) {
			return el.hasOwnProperty('name') && el.name.toLowerCase().includes(needle);
		}).map(function (el) {
			console.log("Specific meal: ", el);
			return {
				datum: el.datum,
				tag: el.tag,
				name: el.name
			};
		});
		console.log("All days of specific meal: ", daysOfMeal);
		callback(daysOfMeal);
	});
}

function downloadCSV(week, callback) {
	var url = getUrl(week);
	var pathToCSV = dir + '/' + week + '.csv';
	var writeStream = fs.createWriteStream(pathToCSV);
	writeStream.setDefaultEncoding('utf-8');
	writeStream.on('close', function () {
		console.log("File downloaded...");
		callback(pathToCSV);
	});
	request.get({
		uri: url,
		encoding: 'binary'
	}).pipe(iconv.decodeStream('latin1')).pipe(iconv.encodeStream('utf-8')).pipe(writeStream);
}

function getUrl(week) {
	return 'http://www.stwno.de/infomax/daten-extern/csv/UNI-R/' + week + '.csv';
}

function getCurrentWeek() {
	var dayInMS = 86400000;
	var date = new Date();
	var firstJanuary = new Date(date.getFullYear(), 0, 1);
	return Math.floor((date - firstJanuary) / dayInMS / 7) + 1;
}

exports.getMenuOfDay = getMenuOfDay;
exports.findInMenu = findInMenu;