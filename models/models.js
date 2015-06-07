/* Importar paquetes con middlewares */
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

/* Cargar Modelo ORM (Object Relational Mapping)*/
var Sequelize = require('sequelize');

/* Usar BBDD SQLite (desarrollo) o Postgres (despliegue) */
var sequelize = new Sequelize(DB_name, user, pwd, {
    dialect : dialect,
    protocol: protocol,
    port    : port,
    host    : host,
    storage : storage,
    omitNull: true
});

/* Importar definicion de la tabla Quiz */
var quiz_path = path.join(__dirname,'quiz');
var Quiz = sequelize.import(quiz_path);

/* Importar definicion de la tabla Comment */
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

/* Importar definicion de la tabla User */
var user_path = path.join(__dirname,'user');
var User = sequelize.import(user_path);

/* Importar definición de la tabla Favourite */
var favourite_path = path.join(__dirname, 'favourite');
var Favourite = sequelize.import(favourite_path);

/* Relaciones entre tablas */
// Los comments pertenecen a un quiz
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

// Los quizes pertenecen a un usuario registrado
Quiz.belongsTo(User);
User.hasMany(Quiz);

// Los users pertenecen a muchos quizes, y viceversa
User.belongsToMany(Quiz, { through: 'Favourite' });
Quiz.belongsToMany(User, { through: 'Favourite' });

/* Exportar tablas */
exports.Quiz = Quiz;
exports.Comment = Comment;
exports.User = User;
exports.Favourite = Favourite;

/* Iniciar tablas */
// sequelize.sync() crea e inicializa tabla de preguntas en DB
// then(..) ejecuta el manejador una vez creada la tabla
sequelize.sync().then(function() {
    // Tabla User
    User.count().then(function (count) {
        // La tabla se inicializa solo si está vacía
        if(count === 0) {
          User.bulkCreate(
            [ {username: 'pablo',   password: '0000', isAdmin: true},
              {username: 'gonzalo',   password: '0000'} // el valor por defecto de isAdmin es 'false'
            ]
          ).then(function() {
              console.log('Base de datos (tabla user) inicializada');
              // Tabla Quiz
              Quiz.count().then(function (count){
                // La tabla se inicializa solo si está vacía
                if(count === 0) {   // estos quizes pertenecen al usuario (2)
                  Quiz.bulkCreate(
                     [ { pregunta: 'Capital de Italia',   respuesta: 'Roma', UserId: 2 },
                       { pregunta: 'Capital de Portugal', respuesta: 'Lisboa', UserId: 2 },
                       { pregunta : 'Capital de Francia', respuesta: 'París', UserId: 1 }
                     ]
                  ).then(function(){
                      console.log('Base de datos (tabla quiz) inicializada');
                      // Tabla Favourite
                      Favourite.count().then(function (count) {
                        // La tabla se inicializa solo si está vacía
                          if(count === 0) {
                              Favourite.bulkCreate([{ UserId: 1, QuizId: 3 }
                              ]).then(function() {
                                  console.log('Base de datos (tabla favourite) inicializada');
                              });
                          }
                      });
                  });
                }
              });
          });
        }
    });
});
