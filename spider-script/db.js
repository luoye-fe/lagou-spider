const mongoose = require('mongoose');

const models = require('./model.js');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

Object.keys(models).forEach((item) => {
	mongoose.model(item, new Schema(models[item]));
});

module.exports = function(type) {
	return mongoose.model(type);
};
