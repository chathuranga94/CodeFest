var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/quiz');
mongoose.connect('mongodb://104.131.189.142:27018/quiz');
mongoose.set('debug', true);


var schema = mongoose.Schema({
      Date : Date,
      Time : Number,
      QuizID : { type: Number, index: true },
      Name : String,
      CourseID : String,
      Questions : Array,
      Completed : Number,
      SuccessRate : Number,
      Keywords : Array
})

var quiz = mongoose.model('quiz',schema);


var schema2 = mongoose.Schema({
      ID : Number,
      Name : String,
      Quizzes : Array
})

var student = mongoose.model('student',schema2);


////////////////////////////////////////////////////////////////////////////////////

io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('addQuiz', function(msg){
          console.log(msg);
        
          var add = new quiz({
          QuizID : parseInt(msg.id),
          Name : msg.name,
          Time : msg.time,
          CourseID : msg.course,
          Completed : 0,
          SuccessRate : 0,
          Keywords : msg.key
          });

          add.save(function (err) {
            if (err) // ...
            console.log('done')
          });    
   });
   

   socket.on('addQues', function(msg){
           quiz.findOne({ 'QuizID': msg.qid }, 'Questions', function (err, user) {     
                  quiz.update({ 'QuizID' : msg.qid },{
                    $push: {
                      'Questions': {
                            Q: msg.q,
                            O: msg.o,
                            A: msg.a  }
                    }
                },function(err, store) {});    
            }); 
   }); 
   
   socket.on('getQuiz', function(msg){
        console.log(msg);
        
        quiz.findOne({ 'QuizID': msg.qid }, 'Time Name QuizID CourseID Questions -_id', function (err, quiz) {
              if (err) return handleError(err);
              console.log(quiz);
              io.emit('showQuiz', quiz);
        });       
   });
   
   
   socket.on('sendResults', function(msg){
        
        quiz.findOne({ 'QuizID': msg.qid }, 'Completed SuccessRate', function (err, user) {        
                 var com = user.Completed + 1;
                 var suc = (user.Completed*user.SuccessRate + 100*msg.result/msg.count )/(user.Completed + 1);

                 var x = {
                   yourRate : 100*msg.result/msg.count ,
                   avgRate : suc
                 }    
                io.emit('showQuiz',x);

                 quiz.update({ 'QuizID' : msg.qid },{
                    $set : {
                        Completed : com,
                        SuccessRate : suc
                }
                },function(err, store) {});    
            });    
                
   });
   
   
   socket.on('allQuiz', function(msg){      
        quiz.find({}, 'Time Name QuizID CourseID -_id', function (err, quiz) {
              if (err) return handleError(err);
              console.log(quiz);
              io.emit('showQuiz', quiz);
        });       
    });
    
    
    
   socket.on('deleteQuiz', function(msg){      
         quiz.findOne({ 'QuizID': msg.qid }).remove().exec();
    });    
    
    socket.on('addStudent', function(msg){
          console.log(msg);
        
          var add = new quiz({
          ID : parseInt(msg.id),
          Name : msg.name
          });

          add.save(function (err) {
            if (err) // ...
            console.log('done')
          });    
     });
     
    socket.on('allStudent', function(msg){      
        student.find({}, 'ID Name -_id', function (err, student) {
              if (err) return handleError(err);
              io.emit('getStudent', student);
        });       
    });
    
    
    
    
  
   
   
});
 



http.listen(3000, function(){
  console.log('listening on *:3000');
});