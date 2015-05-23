var path = require('path');
var pg = require('pg');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd, {
    dialect : protocol,
    protocol: protocol,
    port    : port,
    host    : host,
    storage : storage,
    omitNull: true
});

// Importar definicion de la tabla Quiz
var quiz_path = path.join(__dirname,'quiz');
var Quiz      = sequelize.import(quiz_path);

// Importar definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment      = sequelize.import(comment_path);

// Importar definicion de la tabla User
var user_path = path.join(__dirname,'user');
var User = sequelize.import(user_path);

// Los comments pertenecen a un quiz
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

// los quizes pertenecen a un usuario registrado
Quiz.belongsTo(User);
User.hasMany(Quiz);

// Exportar tablas
exports.Quiz = Quiz;
exports.Comment = Comment;
exports.User = User;

// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
    // then(..) ejecuta el manejador una vez creada la tabla
    User.count().then(function (count) {
        // la tabla se inicializa solo si está vacía
        if(count === 0) {
          User.bulkCreate(
            [ {username: 'pablo',   password: '0000', isAdmin: true},
              {username: 'gonzalo',   password: '0000'} // el valor por defecto de isAdmin es 'false'
            ]
          ).then(function() {
                console.log('Base de datos (tabla user) inicializada');
                Quiz.count().then(function (count){
                 if(count === 0) {   // la tabla se inicializa solo si está vacía
                   Quiz.bulkCreate(
                     [ {pregunta: 'Capital de Italia',   respuesta: 'Roma', UserId: 2}, // estos quizes pertenecen al usuario (2)
                       {pregunta: 'Capital de Portugal', respuesta: 'Lisboa', UserId: 2}
                     ]
                   ).then(function(){console.log('Base de datos (tabla quiz) inicializada')});
                 };
               });
        });
        };
    });
});
