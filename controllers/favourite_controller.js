/* Importar el modelo */
var models = require('../models/models.js');

/* GET /user/:userId/favourites */
exports.show = function(req, res) {
    models.Favourite.findAll( {
        where: { UserId: Number(req.user.id) }
    }).then(function(favoritos) {
        var quiz_ids = [];
        for(i in favoritos) {
            quiz_ids[i] = favoritos[i].QuizId;
        }
        models.Quiz.findAll( {
          where: { id: quiz_ids }
        }).then(function(quizes) {
            res.render('favourites/show', {
                user: req.user,
                quizes: quizes,
                errors: []
            });
        });
    }).catch(function(error) {
        next(error);
    });
};

/* PUT /user/:userId/favourites/:quizId */
exports.update = function(req, res, next) {
    req.user.addQuiz(req.quiz).then(function() {
        res.redirect('/quizes');
    }).catch(function (error) {
        next(error);
    });
};

/* DELETE /user/:userId/favourites/:quizId */
exports.destroy = function(req, res) {
    req.user.removeQuiz(req.quiz).then(function() {
        res.redirect('/quizes');
    }).catch(function(error) {
        next(error);
    });
};
