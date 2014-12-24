// Collection, not db mapped, used only on client
Answers = new Meteor.Collection(null);
ListOfQuestions = new Meteor.Collection(null);
UQuestions = new Meteor.Collection(null);
window.log = function() {
  try {
    return console.log.apply(console, arguments);
  } catch (_error) {}
};

// Settings for Accounts module
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

/*
 * Autorun methods run whenever their dependencies change
 */
Deps.autorun(function () { //log(Blaze);
  // user handling (only called when logging in/out)
  if (Meteor.user()) {
  	 Session.set("myBoolean", true);
    var user = Meteor.user();
    freq = 10000; //clearInterval(Interval);
    $(".container-fluid").show(); $("center").find('img').remove();
    if (user.profile) { 
      //console.log(user.profile);
      username = user.profile.name == "" ? user.services.github.username : user.profile.name;
      Meteor.defer(function () {
        $( "#login-name-link" ).text( username + "▾");
      });
    } 
    else { 
      username = user.username;
    }
    log("user logged in: " + username); Session.set("state", false);        
    Meteor.call("createPlayerIfNotExist", username, _onCreatePlayerCallback);
    _resetQuestion();
    console.log("%cMeteor.user(); ", "color:orange; background:blue; font-size: 16pt", Meteor.user());
    console.log("%cMeteor.users.find().count(); ", "color:orange; background:blue; font-size: 16pt", Meteor.users.find().count());
    console.log("%cMeteor.users.find().fetch(); ", "color:orange; background:blue; font-size: 16pt", Meteor.users.find().fetch());         
  } 
  else {
    var surface, ctx, time = 0.0;
    var frameCounter = 0;
    var state = false;
 
    function colorGenerator(value){ 
      freq = 1000;//intervalArray = [];
      timer = function(){
        Session.set('time', new Date);
        Time = Session.get('time') || new Date;
        sec = Time.getSeconds();
        min = Time.getMinutes();
        hour = Time.getHours();
        coef = 0.016666666666666666*sec;
        //intervalArrayPosition = intervalArray.push(Interval) - 1;
      }  //console.log(sec, min, hour)
   
      Interval = setInterval(timer, freq); //console.log(Interval); 
      if (typeof coef !== "undefined") {
	     var r = Math.round((Math.sin(value*coef*Math.PI)+1.0)*127.5);
        var g = Math.round((Math.cos((value+0.33)*coef*Math.PI)+1.0)*127.5);
        var b = Math.round((Math.sin((value+0.66)*coef*Math.PI)+1.0)*127.5);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + _.sample([0.3,0.4,0.5,0.6,0.7,0.8,0.9]) + ')';
      }
    }
 
    function process(){ 
      var fonts = [
        'Arial','Arial Black','Arial Narrow','Calibri','Candara','Franklin Gothic Medium','Helvetica',
        'Impact','Segoe UI','Tahoma','Trebuchet MS','Verdana','Cambria','Georgia','Consolas','Courier New','Lucida Console'
      ];
      if (state == false){
        frameCounter += 1;
        if (frameCounter == 45){
          frameCounter = 0;
          state = true;
        }
      }
 
      else {
        frameCounter += 1;
        time += 0.125;
    	  $("h1.hero-unit").css({color: colorGenerator(_.sample(_.range(10, 60))), 'font-family': _.sample(fonts), 'text-shadow': '2px 2px #FF0000'})
        if (frameCounter == 5){
          frameCounter = 0;
          state = false;
        }
      }
    //log(frameCounter, time);
    }

    function draw(){
      requestAnimationFrame(draw, surface);
      var gradient = ctx.createLinearGradient(0, 0, 500, 500);
      ctx.fillStyle = gradient;
      //console.log(colorGenerator(time));
      gradient.addColorStop(0, colorGenerator(time) || "black");
      gradient.addColorStop(0.5, colorGenerator(time+0.5) || "white");
      gradient.addColorStop(1, colorGenerator(time) || "black"); 
      ctx.fillRect(0, 0, 500, 500);
      ctx.shadowBlur=20;
      ctx.shadowColor="black";
      if (typeof coef !== "undefined") {
        ctx.globalAlpha=coef/2;
        var x = surface.width / 2;
        var y = surface.height / 2;
  
        ctx.font = '30pt Candara'; 
        ctx.textAlign = 'center';
        ctx.fillStyle = colorGenerator(sec); //'#A467CC';
        ctx.fillText('Welcome to Quiz', x, y);
      }  
      process();
    }
 
    var init = function (){
      surface = document.querySelector('#surface');
      ctx = surface.getContext('2d'); //log(ctx);
      draw(); //log("draw canvas");  
    }
    Session.set("playerId", null);
    Session.set("myBoolean", true);

    if (Session.get("myBoolean")) {
      //setTimeout(init(), 0);
      //log(Session.get("myBoolean"));
      //log(document.body);
      if (document.body) {
        $(".container-fluid").hide();
        var img = "<img src='bug.png'>";
        $(img).appendTo("center");
      }
    }  

    Template.quiz.helpers({
    	rendered: function(){
        init();
      }, 
      isAdmin: function () { //log(Session.get("yourID"));
        return status();
      },
      quizzes: function () {
        return Quizzes.find({}, {sort: { name: 1}});
      },
      Uquizzes: function () {
        return Quizzes.findOne({status: "published"}); //Session.get("selected_quiz")});
      },
      create: function () {
        return Session.get("create");
      },
      created: function () {
        return Session.get("created");
      },
      selected_quiz: function () {
        var selected = Session.get("selected_quiz"); Meteor.call("getquizzes", selected, _onQuizzes);
        var quiz = Quizzes.findOne({name: Session.get("selected_quiz")});
        if (quiz)
        return quiz && quiz.name;
      },
      items: function() {
        return Quizzes.find();
      }
    });
  }

/*Template.article.helpers({  
  statusIs: function(status) {
    return this.status === status;
  }
});*/
  
  _onCreatePlayerCallback = function(error, playerId) {
  Session.set("playerId", playerId);    
};

});
 
// subscriptions to published (change-)events from server
Deps.autorun(function () {
  Meteor.subscribe("players");
  Meteor.subscribe("logs");
});

Template.quiz.events({
  'click .nextQuestion': function () { //log(this, this.name);
    Session.set("created", false);
    //var state = Session.get("create") === false ? true: false; 
    var state = !Session.get("created");
    //log(state, Session.get("created")); 
    
    $(".Name, .Description").val("");
    var _new = Quizzes.findOne({name: "new"});
    if (! _new && state == true) {
      Quizzes.insert({name: "new", description: "about", status: "unpublished"});
      Meteor.defer(function () {
        Session.set("ID", Quizzes.findOne({name: "new"})._id); //var selected = "new"; Meteor.call("getquizzes", selected, _onQuizzes);
      });      
    }

    log(//state, Session.get("created"),
     Session.get("ID"));
    Session.set("create", state);
    
  },
  'click tr.player': function (e) { //console.log(this, e.target);
    if (this.status) { Session.set("selected_quiz", this.name);}
  },
  'keyup .Name': function (e) {
    //log(e.target.value); //log(Session.get("ID"));
    Quizzes.update(Session.get("ID"), {$set: {name: e.target.value}});
    check();
    //log(Quizzes.findOne({name: e.target.value}));
  },
  'keyup .Description': function (e) { 
    //log(Session.get("ID"));
    Quizzes.update(Session.get("ID"), {$set: {description: e.target.value}});
    check();
    //log(Quizzes.findOne({description: e.target.value}));
  }
});

var check = function(){
  ($('.Description').val() == "" || $('.Name').val() == "") ? Session.set("created", false) : Session.set("created", true);
}

// event when user select the next question
Template.questions.events({
  // get next question (random, from server)
  'click .nextQuestion': function (a) {
    // first reset the session values
    _resetQuestion();
    // now get the question from the server asynchronous
    //Meteor.call("getRandomQuestion", _onQuestionReceive);
    
    Meteor.call("getQuestion", Session.get("yourID"), _onQuestionReceive);
    return false;
  }
});

// callback for receiving a new random question
_onQuestionReceive = function(error, question) {
  console.log("got question: %o", question);
  if (question) { console.log(question);
	 // determine the correct answer and shuffle the answers
    var theAnswers = question["answers"];
    var correct = theAnswers[0];
    theAnswers = _.shuffle(theAnswers);
    question["answers"] = theAnswers;
  }
  // update the values in the session for reactive computation
  Session.set("selected_question", question);
  Session.set("correct_answer", correct);
  Session.set("selected_answer", "");

  // fill the answer-collection with the possible answers
  Answers.remove({});
  _.each(theAnswers, function(n, i) {
    Answers.insert({label: String.fromCharCode(65 + i), text: n });
  });
};

_resetQuestion = function() {
  Session.set("correct_answer", "x");
  Session.set("selected_answer", "y");
  Session.set("selected_question", null);
}

_resetQuiz = function() {////////////////////////////////////////
  Session.set("selected_quiz", null);
}
// Template functions for the questions
Template.questions.helpers({
  questionSelected: function () {
    return Session.get("selected_question");
  },
  answerSelected: function () {
    return Session.get("selected_answer");
 },
answerChosen: function () {
  return Session.get("selected_answer") === Session.get("correct_answer");
}
});
Template.question.helpers({
	questionSelected: function () {
  return Session.get("selected_question");
},
  answers: function () {
  return Answers.find();
}
});
// event when user clicks on an answer
Template.answer.events({
  'click .answer': function () {
    console.log("chosen answer: %o", this);
    var correct = Session.get("correct_answer");
    var points = -5; var inc = 1;
    var message = "was wrong"

    if (this.text === correct) {
      points = 10;
      message = "answered right"
    }

	 // update score of player
	 console.log("%s; score: %d", message, points);
    Meteor.call("updateScore", Session.get("playerId"), points);
    Meteor.call("updateCount", Session.get("playerId"), inc);
	 // write it in the activity log
    Meteor.call("writeLog", username, points, message);

    Session.set("selected_answer", this.text)
    return false;
  }
});
var status = function(){
  var player = Players.findOne(Session.get("yourID")) || "";
  //console.log(_.isEqual(player.role, "admin"));
  var isAdmin = _.isEqual(player.role, "admin")
  return isAdmin;
}
/*
 * Template functions for ranking and players
 */
Template.ranking.helpers({
  players: function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  },
  isAdmin: function () { //console.log(Session.get("yourID"));
    return status();
  },
  makeAdmin: function () {
  	 /*var users = Players.find({role:'user'}).fetch();
    var usersExist = _.isEqual(Session.get("selected_role"), "user"); console.log(usersExist);*/
    return Players.find({role:'user'}).fetch();
  },
  selected_name: function () {
    var player = Players.findOne(Session.get("selected_player"));
    if (player && player.role == "user")
    return player && 
    player.name;
  }
}); 	

Template.ranking.events({
  'click input': function () {
    Players.update(Session.get("selected_player"), {$set: {role: "admin"}});
  }
});
Template.player.selected = function () { 
    var currentPlayer = Session.equals("playerId", this._id); 
    if (currentPlayer == true) {Session.set("yourID", this._id)}
    var equals = Session.equals("playerId", this._id);
    Session.set("currentPlayer", equals);
    return equals ? "warning" : "";
  };	

Template.player.events({
  'click': function () { log("clicked " + this.role);
    Session.set("selected_player", this._id);
    //console.log(Session.get("selected_player"));
  },
  'mouseover': function () { //console.log("hover " + this.role);
    Session.set("selected_role", this._role);
  }
});

Session.set("selected_quiz", null); Session.set("state", false); var state = false; Session.set("create", false);
Template.kitchen.events({
  'click': function () {
    Meteor.call("getquestions", _onQReceive);
    if (this.name) { //console.log(this.name == Session.get("selected_quiz"))
    	 // Session.set("selected_quiz", this.name); 
    	 state = state === false ? true: false; log(state, this.name);
      Session.set("state", state);    	  
    }  
  }
});
_onQReceive = function(error, q) { if (ListOfQuestions.find().count() == 0)
  //console.log("got Questions: %o", q);
  _.each(q, function(n, i) {//console.log(n, i);
    ListOfQuestions.insert({label: i + 1, question: n.question, answer: n.answers[0] });
  });
};
_onQuizzes = function(error, q) { /*if (ListOfQuestions.find().count() == 0)
  _.each(q, function(n, i) {//console.log(n, i);
    ListOfQuestions.insert({label: i + 1, question: n.question, answer: n.answers[0] });
  });*/
  //if (q) 
  console.log("got Quizzes: ", q);
};

Template.kitchen.helpers({
  selected: function () { //console.log(Session.get("selected_quiz"), this.name);
    var selected = Quizzes.findOne({name: Session.get("selected_quiz")});
    return Session.equals("selected_quiz", this.name) ? "warning" : '';
  },
  Selected: function () {
	  return Session.get("state");
  },
  questions: function () { //console.log(ListOfQuestions.find());
    return ListOfQuestions.find();
  },
  /*quizSelected: function () { console.log(Session.get("selected_quiz"));
    return Session.equals("selected_quiz", this.name);
  },*/
  statusIs: function(status) {
    return this.status === status;
  }
});	


Template.UKitchen.helpers({
  selected: function () { //console.log(Session.get("selected_quiz"), this.name);
    var selected = Quizzes.findOne({name: Session.get("selected_quiz")});
    //log(Session.get("selected_quiz"), this.name);
    return Session.equals("selected_quiz", this.name) ? "warning" : '';
  },
  Selected: function () {
	 return Session.get("state");
  },
  Uquestions: function () { //console.log(ListOfQuestions.find());
    return UQuestions.find();
  }
});

Template.UKitchen.events({
  'click': function () {
    //console.log("clicked " + this.name);
    Meteor.call("getquestions", _onUQ);
    //Session.set("selected_quiz", this.name);
    if (this.name) {
      //console.log(this.name); 
      state = state === false ? true: false; //log(state, this.name);
      Session.set("state", state);
    }
  }
});
_onUQ = function(error, q) {
  //console.log("got Questions: %o", q);
  if (UQuestions.find().count() == 0)
  _.each(q, function(n, i) {//console.log(n, i);
    UQuestions.insert({label: i + 1, question: n.question });
  });
};

/*
 * Template functions for activity log
 */
Template.activities.logs = function () {
  return Logs.find({}, {sort: {timestamp: -1}});
};

Template.logentry.isError = function() {
  return (this.score > 0) ? "success" : "error";
};
  
UI.body.events({
  'mouseover img': function() { 
    function myFunction() {
      wd = Math.floor((Math.random() * ($(window).width() - $("img").width())));
      hg = Math.floor((Math.random() * (0.5 * $(window).width() - $("img").height())));
      console.log(wd, hg); $("html").css({'background-color': 'rgb(' + wd%32 + ', ' + hg%32 + ', ' + _.sample(_.range(0,33)) + ')'});      
    }
    myFunction();
    $('img').parent().css({position: 'relative'});
    $("img").css({"top": hg + "px", "left": wd + "px", position:'absolute', transform: 'scaleY(-1)'});
  },
  'mouseout img': function() {
  	 $("img").css({transform: 'scaleY(1)'});
  }
});