var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var StockSchema = new Schema({
    title: String,
    url: String,
    poster: String,
    summary : String,
    country: String,
    category: {
        type:ObjectId,
        ref:'Category'
    },
    pv: {
        type:Number,
        default:0
    },
    meta:{
        createAt:{
            type: Date,
            default: Date.now()
        },
        updateAt:{
            type: Date,
            default: Date.now()
        }
    }
});

StockSchema.pre('save',function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else{
        this.meta.updateAt = Date.now();
    }
    next();
});

StockSchema.statics = {
    fetch: function(cb){
        return this.find({}).sort('meta.updateAt').exec(cb);
    },
    findById: function(id, cb){
        return this.findOne({_id: id}).exec(cb);
    }
}

module.exports = StockSchema;