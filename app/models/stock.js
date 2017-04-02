var mongoose = require('mongoose');
var StockSchema = require('../schemas/stock');
var Stock = mongoose.model('Stock', StockSchema);

module.exports = Stock;