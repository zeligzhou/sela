var Stock = require('../models/stock');
var Category = require('../models/category');


exports.index = function(req, res){
    Category.find({}).populate({path:"stocks", options:{limit:5}}).exec(function(err, categories){
        if(err){
            console.log(err);
        }
        res.render('index',{
            title: '首页 - Sela',
            categories: categories
        });
    });

    
}


exports.errorPage = function(req, res){
    //console.log(req.session.user);
    var errorDetail = "您的操作有误！";
    var errorCode = req.query.code;
    console.log(errorCode);
    if(errorCode == "101"){
        errorDetail = "您不是超级管理员，没有操作权限！"
    }else if(errorCode == "102"){
        errorDetail = "您不是管理员，没有操作权限！"
    }
    res.render('error',{
        title: '错误 - Sela',
        error: errorDetail
    });
}


exports.search = function(req, res){
    var cateId = req.query.cate || null;
    var page = req.query.page || 0;
    var count = 2;
    var index = page * count;
    var name = req.query.queryName || null;
    if(cateId){
        Category.findOne({_id : cateId}).populate({path:"stocks"}).exec(function(err, category){
            if(err){
                console.log(err);
            }
            var stocks = category.stocks || [];
            var results = stocks.slice(index, index+count);
            res.render('results',{
                title: '分类搜索 - Sela',
                keyword: category.name,
                query:"cate=" + cateId,
                stocks: results,
                currentPage : (parseInt(page)+1),
                totalPage: Math.ceil(stocks.length / count)
            });
        });
    }else{
        Stock.find({title:new RegExp(name + ".*", 'i')}).exec(function(err, stocks){
            if(err){
                console.log(err);
            }
            console.log(stocks);
            var stocks = stocks || [];
            var results = stocks.slice(index, index+count)
            res.render('results',{
                title: '搜索 - Sela',
                keyword: name,
                query:"queryName=" + name,
                stocks: results,
                currentPage : (parseInt(page)+1),
                totalPage: Math.ceil(stocks.length / count)
            });
        });
    }
    

    
}