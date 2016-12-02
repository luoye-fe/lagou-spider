const nodemailer = require('nodemailer');

const smtpConfig = require('../config/mail.config.js');

const transporter = nodemailer.createTransport(smtpConfig);

module.exports = function(mailOptions, cb) {
	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			return cb(err);
		}
		cb();
	});
}
