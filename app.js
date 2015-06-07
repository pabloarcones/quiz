/* Importar paquetes con middlewares*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// vistas parciales y marco (layout) único
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');
var https = require("https");
/* Importar enrutadores*/
var routes = require('./routes/index');
/* Crear aplicacion*/
var app = express();
/* Instalar generador de vistas EJS*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
/* Instalar middlewares (en el mismo orden en que
deben ejecutarse cuando llegue una transacción HTTP)*/
app.use(partials());
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

/* helpers dinamicos:*/
app.use(function(req, res, next) {
  // si no existe lo inicializa
  if (!req.session.redir) {
    req.session.redir = '/';
  }
  // guardar path en 'session.redir' para despues de login
    if (!req.path.match(/\/login|\/logout|\/user/)) {
        req.session.redir = req.path;
    }
    // hacer visible 'req.session' en las vistas
    res.locals.session = req.session;
    next();
});

/* auto-logout de sesión*/
app.use(function(req,res,next) {
    console.log("MW auto-logout: 'Ejecutándose'");
    if(req.session.user) {
        var currentTime = new Date().getTime();
        var subtraction = currentTime - req.session.user.tiempo;
        if( subtraction > 120000 ) {
               console.log("MW auto-logout: 'Destruyendo al usuario'");
               var sessionController = require('./controllers/session_controller');
               sessionController.destroy(req,res);
        }
        else {
            req.session.user.tiempo = currentTime;
        }
    }
    next();
});
/* Instalar enrutadores */
app.use('/', routes);

/* Rutas no definidas: generan error HTTP 404 (recurso no encontrado) */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/* Gestion de errores para la fase de desarrollo */
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            status : err.status,
            stack  : err.stack,     // imprime todo el stack de errores
            errors: []
        });
    });
}

/* Gestion de errores para la fase de desarrollo */
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status : err.status,
        stack  : {},        // no imprime el stack de errores (objeto vacío)
        errors: []
    });
});

/* Exportar aplicación*/
module.exports = app;                                         // Exportar app para comando de arranque
