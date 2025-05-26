//モジュールのロード(道具箱に入れていくイメージ)
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');//セッションパッケージをロード

var indexRouter = require('./routes/index');//indexファイルをロードして、app.jsで書かれたのと同じ働きになる
var usersRouter = require('./routes/users');
var helloRouter = require('./routes/hello');

var app = express(); //express本体起動

// view engine setup（動的HTMLのsetup）
app.set('views', path.join(__dirname, 'views')); //viewエンジンの場所
app.set('view engine', 'ejs');//viewエンジンの種類

//useにより、expressの中の関数呼び出し。（道具の使用）
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var session_opt = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { MaxAge: 60 * 60 * 1000 }
};
app.use( session (session_opt));


//ロードしたルーターファイルにアドレスを割り当てる。
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/hello', helloRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
