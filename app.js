var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');


var app = express();

// app.use parsers
app.use(favicon(path.join(__dirname, 'client/public/images', 'monitor.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


// Routes for the client, these needs to be added if we want to load the
// react-page with HTTP-request since it's a "SPA".
app.use(express.static(path.join(__dirname, 'client/public')));
app.use('/example', express.static(path.join(__dirname, 'client/public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');

    err.status = 404;

    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development'
        ? err
        : {};

    // This will send a 404-code if catched and then our react-app has it's own
    // 404 route-handler which will show a "404-page".
    res.status(err.status || 500);
    res.sendFile(__dirname + '/client/public/index.html');
});

module.exports = app;
