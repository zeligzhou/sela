var _ = require('underscore');
var Store = require('../models/stock');
var Comment = require('../models/comment');
var Category = require('../models/category');

//Admin
exports.new = function(req,res){
    res.render('category-admin',{
        title: '分类录入 - Sela',
        category:{}
    });
}

//post数据
exports.save = function(req,res){
    var _category = req.body.category;

    var category = new Category(_category);
    category.save(function(err,category){
        if(err){
            console.log(err);
        }
        res.redirect('/admin/category/list');
    });
    
}


//List
exports.list = function(req,res){
    Category.fetch(function(err, categories){
        if(err){
            console.log(err);
        }
        
        res.render('categorylist',{
            title: '分类列表 - Sela',
            categories: categories
        });
    });
}

