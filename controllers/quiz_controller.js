/* Importar el modelo */
var models = require('../models/models.js');

/* MW que permite acciones solamente si el quiz objeto
pertenece al usuario logeado o si es cuenta admin */
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

/* Autoload :id - factoriza el código si ruta incluye :quizId */
exports.load = function(req, res, next, quizId) {
    models.Quiz.find( {
        where: {
          id: Number(quizId)
        },
        include: [{
          model: models.Comment
        }]
      }).then(function(quiz) {
        if(quiz)
        {
            req.quiz = quiz;
            next();
        }
        else
        {
            next(new Error('No existe quizId = ' + quizId));
        }
    }).catch(function(error) {
        next(error);
    });
};

/* GET /quizes
GET /users/:userId/quizes */
exports.index = function(req, res, next) {
  var options = {};
  if(req.user) {
    options.where = { UserId: req.user.id }
  }
  var search = "";
  var mark     = [];
  var favourites = [];
  if(req.session.user) {
    models.Favourite.findAll( {
        where: { UserId: Number(req.session.user.id) }
    }).then(function(fav) {
        favourites = fav;
        if(req.query.search === undefined) {
            models.Quiz.findAll(options).then(function(quizes) {
                for(j in quizes) {
                    mark[j] = 'unchecked';
                    for(k in favourites) {
                      if(favourites[k].QuizId === quizes[j].id) {
                          mark[j] = 'checked';
                      }
                    }
                }
                res.render('quizes/index', {
                    quizes: quizes,
                    mark: mark,
                    errors: []
                });
            }).catch(function(error) {
                next(error);
            });
          }
          else {
              search = '%' + req.query.search + '%';
              search = search.replace(/\s/g, '%');
              models.Quiz.findAll( {
                  where: ["pregunta like ?", search],
                  order: ['pregunta']
              }).then(function(quizes) {
                  for(j in quizes) {
                    mark[j] = 'unchecked';
                    for(k in favourites) {
                      if(favourites[k].QuizId === quizes[j].id) {
                        mark[j] = 'checked';
                      }
                    }
                  }
                  res.render('quizes/index', {
                    quizes: quizes,
                    mark: mark,
                    errors: []
                  });
              }).catch(function(error) {
                    next(error);
              });
          }
      });
    }
    else {
      if(req.query.search === undefined) {
          models.Quiz.findAll(options).then(function(quizes) {
            res.render('quizes/index', {
                quizes: quizes,
                mark: mark,
                errors: []
            });
          }).catch(function(error) {
                next(error);
          });
      }
      else {
        search = '%' + req.query.search + '%';
        search = search.replace(/\s/g, '%');
        models.Quiz.findAll( {
            where: ["pregunta like ?", search],
            order: ['pregunta']
        }).then(function(quizes) {
            res.render('quizes/index', {
                  quizes: quizes,
                  mark: mark,
                  errors: []
            });
        }).catch(function(error) {
              next(error);
        });
      }
    }
};

/* GET /quizes/:quizId */
exports.show = function(req, res) {
  var mark = 'unchecked';
  if(req.session.user) {
    models.Favourite.find( {
      where: {
          UserId: Number(req.session.user.id),
          QuizId: Number(req.quiz.id)
      }
    }).then(function(fav) {
        if(fav) {
            mark = 'checked';
        }
        res.render('quizes/show', {
            quiz: req.quiz,
            mark: mark,
            errors: []
        });
    });
  }
  else {
    res.render('quizes/show', {
        quiz: req.quiz,
        mark: mark,
        errors: []
    });
  }
};

/* GET /quizes/:quizId/answer */
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
      resultado = 'Correcto';
  }
  res.render('quizes/answer', {
      quiz     : req.quiz,
      respuesta: resultado,
      errors: []
  });
};

/* GET /quizes/new */
exports.new = function(req, res) {
    //crea objeto quiz
    var quiz = models.Quiz.build( {
        pregunta : 'Pregunta',
        respuesta: 'Respuesta'
    });
    res.render('quizes/new', {
        quiz: quiz,
        errors: []
    });
};

/* POST /quizes/create */
exports.create = function(req, res, next) {
    req.body.quiz.UserId = req.session.user.id;
    if(req.files.image) {
        req.body.quiz.image = req.files.image.name;
    }
    var quiz = models.Quiz.build(req.body.quiz);
    quiz.validate().then(function(err) {
          if (err) {
              res.render('quizes/new', {
                  quiz  : quiz,
                  errors: err.errors
              });
          }
          else { // guardar en DB los campos "pregunta", "respuesta", "UserId" e "image" de quiz
              quiz.save( {
                  fields: [
                    'pregunta',
                    'respuesta',
                    'UserId',
                    'image'
                  ]
              }).then(function() {
                  // redirección HTTP a lista de preguntas
                  res.redirect('/quizes');
              });
          }
      }).catch(function(error) {
            next(error);
    });
};

/* GET /quizes/:quizId/edit */
exports.edit = function(req, res) {
    res.render('quizes/edit', {
        quiz: req.quiz,
        errors: []
    });
};

/* PUT /quizes/:quizId */
exports.update = function(req, res, next) {
    if(req.files.image) {
        req.quiz.image = req.files.image.name;
    }
    req.quiz.pregunta  = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.validate().then(function(err) {
        if (err)
        {
            res.render('quizes/edit', {
                quiz  : req.quiz,
                errors: err.errors
            });
        }
        else
        { // guardar en DB los campos "pregunta", "respuesta" y "image" de req.quiz
            req.quiz.save( {
                fields: [
                  'pregunta',
                  'respuesta',
                  'image'
                ]
            }).then( function() {
                // redirección HTTP a lista de preguntas
                res.redirect('/quizes');
            });
        }
    }).catch(function(error) {
        next(error);
    });
};

/* DELETE /quizes/:quizId */
exports.destroy = function(req, res, next) {
    req.quiz.destroy().then(function() {
        res.redirect('/quizes');
    }).catch(function(error) {
        next(error);
    });
};
