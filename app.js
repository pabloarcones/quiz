var express = require('express');                             // Importar paquetes con middlewares
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');
var https = require("https");

var routes = require('./routes/index');                       // Importar enroutadores
//var users = require('./routes/users');

var app = express();                                          // Crear aplicacion

// view engine setup
app.set('views', path.join(__dirname, 'views'));              // Instalar generador de visitas EJS
app.set('view engine', 'ejs');

app.use(partials());
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());                                   // Instalar middlewares
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// helpers dinamicos:
app.use(function(req, res, next) {
  // si no existe lo inicializa
  if (!req.session.redir) {
    req.session.redir = '/';
  }
  // guardar path en session.redir para despues de login
    if (!req.path.match(/\/login|\/logout|\/user/)) {
        req.session.redir = req.path;
    }
    // hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});

// auto-logout de sesión
app.use(function(req,res,next) {
    console.log("MW auto-logout: 'Ejecutándose'");
    if(req.session.user) {
        var currentTime = new Date().getTime();
        var diferencia  = currentTime - req.session.user.tiempo;
        if(diferencia > 120000) {
               console.log("MW auto-logout: 'Destruyendo al usuario'");
               var sessionController = require('./controllers/session_controller').destroy(req,res);
        }
        else
        {
            req.session.user.tiempo = currentTime;
        }
    }
    next();
});

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
