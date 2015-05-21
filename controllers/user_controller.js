var models = require('../models/models.js');

/* Autenticar un usuario. Busca el usuario con el login dado en la base de
datos y comprueba su password. Si todo es correcto ejecuta callback (null,user).
Si la autenticación falla o hay errores se ejecuta callback(error). */
// Comprueba si el usuario esta registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error)
exports.autenticar = function(login, password, callback) {

  models.User.find({
        where: {
          username: login
       }
  }).then(function(user) {
       	if (user) {
      		if(user.verifyPassword(password)){
              	callback(null, user);
          }
          else { callback(new Error('Password erróneo.')); }
        } else { callback(new Error('No existe user=' + login))}
  }).catch(function(error){callback(error)});
};
