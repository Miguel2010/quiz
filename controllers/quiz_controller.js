var models = require('../models/models.js');

//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId){
  models.Quiz.find(quizId).then(function(quiz){
     if(quiz){
      req.quiz = quiz;
      next();
     }else{next(new Error('No existe quizId=' + quizId))} 
   }
  ).catch(function(error){next(error)});	
};

// GET /quizes
exports.index = function(req,res){
   var patronBusqueda = req.query.search || "";
   patronBusqueda = "%" + patronBusqueda.replace(/\s/gi, "%") + "%";
   // Objeto que modela una pseudo clausula WHERE de SQL
   var paramBusqueda = {
   // El comodin "?" de la expresión de la primera posición
   // del array se sustituye por el contenido de la segunda posición
   where: ["lower(pregunta) like lower(?)", patronBusqueda]
   };
   
   models.Quiz.findAll(paramBusqueda).then(
     function(quizes){
       res.render('quizes/index.ejs', { quizes: quizes, errors: []});
     }
   ).catch(function(error){next(error)});	
};

// GET /quizes/:id
exports.show = function(req, res) {
     res.render('quizes/show', {quiz: req.quiz, errors: []});	
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
   var resultado = 'Incorrecto';
   if (req.query.respuesta === req.quiz.respuesta){
      resultado= 'Correcto';
   }
   res.render(
	'quizes/answer', 
	{ quiz: req.quiz, 
	  respuesta: resultado, 
	  errors: []
	}
   );
};

// GET /quizes/new
exports.new = function(req, res) {
   var quiz = models.Quiz.build( // Crea objeto quiz
      {pregunta: "Pregunta", respuesta: "Respuesta"}
   );
   res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz.validate().then(function(err){
	if (err) {
	  res.render('quizes/new', {quiz: quiz, errors: err.errors});
	} else {
	  quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){ res.redirect('/quizes')})
	} // res.redirect: Redirección HTTP a lista de preguntas
    }
  );	
};

// GET /author
exports.author = function(req, res) {
   res.render('author', {title: 'Miguel García Serrano',errors: []});
};

//GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz; //autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
   req.quiz.pregunta = req.body.quiz.pregunta;
   req.quiz.respuesta = req.body.quiz.respuesta;
   
   req.quiz.validate().then(
      function (err) {
         if (err) {
            res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
         } else {
            req.quiz.save( {fields: ["pregunta", "respuesta"]}).then(
               function (){ res.redirect('/quizes');}
            );
         }
      }
   );
};