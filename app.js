var express = require('express');
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var multer = require('multer');
var port = process.env.PORT || 3000;
var app = express();
var bcrypt = require('bcrypt');
var dbUrl = "mongodb://localhost/sela";


mongoose.connect(dbUrl);
var models_path = __dirname + '/app/models';
var walk = function(path){
    fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path);
app.set('views','./app/views/pages');
app.set('view engine', 'jade');
app.locals.moment = require('moment');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(cookieParser());
app.use(session({ secret:"sela", store: new mongoStore({
    url: dbUrl,
    collection:'sessions'
}) }));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.listen(port);

if('development' === app.get('env')){
    app.set('showStackError', true);
    app.use(logger(':method :url :status'));
    app.locals.pretty = true;
    mongoose.set('debug',true);
}

require('./config/routes.js')(app);
console.log('sela started on port ' + port);
