var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash =  require('connect-flash');
var passport = require('passport'),LocalStrategy = require('passport-local').Strategy;
var expressSession =  require('express-session');
var mongoose  = require('mongoose');
var database = require('Database');
var bCrypt = require('bcrypt-nodejs');





mongoose.connect('mongodb://localhost/test');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.use(flash()); //has to be ahead of passport

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({secret:'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);


var isValidPassword = function(user,password){
  return bCrypt.compareSync(password,user.password);
};

var createHash = function(password){
  return bCrypt.hashSync(password,bCrypt.genSaltSync(10),null);
};


passport.use('login', new LocalStrategy({
  passReqToCallback: true
  },function(req,username,password,done){
      database.user.findOne({email: username},function(err,user){
        if(err){
          console.log('there was an eerr');
          return done(err);
        }
        if(!user){
          console.log('User not found with username '+ username);
          return done(null,false,req.flash('message',"User not found"));
        }
        if(!isValidPassword(user,password)){
          console.log('Invalid password');
          return done(null,false,req.flash('message',"Invalid password"));
        }
        //success
        console.log("success");
        return done(null,user);
    });
  }
));



passport.use('signup',new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'email', //finds name = email and uses that as username parameter
},
  function(req,username,password,done){
    findOrCreateUser = function(){
      database.user.findOne({email:username},function(err,user){
        if(err){
          console.log('Error in signup: '+err);
          return done(err);
        }
        //exists
        if(user){
          console.log('The user already exists!');
          return done(null,false,req.flash('message','User already exists!'));
        } else if(password!=req.body.password_confirmation){
          console.log("The passwords don't match!")
          return done(null,false,req.flash('message', "Passwords don't match!"));
        }else {
            var newUser  = database.user({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email : username,
              password: createHash(password),
            });
            newUser.save(function(err){
              if(err){
                console.log('Error in saving the user info: '+ err);
                throw err;
              }
              console.log('Registration successful!');
              return done(null,newUser);
            })
        }
      })
    }
   process.nextTick(findOrCreateUser); //call function(req) before findOrCreate,  could be removed by keeping function definition and delete function name
})
)


//converts user authen object to byte stream
passport.serializeUser(function(user, done){
    done(null,user);
});

//create object from a sequence of byte stream
passport.deserializeUser(function(id, done) {
  database.user.findById(id, function(err, user) {
    done(err, user);
  });
});

// passport.deserializeUser(function(user, done) {
//     done(null, user);
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });

module.exports = app;
