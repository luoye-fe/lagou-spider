const fs = require('fs');
const path = require('path');
const Router = require('koa-router');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

const env = argv.env || 'pro';

async function readFile(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf-8', (err, data) => {
			if (err) return reject(err);
			resolve(data);
		});
	});
}

const View = new Router();

View.get('/', async (ctx, next) => {
	ctx.body = await readFile(path.join(__dirname, `../index.${env}.html`));
});

module.exports = View;
