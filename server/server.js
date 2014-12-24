// Collection, DB mapped, used only on server
Questions = new Meteor.Collection("questions");

// On server startup, create some players and questions if the database is empty.
Meteor.startup(function () {
  // add some demo players
  if (Players.find().count() === 0) {
    console.log("creating some dummy players...");
    var names = ["Brendan Eich", "Jeremy Ashkenas", "Sema Kashalo", "Ryan Dahl" ];
    _.each(names, function(n) {
      Players.insert({name: n, role: "user", score: _.sample(_.range(0, 55, 5))});
    });
    /*for (var i = 0; i < names.length; i++) {
        Players.insert({name: names[i], score: _.shuffle(_.range(0, 55, 5))[0]//Math.floor(Math.random() * 10) * 5
      });
    }*/
  }

  // File europe.js is auto parsed and loaded
  if (Questions.find().count() < _.size(europe)) { //europe.length
    Questions.remove({});
    var countries = _.shuffle(europe)
    /*for (var i = 0; i < countries.length; i++) {
    var c = countries[i];
      console.log("creating question with country ", c);
      var q = "What is the capital of " + c.country + "?";
      var a = [];
      a.push(c.capital);
      for (var n = 1; n < 4; n++) {
        var k = i + n;
        if (k >= countries.length) {
          k = k - countries.length;
        }
        a.push(countries[k].capital);
        }
            Questions.insert({id: i, question: q, answers: a});
        }*/
        
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
    Questions.insert({id: i, question: q, answers: a}); 
  });
        
  console.log("finished creating questions");
  }
});

// Publish the collections used on server and client
// (declared in /common/collections.js)
Meteor.publish("logs", function() {
    return Logs.find({}, {limit: 10, sort: {timestamp: -1}});
});
Meteor.publish("players", function() {
    return Players.find({}, {limit: 10, sort: {score: -1, name: 1}});
});
Meteor.publish("quizzes", function() {console.log(Quizzes.find().count())
    return Quizzes.find({}, {//limit: 10,
     sort: {//status: -1,
      name: 1}});
});

//var count = -1;
// Method implementations, called asynchronously from the client
// (for the client, the stubs are declared in /client/methods.js)
Meteor.methods({
  // pick a random question out of the Questions collection/DB
  /*getRandomQuestion: function() {
    var q = Questions.find().fetch();
    //q = _.shuffle(q); return q[0];
    q = _.sample(q); return q;
  },*/
  getquizzes: function(selected) { if (selected) var Quiz = Quizzes.findOne({name: selected})._id; 
    console.log("creating quiz", selected, Quiz);
    var q = Quizzes.find().fetch();
    return q;
  },
  getQuestion: function(playerId) {
  	 var player = Players.findOne(playerId);
    var q = Questions.find().fetch();
    var count = player.count - 1;        
    if (count < _.size(q)) count ++; console.log("count", count);
    Q = q[count]; //_.first(q);        
    return Q;
  },
  getquestions: function() {
    var q = Questions.find().fetch();
    return q;
  },    
  // write the log entry with the name, score and message given,
  // extend with the current timestamp (makes use of momentJS library in the ./lib folder)
  writeLog: function(theName, theScore, theMessage) {
    var dateTimeString = moment().format("YYYY-MM-DD HH:mm:ss");
    var theCount = Players.findOne({name: theName}).count; 
    Logs.insert({timestamp: dateTimeString, name: theName, score: theScore, message: theMessage, count: theCount});
    console.log("%s %s %s (%d)", dateTimeString, theName, theMessage, theScore, theCount);
  },
  // add new player if not exist
  createPlayerIfNotExist: function(username) {
    var player = Players.findOne({name: username});
    var playerId;
    if (!player) {
      var points = 0; var inc = 0;
      playerId = Players.insert({name: username, role: "user", score: points, count: inc}); //console.log(player, playerId, points, inc);
      Meteor.call("writeLog", username, points, inc, "has registered");
    } else {
      playerId = player._id; 
    }
    return playerId;
    //console.log(Players._connection._mongo_livedata_collections.users._docs._map);
  },
  // update the players score
  updateScore: function(playerId, points) {
    Players.update(playerId, {$inc: {score: points}});
  },
  updateCount: function(playerId, inc) {
    Players.update(playerId, {$inc: {count: inc}});
  }
});
