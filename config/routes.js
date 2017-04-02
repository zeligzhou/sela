var Stock = require('../app/controllers/stock');
var Index = require('../app/controllers/index');
var User = require('../app/controllers/user');
var Comment = require('../app/controllers/comment');
var Category = require('../app/controllers/category');

module.exports = function(app){
    //pre handle user
    app.use(function(req,res,next){
        var _user = req.session.user;
        
        app.locals.user = _user;
        return next();
        
    });

    //Stock base
    app.get('/',Index.index);
    app.get('/error',Index.errorPage);
    app.get('/results',Index.search);

    //Stock 
    app.get('/stock/:id',Stock.detail);
    app.get('/getStock',Stock.getInfo);
    app.get('/admin/stock/new',User.signinRequired, User.adminRequired,Stock.new);
    app.get('/admin/stock/update/:id',User.signinRequired, User.adminRequired,Stock.update);
    app.post('/admin/stock/post',User.signinRequired, User.adminRequired,/*Stock.savePoster,*/ Stock.save);
    app.get('/admin/stock/list',User.signinRequired, User.adminRequired,Stock.list);
    app.delete('/admin/stock/list',User.signinRequired, User.adminRequired,Stock.del);

    //User base
    app.post('/user/signup',User.signup);
    app.post('/user/signin',User.signin);
    app.get('/logout',User.logout);
    app.get('/signin',User.showSignin);
    app.get('/signup',User.showSignup);

    //user admin
    app.get('/admin/user/list',User.signinRequired, User.adminRequired,User.list);
    //todo: user admin system
    app.delete('/admin/user/list', User.signinRequired, User.superAdminRequired, User.del);
    app.post('/admin/user/mod', User.signinRequired, User.superAdminRequired, User.modRole);

    //comment
    app.post('/user/comment',User.signinRequired, Comment.save);

    //category
    app.get('/admin/category/new',User.signinRequired, User.adminRequired,Category.new);
    app.post('/admin/category',User.signinRequired, User.adminRequired,Category.save);
    app.get('/admin/category/list',User.signinRequired, User.adminRequired,Category.list);
    

}
