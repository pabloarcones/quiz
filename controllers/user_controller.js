/* Importar el modelo */
var models = require('../models/models.js');

/* MW que permite acciones solamente si el usuario objeto
corresponde con el usuario logeado o si es cuenta admin */
exports.ownershipRequired = function(req, res, next){
    var objUser = req.user.id;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objUser === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

/* Autoload :id */
exports.load = function(req, res, next, userId) {
  models.User.find({
            where: {
                id: Number(userId)
            }
        }).then(function(user) {
      if (user) {
        req.user = user;
        next();
      } else{next(new Error('No existe userId=' + userId))}
    }
  ).catch(function(error){next(error)});
};

/* Autenticar un usuario. Busca el usuario con el login dado en la base de
datos y comprueba su password. Si todo es correcto ejecuta callback (null,user). */
/* Comprueba si el usuario esta registrado en users
Si autenticación falla o hay errores se ejecuta callback(error) */
exports.autenticar = function(login, password, callback) {

  models.User.find({
        where: { username: login }
  }).then(function(user) {
       	if (user) {
      		if(user.verifyPassword(password)){
              	callback(null, user);
          } else { callback(new Error('Password erróneo.')); }
        } else { callback(new Error('No existe user=' + login))}
  }).catch(function(error){callback(error)});
};

/* GET /user */
exports.new = function(req, res) {
    var user = models.User.build( // crea objeto 'user'
        {username: "", password: ""}
    );
    res.render('user/new', {user: user, errors: []});
};

/* POST /user */
exports.create = function(req, res) {
    if(req.files.image) {
        req.body.user.image = req.files.image.name;
    }
    var user = models.User.build( req.body.user );
    user.validate().then(function(err){
          if (err) {
                res.render('user/new', {user: user, errors: err.errors});
          } else { // guardar en DB campos username y password de user
                user.save({
                  fields: ['username', 'password', 'image']
                }).then( function(){
                  // crea la sesión (acceder usuario ya autenticado) y redirige HTTP a home page /
                  req.session.user = {id:user.id, username:user.username};
                    res.redirect('/');
                });
          }
    }).catch(function(error){next(error)});
};

/* GET /user/:userId/edit */
exports.edit = function(req, res) {
  res.render('user/edit', { user: req.user, errors: []});
};      // req.user: instancia de 'user' cargada con autoload


/* PUT /user/:userId */
exports.update = function(req, res, next) {
  req.user.username  = req.body.user.username;
  req.user.password  = req.body.user.password;
  if(req.files.image) {
        req.user.image = req.files.image.name;
  }
  req.user.validate().then(function(err){
      if (err) {
        res.render('user/' + req.user.id, {user: req.user, errors: err.errors});
      } else { // guardar campo username y password en DB
        req.user.save({
          fields: ['username', 'password', 'image']
        }).then( function(){ res.redirect('/');});   // Redirección HTTP a home page
      }
  }).catch(function(error){next(error)});
};

/* DELETE /user/:userId */
exports.destroy = function(req, res) {
  req.user.destroy().then( function() {
    // borra la sesión y redirige HTTP a home page
    delete req.session.user;
    res.redirect('/');
  }).catch(function(error){next(error)});
 };

/* GET /users */
exports.users = function(req,res) {
  models.User.findAll().then(function (users) {
    res.render('user/users', {
        users : users,
        errors: []
    });
  });
};

/* GET /user/:userId/profile */
exports.profile = function(req,res) {
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
            res.render('user/profile', {
                user  : req.user,
                quizes: quizes,
                errors: []
            });
      });
  }).catch(function(error) {
        next(error);
  });
};
