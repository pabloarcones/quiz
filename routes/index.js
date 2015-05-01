var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

router.get('/author', function(req, res) {
  res.render('author', {
    author: 'Gonzalo Forcada Ayala y Pablo Arcones Castrillo',
    picture: '<img src="/images/imagen.jpg" width="150px" title="Gonzalo Forcada Ayala y Pablo Arcones Castrillo">'});
});

router.get('/quizes/question' , quizController.question);
router.get('/quizes/answer' , quizController.answer);

module.exports = router;
