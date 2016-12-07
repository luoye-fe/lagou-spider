const Mongoose = require('mongoose');
const minimist = require('minimist');
const fetch = require('node-fetch');

const sendMail = require('./mail.js');

const dbConfig = require('../config/db.config.js');
const dbHandler = require('../database/handler.js');

// 获取命令行参数
const argv = minimist(process.argv.slice(2));

// 分环境连接数据库
const env = argv.env || 'pro';
global.DB = Mongoose.connect('mongodb://' + dbConfig[env].host + ':' + dbConfig[env].port + '/' + dbConfig[env].database, {
	user: dbConfig[env].username,
	pass: dbConfig[env].password
});

// 获取 position model
const Position = dbHandler('position');

const argvCity = argv.city || 'all';

const label = argv.label || '前端';

let newPosition = 0;
let beginTime = Date.now();

// 获取所有城市信息
function getAllCitysArr() {
	return new Promise((resolve, reject) => {
		if (argvCity !== 'all') {
			resolve([argvCity]);
		} else {
			fetch('https://www.lagou.com/lbs/getAllCitySearchLabels.json', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Cookie': 'user_trace_token=20160328095427-8b3d466eb83e4d66a12918a223f95c57; LGUID=20160328095428-01d36621-f488-11e5-baa9-5254005c3644; tencentSig=5243150336; a7122_times=2; LGMOID=20161121154415-DF59F3FE7F6D6E69CE02202F282CC997; index_location_city=%E5%8C%97%E4%BA%AC; JSESSIONID=1DA9D131B959FFF5AE18F59021F12FAF; _gat=1; TG-TRACK-CODE=index_search; Hm_lvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1479714258,1479805178; Hm_lpvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1479806975; _ga=GA1.2.346512360.1459130064; LGSID=20161122165938-ff5fe655-b091-11e6-af3f-5254005c3644; LGRID=20161122172935-2ed9f22a-b096-11e6-af3f-5254005c3644; SEARCH_ID=d71c8d432e854de5b8dee04ada65b188',
						'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
						'X-Anit-Forge-Code': 0,
						'X-Anit-Forge-Token': 'None',
						'X-Requested-With': 'XMLHttpRequest',
						'Pragma': 'no-cache'
					}
				})
				.then((res) => {
					return res.json();
				})
				.then((res) => {
					let result = [];
					let allCitySearchLabels = res.content.data.allCitySearchLabels;
					Object.keys(allCitySearchLabels).forEach((item) => {
						allCitySearchLabels[item].forEach((eachCity) => {
							result.push(eachCity.name);
						});
					});
					resolve(result);
				})
				.catch((e) => {
					reject(e);
				});
		}
	});
}

// 获取某城市当前页的职位信息列表
function getSource(city, page) {
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
				body: `first=false&kd=${label}&pn=${page}`
			})
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				if (page !== 0) {
					console.log(`第 ${page} 页请求成功`);
				}
				resolve({
					pageSum: Math.round(res.content.positionResult.totalCount / res.content.pageSize),
					res: res.content.positionResult.result
				});
			})
			.catch((e) => {
				reject(e);
			})
	});
}

// 职位信息列表写库
function writeDb(resultArr) {
	return new Promise((resolve, reject) => {
		let currentArr = resultArr;

		function loop() {
			if (!currentArr[0]) {
				resolve();
				return;
			}
			Position.find({
				positionId: currentArr[0].positionId
			}, (err, data) => {
				if (err) reject(err);
				if (!data.length) {
					let obj = {};
					try {
						obj = currentArr[0] || {};
						let salary = obj.salary || '0k-0k';
						obj['salary-min'] = salary.split('-')[0].replace(/\D/g, '');
						obj['salary-max'] = salary.split('-')[1] ? salary.split('-')[1].replace(/\D/g, '') : salary.split('-')[0];
						delete obj.salary;
					} catch (e) {
						reject(e);
					}
					Position.create(obj, (err) => {
						if (err) reject(err);
						newPosition++;
						currentArr.splice(0, 1);
						loop();
					})
				} else {
					currentArr.splice(0, 1);
					loop();
				}
			});
		}
		loop();
	});
}

// 处理某城市的所有职位信息
function handleOneCity(city) {
	return new Promise((resolve, reject) => {
		let currentPage = 0;
		let pageSum = -1;
		console.log(`获取 ${city} 的职位信息`);

		function loop() {
			if (currentPage > pageSum && pageSum !== -1) {
				resolve();
				return;
			}
			delay(Math.floor(Math.random() * (3000 - 500) + 500))
				.then(() => {
					return getSource(city, currentPage)
				})
				.then((result) => {
					if (pageSum === -1) {
						pageSum = result.pageSum
						console.log(`共 ${pageSum} 页`);
					}
					if (pageSum === 0) {
						resolve();
						throw function() {}
					}
					return writeDb(result.res);
				})
				.then(() => {
					currentPage++;
					loop();
				})
				.catch((e) => {
					reject(e);
				});
		}
		loop();
	});
}

// 延迟函数
function delay(ms = 1000) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

getAllCitysArr()
	.then((arr) => {
		let citysArr = [...arr];
		console.log(`获取 ${citysArr[0]} 等 ${citysArr.length} 个城市的 ${label} 求职信息`);

		function loop() {
			city = citysArr[0];
			if (!city) {
				let mailOptions = {
					from: '"Spider 👥" <842891024@qq.com>',
					to: '842891024@qq.com',
					subject: 'Lagou-spider Result ✔',
					html: `
	本次爬取开始时间：${new Date(beginTime).toLocaleTimeString('ja-chinese', {year: "numeric", month: '2-digit', day: '2-digit'})}<br>
	本次新增职位信息： ${newPosition} 条！<br>
	本次爬取时间： ${(Date.now() - beginTime)} ms!<br>
	`
				};
				sendMail(mailOptions, (err) => {
					console.log(
						`
	本次爬取开始时间：${new Date(beginTime).toLocaleTimeString('ja-chinese', {year: "numeric", month: '2-digit', day: '2-digit'})}
	本次新增职位信息： ${newPosition} 条！
	本次爬取时间： ${(Date.now() - beginTime)} ms!
	`);
					console.log('邮件发送成功!');
					Mongoose.connection.close();
					process.exit(1);
				});
				return;
			}
			handleOneCity(city)
				.then(() => {
					citysArr.splice(0, 1);
					loop();
				})
				.catch((e) => {
					loop();
				})
		}
		loop();
	})
	.catch((e) => {
		console.log(e);
		Mongoose.connection.close();
		process.exit(1);
	})
