var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/quiz');
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

////////////////////////////////////////////////////////////////////////////////////

io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('addQuiz', function(msg){
          console.log(msg);
        
          var add = new quiz({
          QuizID : parseInt(msg.id),
          Name : msg.name,
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
        
        quiz.findOne({ 'QuizID': msg.qid }, 'Questions', function (err, quiz) {
              if (err) return handleError(err);
              console.log(quiz);
              io.emit('showQuiz', quiz);
        });       
   });
   
   
   
   
   
   
});
 
// ////////////////////////////////////////////////////////////////////////////////////

// app.post('/transaction', function (req, res) {
//      var bal ;
    
//     user.findOne({ 'NIC': req.body.id }, 'DueDate Balance', function (err, user) {
//       if(!user){ res.json({ end : 0 }); }
//       else{
//       bal = user.Balance;
//       bal = bal - req.body.amount;
//       update();
//       res.json({ end : 1 });}
//     });  
  
//   function update(){
//     user.update({ 'NIC' : req.body.id },{
//       $set : {
//           DueDate : new Date(req.body.due),
//           Balance : bal ,
//       },
//       $push: {
//           'Trans': {
//                 amount: req.body.amount,
//                 date: new Date( req.body.date ),
//                 officer : req.body.code  
//                    }
//              }
//     },function(err, store) {});
       
//   }     
      
// });

// ////////////////////////////////////////////////////////////////////////////////////

// app.get('/find/:id', function(req, res){
   
  // user.findOne({ 'NIC': req.params.id }, 'NIC FirstName LastName Area  Group DueDate Balance Trans Address Telephone ProductID', function (err, user) {

  //   if (err) return handleError(err);
  
  //   res.json(user);
  // });
// });



http.listen(3000, function(){
  console.log('listening on *:3000');
});