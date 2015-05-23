var express = require('express');
var multer  = require('multer');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var statisticsController = require('../controllers/statistics_controller');

/* Página de entrada (home page) */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Quiz',
        errors: []
    });
});

/* Página de creditos */
router.get('/author', function(req, res) {
  res.render('author', {
    author: 'Gonzalo Forcada Ayala y Pablo Arcones Castrillo',
    picture: '<img src="/images/imagen.jpg" width="150px" title="Gonzalo Forcada Ayala y Pablo Arcones Castrillo">',
    errors: []});
});

// Autoload de comandos con ids
router.param('quizId',
  quizController.load);        // autoload :quizId
router.param('commentId',
  commentController.load);  // autoload :commentId
router.param('userId',
  userController.load);        // autoload :userId

/* Definición de rutas de sesiones */
router.get('/login',
  sessionController.new);       // obtener el formulario a rellenar para hacer login
router.post('/login',
  sessionController.create);    // enviar formulario para crear la sesión
router.get('/logout',
  sessionController.destroy);   // destruir la sesión actual

// Definición de rutas de cuenta
router.get('/user',                     // formulario sign un
  userController.new);
router.post('/user',                    // registrar usuario
  userController.create);
router.get('/user/:userId(\\d+)/edit',  // editar información de cuenta
  sessionController.loginRequired,
  userController.ownershipRequired,
  userController.edit);
router.put('/user/:userId(\\d+)',       // actualizar información de cuenta
  sessionController.loginRequired,
  userController.ownershipRequired,
  userController.update);
router.delete('/user/:userId(\\d+)',     // borrar cuenta
  sessionController.loginRequired,
  userController.ownershipRequired,
  userController.destroy);


/* Definición de rutas de /quizes */
router.get('/quizes',
  quizController.index);
router.get('/quizes/:quizId(\\d+)',
  quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',
  quizController.answer);
router.get('/quizes/new',
  sessionController.loginRequired,
  quizController.new);
router.post('/quizes/create',
  sessionController.loginRequired,
  multer( { dest: './public/media/'}),
  quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',
  sessionController.loginRequired,
  quizController.ownershipRequired,
  quizController.edit);
router.put('/quizes/:quizId(\\d+)',
  sessionController.loginRequired,
  quizController.ownershipRequired,
  multer( { dest: './public/media/'}),
  quizController.update);
router.delete('/quizes/:quizId(\\d+)',
  sessionController.loginRequired,
  quizController.ownershipRequired,
  quizController.destroy);

/* Definición de rutas de comentarios */
router.get('/quizes/:quizId(\\d+)/comments/new',
  commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',
  commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish',
  sessionController.loginRequired,
  commentController.ownershipRequired,
  commentController.publish);

/* Definición de rutas de estadísticas */
router.get('/quizes/statistics',
  statisticsController.statistics);

module.exports = router;
