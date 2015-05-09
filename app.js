var express = require('express');                             // Importar paquetes con middlewares
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var partials = require('express-partials');

var routes = require('./routes/index');                       // Importar enroutadores
//var users = require('./routes/users');

var app = express();                                          // Crear aplicacion

// view engine setup
app.set('views', path.join(__dirname, 'views'));              // Instalar generador de visitas EJS
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());                                   // Instalar middlewares
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);                                         // Instalar enroutadores
//app.use('/users', users);                                     // Asociar rutas a sus gestores

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');                         // Resto de rutas: genera error 404 de HTTP
    err.status = 404;
    next(err);
});

// error handlers

// development error handler: will print stacktrace
if (app.get('env') === 'development') {                       // Gestion de errores durante el desarrollo
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler: no stacktraces leaked to user
app.use(function(err, req, res, next) {                       // Gestion de errores de produccion
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;                                         // Exportar app para comando de arranque
