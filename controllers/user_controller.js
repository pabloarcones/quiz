var users = {
    admin: {
        id      : 1,
        username: "pablo",
        password: "0000"
    },
    admin2: {
        id      : 2,
        username: "gonzalo",
        password: "0000"
    }
};

/* Autenticar un usuario. Busca el usuario con el login dado en la base de
datos y comprueba su password. Si todo es correcto ejecuta callback (null,user).
Si la autenticación falla o hay errores se ejecuta callback(error). */
// Comprueba si el usuario esta registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error)
exports.autenticar = function(login, password, callback) {

    if(users[login])
    {
        //login existe
        if(password === users[login].password)
        {
            callback(null, users[login]);
        }
        else
        {
            callback(new Error('Password erróneo.'));
        }
    }
    else
    {
        callback(new Error('No existe el usuario.'));
    }
};
