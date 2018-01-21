const console   = require('console');
const fs        = require('fs');
const request   = require('request');
const papaparse = require('papaparse');
const iconv     = require('iconv-lite');

const menus = {};
const dir   = './menues';

createFolder();

function createFolder() {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}

function getMenuOfThisWeek(callback = null) {
	const currentWeek = getCurrentWeek();
	if (menus.hasOwnProperty(`${currentWeek}`)) {
		if (callback != null) {
			callback(menus[`${currentWeek}`]);
		}
	} else {
		downloadCSV(currentWeek, (pathToCSV) => {
			fs.readFile(pathToCSV, 'utf8', (err, data) => {
				menus[`${currentWeek}`] = papaparse.parse(data, {header: true}).data;
				if (callback != null) {
					callback(menus[`${currentWeek}`]);
				}
			});
		});
	}
}

function getMenuOfDay(day, callback) {
	console.log("Day: ", day);
	getMenuOfThisWeek((menuOfWeek) => {
		const menuOfDay = menuOfWeek.filter((el) => {
			return el.hasOwnProperty('tag') && (el.tag.toLowerCase() == day.toLowerCase());
		}).map((el) => {
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
	getMenuOfThisWeek((menuOfWeek) => {
		const daysOfMeal = menuOfWeek.filter((el) => {
			return el.hasOwnProperty('name') && (el.name.toLowerCase().includes(needle));
		}).map((el) => {
			console.log("Specific meal: ", el);
			return {
				datum: el.datum,
				tag  : el.tag,
				name : el.name
			};
		});
		console.log("All days of specific meal: ", daysOfMeal);
		callback(daysOfMeal);
	});
}

function downloadCSV(week, callback) {
	const url       = getUrl(week);
	const pathToCSV = `${dir}/${week}.csv`;
	let writeStream = fs.createWriteStream(pathToCSV);
	writeStream.setDefaultEncoding('utf-8');
	writeStream.on('close', function () {
		console.log("File downloaded...");
		callback(pathToCSV);
	});
	request.get({
		uri     : url,
		encoding: 'binary'
	}).pipe(iconv.decodeStream('latin1'))
		.pipe(iconv.encodeStream('utf-8'))
		.pipe(writeStream);
}

function getUrl(week) {
	return `http://www.stwno.de/infomax/daten-extern/csv/UNI-R/${week}.csv`;
}

function getCurrentWeek() {
	const dayInMS    = 86400000;
	let date         = new Date();
	var firstJanuary = new Date(date.getFullYear(), 0, 1);
	return Math.floor(((date - firstJanuary) / dayInMS) / 7) + 1;
}

export {getMenuOfDay, findInMenu};