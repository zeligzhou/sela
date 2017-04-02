var _ = require('underscore');
var Stock = require('../models/stock');
var Comment = require('../models/comment');



//post数据
exports.save = function(req,res){
    var _comment = req.body.comment;
    var stockId = _comment.stock;
    if(_comment.cid){
        Comment.findById(_comment.cid, function(err, comment){
            var reply = {
                from: _comment.from,
                to: _comment.tid,
                content: _comment.content
            }
            comment.reply.push(reply);
            comment.save(function(err,comment){
                if(err){
                    console.log(err);
                }
                res.redirect('/stock/' + stockId);
            });
        });
    }else{
        var comment = new Comment(_comment);
    
        comment.save(function(err,comment){
            if(err){
                console.log(err);
            }
            res.redirect('/stock/' + stockId);
        });
    }
    
}

