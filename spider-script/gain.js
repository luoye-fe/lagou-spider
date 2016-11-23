const Mongoose = require('mongoose');
const minimist = require('minimist');
const fetch = require('node-fetch');

const dbConfig = require('../database/config.js').db;

const argv = minimist(process.argv.slice(2));

const env = argv.env || 'production';

const argvCity = argv.city || '北京';

let city = '';

if (argvCity !== 'all') {
	city = argvCity;
}

let cityList = ['苏州', '南京', '北京', '上海', '杭州', '深圳', '广州', '成都', '武汉', '西安', '长沙', '天津'];

global.DB = Mongoose.connect('mongodb://' + dbConfig[env].host + ':' + dbConfig[env].port + '/' + dbConfig[env].database, {
	user: dbConfig[env].username,
	pass: dbConfig[env].password
});

const dbHandler = require('../database/handler.js');

const lagou = dbHandler('position');

let pageLen = 0;
let currentPage = 0;

function fetchSource() {
	return new Promise((resolve, reject) => {
		fetch(`https://www.lagou.com/jobs/positionAjax.json?city=${city}&needAddtionalResult=false`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cookie': 'user_trace_token=20160328095427-8b3d466eb83e4d66a12918a223f95c57; LGUID=20160328095428-01d36621-f488-11e5-baa9-5254005c3644; tencentSig=5243150336; a7122_times=2; LGMOID=20161121154415-DF59F3FE7F6D6E69CE02202F282CC997; index_location_city=%E5%8C%97%E4%BA%AC; JSESSIONID=1DA9D131B959FFF5AE18F59021F12FAF; _gat=1; TG-TRACK-CODE=index_search; Hm_lvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1479714258,1479805178; Hm_lpvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1479806975; _ga=GA1.2.346512360.1459130064; LGSID=20161122165938-ff5fe655-b091-11e6-af3f-5254005c3644; LGRID=20161122172935-2ed9f22a-b096-11e6-af3f-5254005c3644; SEARCH_ID=d71c8d432e854de5b8dee04ada65b188',
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
					'X-Anit-Forge-Code': 0,
					'X-Anit-Forge-Token': 'None',
					'X-Requested-With': 'XMLHttpRequest',
					'Pragma': 'no-cache'
				},
				body: `first=false&kd=前端&pn=${currentPage}`
			})
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				if (!pageLen) {
					pageLen = Math.round(res.content.positionResult.totalCount / res.content.pageSize);
					console.log(`共 ${pageLen} 页`);
				}
				console.log(`第 ${currentPage} 页请求成功`);
				resolve(res.content.positionResult.result);
			})
			.catch((e) => {
				reject(e);
			})
	})
}

function insertDb(resultArr) {
	return new Promise((resolve, reject) => {
		let currentArr = resultArr;

		function loop() {
			if (!currentArr[0]) {
				resolve();
				return;
			}
			lagou.find({
				positionId: currentArr[0].positionId
			}, (err, data) => {
				if (err) reject(err);
				if (!data.length) {
					let obj = {};
					try {
						obj = currentArr[0] || {};
						let salary = obj.salary || '0k-0k';
						obj['salary-min'] = salary.split('-')[0].replace(/\D/g, '');
						obj['salary-max'] = salary.split('-')[1] ? salary.split('-')[1].replace(/\D/g, '') : '999';
						delete obj.salary;
					} catch (e) {
						reject(e);
					}
					lagou.create(obj, (err) => {
						if (err) reject(err);
						loop();
					})
				} else {
					loop();
				}
				currentArr.splice(0, 1);
			});
		}
		loop();
	});
}

function delay(ms = 1000) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

async function run(cb) {
	if (currentPage > pageLen) {
		if (typeof cb === 'function') {
			cb();
		}
		return;
	};
	let currentResult = null;
	try {
		currentResult = await fetchSource();
	} catch (e) {
		console.log(`err: ${e}`);
		console.log('出错了，让我们延迟一分钟继续！！');
		await delay(1000 * 60);
		run();
		return;
	}
	await insertDb(currentResult);
	// 随机延迟 1000ms - 5000ms;
	await delay(Math.floor(Math.random() * (5000 - 1000) + 1000));
	currentPage++;
	run(cb);
}

function init() {
	console.log(`获取 ${city} 的所有前端求职信息`);
	run(function() {
		console.log('结束啦');
		Mongoose.connection.close();
	})
}

function loopAllCity() {
	if (!cityList[0]) {
		console.log('结束啦');
		console.log(Date.now());
		Mongoose.connection.close();
		return;
	}
	city = cityList[0];
	console.log(`获取 ${city} 的所有前端求职信息`);
	run(function() {
		pageLen = 0;
		currentPage = 0;
		cityList.splice(0, 1);
		loopAllCity();
	});
}

if (argvCity === 'all') {
	console.log(`获取预设所有城市的前端求职信息: ${JSON.stringify(cityList)}`);
	console.log(Date.now());
	loopAllCity();
} else {
	init();
}
