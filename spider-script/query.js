const Mongoose = require('mongoose');

const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

const dbConfig = require('../database/config.js').db;

const env = argv.env || 'production';

const city = argv.city || '';

const limit = argv.limit || 10;

global.DB = Mongoose.connect('mongodb://' + dbConfig[env].host + ':' + dbConfig[env].port + '/' + dbConfig[env].database, {
	user: dbConfig[env].username,
	pass: dbConfig[env].password
});

const dbHandler = require('../database/handler.js');
const lagou = dbHandler('position');

let sortQuery = {};

let sortOrder = -1;
let sortFileld = 'min';

// sortQuery[`salary-${sortFileld}`] = sortOrder;
sortQuery['createTime'] = -1;

let queryCity = city === '' ? {} : { city: city };

lagou.find({
	positionLables: '前端',
	city: '南京'
}, null, {
	skip: 0,
	sort: sortQuery,
	limit: limit
}, function(err, docs) {
	if (err) {
		console.log(err);
	}
	docs.forEach((item) => {
		console.log(`公司名：${item.companyFullName}\n地址：www.lagou.com/jobs/${item.positionId}.html\n${sortFileld === 'min' ? '最低' : '最高'}薪水：${sortFileld === 'min' ? item['salary-min'] : item['salary-max']}k\n`);
		// console.log(`公司名：${item.companyFullName}\n地址：www.lagou.com/jobs/${item.positionId}.html\n创建时间：${item.createTime}\n`);
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
// 




