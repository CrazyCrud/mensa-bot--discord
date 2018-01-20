const console   = require('console');
const fs        = require('fs');
const request   = require('request');
const papaparse = require('papaparse');

const menus = {};
const dir   = './menues';

// getMenuOfDay('mo');

function getMenuOfThisWeek(callback = null) {
	const currentWeek = getCurrentWeek();
	if (menus.hasOwnProperty(currentWeek)) {
		if (callback != null) {
			callback(menus.currentWeek);
		}
	} else {
		downloadCSV(currentWeek, (pathToCSV) => {
			fs.readFile(pathToCSV, 'utf8', (err, data) => {
				menus.currentWeek = papaparse.parse(data, {header: true}).data;
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

function downloadCSV(week, callback) {
	const url       = getUrl(week);
	const pathToCSV = `${dir}/${week}.csv`;
	let writeStream = fs.createWriteStream(pathToCSV);
	writeStream.on('close', function () {
		console.log("File downloaded...");
		callback(pathToCSV);
	});
	request.get(url).pipe(writeStream);
}

function getUrl(week) {
	return `http://www.stwno.de/infomax/daten-extern/csv/UNI-R/${week}.csv`;
}

function getCurrentWeek() {
	let date         = new Date();
	var firstJanuary = new Date(date.getFullYear(), 0, 1);
	return Math.ceil((((date - firstJanuary) / 86400000) + firstJanuary.getDay() + 1) / 7);
}

export { getMenuOfDay };