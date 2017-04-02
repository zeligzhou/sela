var User = require('../models/user');
var _ = require('underscore');


//signup
exports.signup = function(req,res){
    var _user = req.body.user;

    User.findOne({name:_user.name},function(err,user){
        if(err){
            console.log(err);
        }
        if(user){
            console.log("signup:user is "+user);
            res.redirect('/signin');
        }else{
            user = new User(_user);
            user.save(function(err,user){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/');
                }
            });
        }
    });
}

//List
exports.list = function(req,res){
    User.fetch(function(err, users){
        if(err){
            console.log(err);
        }
        
        res.render('userlist',{
            title: '用户列表 - Sela',
            users: users
        });
    });
}

//signin
exports.signin = function(req,res){
    var _user = req.body.user;

    User.findOne({name:_user.name},function(err,user){
        if(err){
            console.log(err);
        }
        if(!user){
            console.log("signin:user is null or "+user);
            res.redirect('/signup');
        }else{
            user.comparePassword(_user.password, function(err, isMatch){
                if(err){
                    console.log(err);
                }
                if(isMatch){
                    req.session.user = user;
                    console.log('password matched');
                    return res.redirect('/');
                }else{
                    console.log('password not matched');
                    return res.redirect('/signin');
                }
            });
        }
    });
}

//logout
exports.logout = function(req,res){
    console.log(0);
    delete req.session.user;
    //delete app.locals.user;
    res.redirect('/');
}

//showsignup
exports.showSignup = function(req,res){
    res.render('signup',{
            title: '注册 - Sela',
        });
}

//showsignin
exports.showSignin = function(req,res){
    res.render('signin',{
            title: '登录 - Sela',
        });
}

//mid signin
exports.signinRequired = function(req,res,next){
    var user =  req.session.user;
    if(!user){
        return res.redirect('/signin')
    }else{
        next();
    }
}

//mid admin
exports.adminRequired = function(req,res,next){
    var user =  req.session.user;
    if(!user.role || user.role <= 10){
        console.log(user.role + " is not admin");
        return res.redirect('/error?code=102');
    }else{
        next();
    }
}

//mid superadmin
exports.superAdminRequired = function(req,res,next){
    var user =  req.session.user;
    if(!user.role || user.role <= 50){
        console.log(user.role + " is not super admin");
        return res.redirect('/error?code=101');
    }else{
        next();
    }
}

//userlist DELETE
exports.del = function(req,res){
    var id = req.query.id;
    if(id){
        User.remove({_id:id},function(err,user){
            if(err){
                console.log(err);
            }else{
                res.json({success:1});
            }
        });
    }
}


//userlist mod
exports.modRole = function(req,res){
    var id = req.query.id;
    var role = req.query.role;
    var _user;
    var userObj = { role:role }

    

    if(id !== 'undefined'){
        User.findById(id,function(err, user){
            if(err){
                console.log(err);
            }
            _user = _.extend(user, userObj);
            _user.save(function(err,user){
                if(err){
                    console.log(err);
                }
                res.redirect('/admin/user/list');
            });
        });
    }
}