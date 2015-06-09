// Collection, DB mapped, used only on server
Questions = new Meteor.Collection("questions");

// Publish the collections used on server and client
// (declared in /common/collections.js)
Meteor.publish("logs", function() {
  return Logs.find({}, {limit: 10, sort: {timestamp: -1}});
});
Meteor.publish("players", function() {
  return Players.find({}, {limit: 10, sort: {score: -1, name: 1}});
});
Meteor.publish("quizzes", function() {console.log(Quizzes.find().count())
  return Quizzes.find({}, {sort: {name: 1}});
});

// Method implementations, called asynchronously from the client
// (for the client, the stubs are declared in /client/methods.js)
Meteor.methods({
  // pick a question out of the Questions collection/DB
  getquizzes: function(selected) { 
    if (selected && selected !== "new") {
    	var Quiz = Quizzes.findOne({name: selected});
      //console.log("creating quiz", selected);
      if (selected == "capitals"){
        // File europe.js is auto parsed and loaded
        if (Questions.find().count() < _.size(europe)) {
          Questions.remove({});
          var countries = europe;
          var _default = Quizzes.findOne({name: "capitals"})._id;
          _.each(countries, function(n, i) {
            console.log("creating question with country ", n);
            var q = "What is the capital of " + n.country + "?";
            var a = [];
            a.push(n.capital);
            _.each(_.range(1, 4), function(num) {
              var k = i + num;
              if (k >= _.size(countries)) {
                k = k - _.size(countries);
              }
              a.push(countries[k].capital);
            });
          Questions.insert({id: i + 1, question: q, answers: a}); Quizzes.update(_default, {$addToSet: {questions: {question: q, answer: n.capital}}}); 
          });
          console.log("finished creating questions");
        }
      } 
      else{    
        Questions.remove({});
        var qs = _.rest(Quiz.questions);
        _.each(qs, function(n, i) {
          console.log("creating question with qs ", n);
          var q = n.question;
          var a = [];
          a.push(n.answer);
          _.each(_.range(1, 4), function(num) {
            var k = i + num;
            if (k >= _.size(qs)) {
              k = k - _.size(qs);
            }
            a.push(qs[k].answer);
          });
          Questions.insert({id: i + 1, question: q, answers: a});
        }); 
      }    
      var q = Quizzes.find().fetch();
      return q;
    }
  },
  getQuestion: function(playerId, selected) {
  	 var player = Players.findOne(playerId);
  	 var username = player.name;
  	 var notInLogs = _.isUndefined(Logs.findOne({quiz: selected, name: username}));
    var q = Questions.find().fetch();
    if (notInLogs) {
      console.log("notInLogs count", Logs.find({quiz: selected, name: username}).count());
    } else {
      console.log("InLogs count", Logs.find({quiz: selected, name: username}).count());
    }    
    var count = Logs.find({quiz: selected, name: username}).count();
    console.log("count", count, "size", _.size(q));    
    if (count < _.size(q)){
    	Q = q[count];   
      return Q;
    }
  },
  getquestions: function() {
    var q = Questions.find().fetch();
    return q;
  },    
  // write the log entry with the name, score and message given,
  // extend with the current timestamp (makes use of momentJS library in the ./lib folder)
  writeLog: function(theName, theScore, theMessage, theQuiz) {
    var dateTimeString = moment().format("YYYY-MM-DD HH:mm:ss");
    var theCount = Players.findOne({name: theName}).count;
    Logs.insert({timestamp: dateTimeString, name: theName, quiz: theQuiz, score: theScore, message: theMessage, count: theCount});
    console.log("%s %s %s (%d)", dateTimeString, theName, theMessage, theScore, theCount, theQuiz);
  },
  // add new player if not exist
  createPlayerIfNotExist: function(username) {
    var player = Players.findOne({name: username});
    var playerId;
    if (!player) {
      playerId = Players.insert({name: username, role: "user", score: 0, count: 0});
      Meteor.call("writeLog", username, 0, "has registered");
    } else {
      playerId = player._id; 
    }
    return playerId;
  },
    deleteQuiz: function(id) {    
    return Quizzes.remove(id);    
  },
  // update the players score
  updateScore: function(playerId, points) {
    Players.update(playerId, {$inc: {score: points}});
  },
  updateCount: function(playerId, inc) {
    Players.update(playerId, {$inc: {count: inc}});
  },
  resetCount: function(playerId) {
    Players.update(playerId, {$set: {count: 0}});
  }
});
