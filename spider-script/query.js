const Mongoose = require('mongoose');

const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

const dbConfig = require('./config.js').db;

const env = argv.env || 'production';

const city = argv.city || '';

const limit = argv.limit || 10;

global.DB = Mongoose.connect('mongodb://' + dbConfig[env].host + ':' + dbConfig[env].port + '/' + dbConfig[env].database, {
	user: dbConfig[env].username,
	pass: dbConfig[env].password
});

const dbHandler = require('./db.js');
const lagou = dbHandler('lagou');

let salartSort = {};

let sortOrder = -1;
let sortFileld = 'min';

salartSort[`salary-${sortFileld}`] = sortOrder;

let queryCity = city === '' ? {} : { city: city };

lagou.find(queryCity, null, {
	skip: 0,
	sort: salartSort,
	limit: limit
}, function(err, docs) {
	if (err) {
		console.log(err);
	}
	docs.forEach((item) => {
		console.log(`公司名：${item.companyFullName}\n地址：www.lagou.com/jobs/${item.positionId}.html\n${sortFileld === 'min' ? '最低' : '最高'}薪水：${sortFileld === 'min' ? item['salary-min'] : item['salary-max']}k\n`);
	});
	Mongoose.connection.close();
	process.exit(1);
});

// const fs = require('fs');

// lagou.find({
// 	city: city
// }, function(err, docs) {
// 	let result = [];
// 	let current = {};
// 	docs.forEach((item) => {
// 		if (current[item['salary-min']]) {
// 			current[item['salary-min']]++;
// 		} else {
// 			current[item['salary-min']] = 1;
// 		}
// 	});
// 	console.log(current);
// 	Object.keys(current).forEach((item) => {
// 		let a = [];
// 		a.push(parseInt(item));
// 		a.push(current[item]);
// 		result.push(a);
// 	});
// 	fs.writeFileSync('./result.json', JSON.stringify(result));
// 	// console.log(result);
// 	Mongoose.connection.close();
// 	process.exit(1);
// });
