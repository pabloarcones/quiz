/* Importar paquetes con middlewares */
var express = require('express');
var multer  = require('multer');
var router = express.Router();
/* Importar controladores */
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var favouriteController  = require('../controllers/favourite_controller');
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
    errors: []
  });
});

/* Autoload de comandos con ids */
// autoload :quizId
router.param('quizId',
  quizController.load);
// autoload :commentId
router.param('commentId',
  commentController.load);
// autoload :userId
router.param('userId',
  userController.load);

/* Definición de rutas de sesiones */
// obtener el formulario a rellenar para hacer login
router.get('/login',
  sessionController.new);
// enviar formulario para crear la sesión
router.post('/login',
  sessionController.create);
// destruir la sesión actual
router.get('/logout',
  sessionController.destroy);

/* Definición de rutas de usuario */
// obtener el formulario a rellenar para hacer sign un
router.get('/user',
  userController.new);
// registrar nuevo usuario
router.post('/user',
  multer( { dest: './public/media/'}),
  userController.create);
// editar información de cuenta
router.get('/user/:userId(\\d+)/edit',
  sessionController.loginRequired,
  userController.ownershipRequired,
  userController.edit);
// actualizar información de cuenta
router.put('/user/:userId(\\d+)',
  sessionController.loginRequired,
  userController.ownershipRequired,
  multer( { dest: './public/media/'}),
  userController.update);
// borrar cuenta
router.delete('/user/:userId(\\d+)',
  sessionController.loginRequired,
  userController.ownershipRequired,
  userController.destroy);
// obtener una lista de los usuarios registrados
router.get('/users',
  sessionController.loginRequired,
  userController.users);
// ver perfil del usuario
router.get('/user/:userId(\\d+)/profile',
  sessionController.loginRequired,
  userController.profile);

/* Definición de rutas de preguntas */
// ver la lista de preguntas
router.get('/quizes',
  quizController.index);
// ver la pregunta de forma individual
router.get('/quizes/:quizId(\\d+)',
  quizController.show);
// comprobar si la respuesta introducida es correcta o incorrecta
router.get('/quizes/:quizId(\\d+)/answer',
  quizController.answer);
// obtener el formulario a rellenar para crear una nueva pregunta
router.get('/quizes/new',
  sessionController.loginRequired,
  quizController.new);
// enviar el formulario para crear la pregunta
router.post('/quizes/create',
  sessionController.loginRequired,
  multer( { dest: './public/media/'}),
  quizController.create);
// editar la pregunta
router.get('/quizes/:quizId(\\d+)/edit',
  sessionController.loginRequired,
  quizController.ownershipRequired,
  quizController.edit);
// actualizar la pregunta una vez ha sido editada
router.put('/quizes/:quizId(\\d+)',
  sessionController.loginRequired,
  quizController.ownershipRequired,
  multer( { dest: './public/media/'}),
  quizController.update);
// eliminar la pregunta
router.delete('/quizes/:quizId(\\d+)',
  sessionController.loginRequired,
  quizController.ownershipRequired,
  quizController.destroy);
// ver las preguntas de un usuario
router.get('/user/:userId(\\d+)/quizes',
  quizController.index);

/* Definición de rutas de comentarios */
// obtener el formulario a rellenar para crear un nuevo comentario
router.get('/quizes/:quizId(\\d+)/comments/new',
  commentController.new);
// enviar el formulario para crear el comentario
router.post('/quizes/:quizId(\\d+)/comments',
  commentController.create);
// publicar el comentario
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish',
  sessionController.loginRequired,
  commentController.ownershipRequired,
  commentController.publish);

/* Definición de rutas de favoritos */
// ver los favoritos de un usuario
router.get('/user/:userId(\\d+)/favourites',
    favouriteController.show);
// añadir un favorito
router.put('/user/:userId(\\d+)/favourites/:quizId(\\d+)',
    sessionController.loginRequired,
    favouriteController.update);
// eliminar un favorito
router.delete('/user/:userId(\\d+)/favourites/:quizId(\\d+)',
    sessionController.loginRequired,
    favouriteController.destroy);

/* Definición de rutas de estadísticas */
router.get('/quizes/statistics',
  statisticsController.statistics);

module.exports = router;
