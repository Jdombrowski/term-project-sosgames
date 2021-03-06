const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const expressValidator = require('express-validator');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash'); // Might delete
const LocalStrategy = require('passport-local').Strategy;
// const routes = require('./routes'); - Was giving me a bug

// Make use of environment variables defined in .env
if( process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production' ) {
  require( "dotenv" ).config();
}

// Routes?
const login = require('./routes/login'); 
const users = require('./routes/users');
const tests = require('./routes/tests');
const game = require('./routes/game');
const signup = require('./routes/signup');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(cookieParser(process.env.COOKIE_SECRET)); // DEBUG - Set secret to encrypt cookie
app.use(express.static(path.join(__dirname, 'public')));
app.use( expressLayouts );

// Express Session
app.use( session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport Initialize
app.use(passport.initialize());
app.use(passport.session());

// Express Validator - Taken from Middleware Options on Github
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    let namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Variables for Flash Messages
app.use(function (request, response, next) {
  response.locals.success_msg = request.flash('success_msg');
  response.locals.error_msg = request.flash('error_msg');
  response.locals.error = request.flash('error');
  response.locals.user = request.user || null;
  next();
});


// Middleware for routes 
app.use('/', login);
app.use('/users', users);
app.use('/tests', tests);
app.use('/game', game);
app.use('/signup', signup );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;