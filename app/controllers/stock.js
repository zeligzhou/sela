var _ = require('underscore');
var Stock = require('../models/stock');
var Comment = require('../models/comment');
var Category = require('../models/category');
var fs = require('fs');
var path = require('path');
//var http = require('http');
var request = require('request');
var iconv = require('iconv-lite');
var csv = require('fast-csv');



//Detail
exports.detail = function(req,res){
    var id = req.params.id;
    Stock.update({_id:id}, {$inc:{ pv: 1 }}, function(err){
        if(err){
            console.log(err);
        }
    });
    Stock.findById(id, function(err, stock){
        if(err){
            console.log(err);
        }

        //populate给from添加一个name字段
        Comment.find({stock:id}).populate('from','name').populate('reply.from reply.to', 'name').exec(function(err, comments){
            //console.log(comments);
            res.render('detail',{
                title: '股票详情 - Sela',
                stock: stock,
                comments: comments
            });
        });

    });
}

exports.getInfo = function(req,res){
    var id = (req.query.id).toLowerCase();
    //console.log(id);
    var ret = {};
    if(id){
        //var newPath = path.join(__dirname, '../../', '/bower_components/public/data/temp/' + id +'_temp.csv');
        var now = new Date();
        var nowTime = { date:now.getUTCDate(), month:now.getUTCMonth(), year: now.getUTCFullYear()};
       // console.log(nowTime);
        var dayBefore = new Date(now.getTime() - 50*24*3600*1000);
        var beforeTime = { date:dayBefore.getUTCDate(), month:dayBefore.getUTCMonth(), year: dayBefore.getUTCFullYear()};
        console.log('http://ichart.yahoo.com/table.csv?s='+id+'&a='+beforeTime.month+'&b='+beforeTime.date+'&c='+beforeTime.year+'&d='+nowTime.month+'&e='+nowTime.date+'&f='+nowTime.year+'&g=d');
        var jA = [];
        var csvStream = csv()
            .on("data", function(data){
                 var ds = data;
                 var dsl = [];
                 //ds = convert(ds);
                 for(i in ds){
                    dsl.push(ds[i])
                 }
                 jA.push(dsl);
                 console.log(data);
            })
            .on("end", function(){
                 res.json({r:200,data:jA});
            });
        request('http://ichart.yahoo.com/table.csv?s='+id+'&a='+beforeTime.month+'&b='+beforeTime.date+'&c='+beforeTime.year+'&d='+nowTime.month+'&e='+nowTime.date+'&f='+nowTime.year+'&g=d').pipe(csvStream);

        function convert(csvString) {
            var json = [];
            var csvArray = csvString.split("\n");

            // Remove the column names from csvArray into csvColumns.
            // Also replace single quote with double quote (JSON needs double).
            var csvColumns = JSON
                    .parse("[" + csvArray.shift().replace(/'/g, '"') + "]");

            csvArray.forEach(function(csvRowString) {

                var csvRow = csvRowString.split(",");

                // Here we work on a single row.
                // Create an object with all of the csvColumns as keys.
                jsonRow = new Object();
                for ( var colNum = 0; colNum < csvRow.length; colNum++) {
                    // Remove beginning and ending quotes since stringify will add them.
                    var colData = csvRow[colNum].replace(/^['"]|['"]$/g, "");
                    jsonRow[csvColumns[colNum]] = colData;
                }
                json.push(jsonRow);
            });

            return JSON.stringify(json);
        };

        /*request('http://hq.sinajs.cn/list='+id , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var result = iconv.decode(new Buffer(body), 'GBK');
                console.log(result);
                var b = result.split("=");
                console.log(b[1]);
                if(b[1] != '\"FAILED\";\n' && b[1] != '\"\";\n'){
                    res.json({r:200,data:b[1]});
                }else{
                    res.json({r:404});
                }

            }else{
                res.json({r:405});
            }
        })*/
    }else{
        res.json({r:403});
    }
}

//Admin
exports.new = function(req,res){
    Category.find({}).exec(function(err, categories){
        res.render('admin',{
            title: '添加股票 - Sela',
            categories: categories,
            stock: {
                categoryName:"",
                title: "",
                url: "",
                poster:"",
                summary:"",
                country:""
            }
        });
    });
    
}

//Update
exports.update = function(req,res){
    var id = req.params.id;
    if(id){
        Category.find({}).exec(function(err, categories){
            Stock.findById(id, function(err, stock){
                if(err){
                    console.log(err);
                }
                res.render('admin',{
                    title: '更新股票 - Sela',
                    stock: stock,
                    categories: categories
                });
            });
        });
    }
}

//post数据
exports.save = function(req,res){
    var id = req.body.stock._id;
    var stockObj = req.body.stock;
    var _stock;
    
    if(req.poster){
        stockObj.poster = req.poster;
    }

    if(id){
        Stock.findById(id,function(err, stock){
            if(err){
                console.log(err);
            }
            _stock = _.extend(stock, stockObj);
            _stock.save(function(err,stock){
                if(err){
                    console.log(err);
                }
                res.redirect('/stock/' + stock._id);
            });
        });
    }else{
        _stock = new Stock(stockObj);

        var categoryId = stockObj.category;
        var categoryName = stockObj.categoryName;

        _stock.save(function(err,stock){
            if(err){
                console.log(err);
            }
            if(categoryId){                
                Category.findById(categoryId, function(err, category){
                    category.stocks.push(stock._id);
                    category.save(function(err, category){
                        res.redirect('/stock/' + stock._id);
                    });
                });
            }else if(categoryName){
                var category = new Category({
                    name : categoryName,
                    stocks: [stock._id]
                });
                console.log(category);
                category.save(function(err, category){
                    stock.category = category._id;
                    stock.save(function(err, stock){
                        res.redirect('/stock/' + stock._id);
                    });                    
                });
            }    
        });
    }
}

//List
exports.savePoster = function(req,res,next){
    var posterData = req.files.uploadPoster;
    var filePath = posterData.path;
    var originName = posterData.originalname;
    console.log(posterData);
    if(originName){
        fs.readFile(filePath, function(err, data){
            var timestamp = Date.now();
            var type = posterData.mimetype.split('/')[1];
            var poster = timestamp + "." + type;
            var newPath = path.join(__dirname, '../../', '/bower_components/public/upload/' + poster);
            
            fs.writeFile(newPath,data,function(err){
                req.poster = '/public/upload/' + poster;
                next();
            });
        });
    }else{
        next();
    }
}

//List
exports.list = function(req,res){
    Stock.fetch(function(err, stocks){
        if(err){
            console.log(err);
        }
        res.render('list',{
            title: '股票列表 - Sela',
            stocks: stocks
        });
    });
}

//list DELETE
exports.del = function(req,res){
    var id = req.query.id;
    if(id){
        Stock.remove({_id:id},function(err,stock){
            if(err){
                console.log(err);
            }else{
                res.json({success:1});
            }
        });
    }
}