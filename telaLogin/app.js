var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//aqui voce cria as funçoes para chamar o router 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cadastroRouter = require('./routes/cadastro');
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// aqui você cria  um app com o nome da funçoes como na linha 6
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cadastro',cadastroRouter);
app.use('/login', loginRouter);


// catch 404 and forward to error handler mensagem de erro 
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // erro
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
