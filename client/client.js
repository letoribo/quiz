window.log = function() {
  try {
    return console.log.apply(console, arguments);
  } catch (_error) {}
};

// Collection, not db mapped, used only on client
Answers = new Meteor.Collection(null);
ListOfQuestions = new Meteor.Collection(null);
UQuestions = new Meteor.Collection(null);
// Settings for Accounts module
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

/*
 * Autorun methods run whenever their dependencies change
 */
Deps.autorun(function () {	
_resetQuiz = function() { 
    Session.set("created", false); 
    Session.set("selected_quiz", null); 
    Session.set("create", false); Session.set("state", false);
    Session.set("complete", false); //console.log("quiz resetted", Session.get("state"));
    Session.set("selected_qa", null);
    Session.set("publ", null); 
    State = false;
  }
  _resetQuestion = function() {
    Session.set("correct_answer", "x");
    Session.set("selected_answer", "y");
    Session.set("selected_question", null);
  }
  _onCreatePlayerCallback = function(error, playerId) {
    Session.set("playerId", playerId);    
  };
  // user handling (only called when logging in/out)
  if (Meteor.user()) {
  	 Session.set("myBoolean", true);
    var user = Meteor.user();
    $(".container-fluid").show(); $("center").find('img').remove();
    if (user.profile) { 
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
    _resetQuiz();
    log("%cMeteor.user(); ", "color:orange; background:blue; font-size: 16pt", Meteor.user());
    log("%cMeteor.users.find().count(); ", "color:orange; background:blue; font-size: 16pt", Meteor.users.find().count());
    log("%cMeteor.users.find().fetch(); ", "color:orange; background:blue; font-size: 16pt", Meteor.users.find().fetch());         
  } 
  else {
    var surface, ctx, time = 0.0;
    var frameCounter = 0;
    var state = false;
 
    function colorGenerator(value){ 
      Session.set('time', new Date);
      Time = Session.get('time') || new Date;
      sec = Time.getSeconds();
      min = Time.getMinutes();
      hour = Time.getHours();
      coef = 0.016666666666666666*sec;
      if (!_.isUndefined(coef)) {
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
    }

    function draw(){
      requestAnimationFrame(draw, surface);
      var gradient = ctx.createLinearGradient(0, 0, 500, 500);
      ctx.fillStyle = gradient;
      gradient.addColorStop(0, colorGenerator(time) || "black");
      gradient.addColorStop(0.5, colorGenerator(time+0.5) || "white");
      gradient.addColorStop(1, colorGenerator(time) || "black"); 
      ctx.fillRect(0, 0, 500, 500);
      ctx.shadowBlur=20;
      ctx.shadowColor="black";
      if (!_.isUndefined(coef)) {
        ctx.globalAlpha=coef/2;
        var x = surface.width / 2;
        var y = surface.height / 2;
        ctx.font = '30pt Candara'; 
        ctx.textAlign = 'center';
        ctx.fillStyle = colorGenerator(sec);
        ctx.fillText('Welcome to Quiz', x, y);
      }  
      process();
    }
 
    var init = function (){
      surface = document.querySelector('#surface');
      ctx = surface.getContext('2d');
      draw();
    }
    Session.set("playerId", null);
    Session.set("myBoolean", true);

    if (Session.get("myBoolean")) {
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
      isAdmin: function () {
        return status();
      },
      quizzes: function () {
        return Quizzes.find({}, {sort: {timestamp: -1}});
      },
      Uquizzes: function () {
        return Quizzes.find({status:'published'}).fetch();
      },
      create: function () { 
        return Session.get("create");
      },
      created: function () {
        return Session.get("created") ? "Finish" : "Create";
      },
      selected_quiz: function () {
        var quiz = Quizzes.findOne({name: Session.get("selected_quiz")});
        if (quiz)
        return quiz && quiz.name;
      },
      logs: function () {
        return Logs.find().fetch();
      },
      handData: function (){
        Time = Session.get('time') || new Date;
        Sec = Time.getSeconds();
        Min = Time.getMinutes();
        Hour = Time.getHours();
        return {
    	    Hours: Hour,       
          Minutes: Min,      
          Seconds: Sec      
        }
      },
      state: function () {
        return Session.get("state");
      },
      status: function () {
        return Session.get("publ") == "published" ? Session.get("selected_quiz") : null;
      },
      isComplete: function () { if (Session.get("selected_quiz") !== null)
        return Session.get("complete");
      }
    });    
  }
});
 
// subscriptions to published (change-)events from server
Deps.autorun(function () {
  Meteor.subscribe("players");
  Meteor.subscribe("logs");
});

Template.quiz.events({
  'mousedown .destroy': function (event) { event.preventDefault();
    var id = this._id;
    alertify.confirm("Are you sure?", function (e) {
      if (e) {
        Quizzes.remove(id); 
        _resetQuiz();
      }
    });
  },
  'click #Create': function () {
    Session.set("publ",null);
    if (Quizzes.find({name: $('.Name').val()}).count() > 1) {alertify.alert ('There is already "' + $('.Name').val() + '" quiz'); return null;}
    create();
  },
  'click tr.player': function (e) {e.preventDefault(); Session.set("created", false);
    if (this.name == "new" || this.description == "about" || _.isEqual(Session.get("create"), true)) return false;
    if (this.name && this.status) { Session.set("selected_quiz", this.name); 
      _resetQuestion();
      State = State === false ? true: false;
      Session.set("state", State); Session.set("publ", this.status); Session.set("complete", false);
      var selected = Session.get("selected_quiz");
      Meteor.call("getquizzes", selected);
    }
  },
  'keyup .Name': function (e) { Session.set("selected_quiz", e.target.value);
    Quizzes.update(Session.get("ID"), {$set: {name: e.target.value}});
    check();
  },
  'keyup .Description': function (e) { 
    Quizzes.update(Session.get("ID"), {$set: {description: e.target.value}});
    check();
  },
  'keyup': function (e) { 
    e.preventDefault();
    //check for duplicate names
    if (Quizzes.find({name: $('.Name').val()}).count() > 1) {alertify.alert ('There is already "' + $('.Name').val() + '" quiz'); return null;}
    e.keyCode == 13 ? create() : null;
  }
});

var check = function(){
  ($('.Description').val() == "" || $('.Name').val() == "") ? Session.set("created", false) : Session.set("created", true);
}
var create = function() {
  if (_.isEqual($('.Name').val(), "") || _.isEqual($('.Description').val(), "")) return null
  else next();
}	
var next = function() {
  var created = Session.get("created");
  $(":text").val("");
  var _new = Quizzes.find({name: {$in: ["new", ""]}}).fetch();
  if (_.isEmpty(_new)) {
    if (created == true) {Session.set("create", false); Session.set("state", true);}
    else { //if any field is empty
      Quizzes.insert({name: "new", description: "about", status: "unpublished", author: "", questions: [{}]});
      Meteor.defer(function () {
        Session.set("ID", Quizzes.findOne({name: "new"})._id); 
        Session.set("create", true);
        Session.set("selected_quiz", "new");
        Meteor.defer(function () {$('input[type="text"]')[0].focus();});    
      });      
    }
  }
  else{
  	 Session.set("create", true); 
  	 Session.set("ID", Quizzes.findOne({name: {$in: ["new", ""]}})._id);
    Meteor.defer(function () {
      $('input[type="text"]').eq(0).focus();
    });
  }
}

// event when user select the next question
Template.questions.events({
  // get next question from server
  'click .nextQuestion': function () {
    // first reset the session values
    _resetQuestion();
    var selected = Session.get("selected_quiz");
    var count = Logs.find({quiz: selected, name: username}).count();
    //console.log("quiz.count ", count);
    if (!_.isNull(Template.kitchen.questions())) Session.set("selected_qa", Template.kitchen.questions()[count]);
    if (!_.isNull(Template.UKitchen.Uquestions())) Session.set("selected_qa", Template.UKitchen.Uquestions()[count])
    if (selected !== "new" && !_.isNull(selected) && Quizzes.findOne({name: selected}).status == "published") {
      // now get the question from the server asynchronous
      Meteor.call("getQuestion", Session.get("yourID"), selected, _onQuestionReceive);
      var inc = 1; Meteor.call("updateCount", Session.get("playerId"), inc);
    } else {alertify.set({ delay: 3000 }); alertify.error('Select a "published" quiz');}
    return false;
  }
});

// callback for receiving a new question
_onQuestionReceive = function(error, question) {
  //console.log("got question: %o", question);
  if (_.isUndefined(question)) {Session.set("complete", true);}
  // determine the correct answer and shuffle the answers
  else{
    var theAnswers = question["answers"];
    var correct = theAnswers[0];
    theAnswers = _.shuffle(theAnswers);
    question["answers"] = theAnswers;
    // update the values in the session for reactive computation
    Session.set("selected_question", question);
    Session.set("correct_answer", correct);
    Session.set("selected_answer", "");
    // fill the answer-collection with the possible answers
    Answers.remove({});
    _.each(theAnswers, function(n, i) {
      Answers.insert({label: String.fromCharCode(65 + i), text: n });
    });
  }
};

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
    //console.log("chosen answer: %o", this);
    var selected = Session.get("selected_quiz");
    var correct = Session.get("correct_answer");
    var points = -5;
    var message = "was wrong"
    if (this.text === correct) {
      points = 10;
      message = "answered right"
    }
	 // update score of player
    Meteor.call("updateScore", Session.get("playerId"), points);
	 // write it in the activity log
    Meteor.call("writeLog", username, points, message, selected);
    Session.set("selected_answer", this.text)
    return false;
  }
});
var status = function(){
  var player = Players.findOne(Session.get("yourID")) || "";
  var isAdmin = _.isEqual(player.role, "admin")
  return isAdmin;
}
/*
 * Template functions for ranking and players
 */
Template.ranking.helpers({
  rendered: function(){
    if(Logs.find({name: username}).count() < 2) {
    	alertify.set({ delay: 20000 }); alertify.log(
        "There are two types of rights: user and admin. User can view quizzes and fill them. Admin can what can user, but he can also create new quizzes. Registered user receives user rights. The administrator can make other users admins."
      );
    }
  },
  players: function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  },
  isAdmin: function () {
    return status();
  },
  makeAdmin: function () {
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
  'click': function () {
    Session.set("selected_player", this._id);
  },
  'mouseover': function () {
    Session.set("selected_role", this._role);
  }
});

Template.kitchen.events({
  'click #Add': function (event) { event.preventDefault(); Add();    
  },
  'click #Publish': function () {
    var warning = function () {
    	alertify.alert("At least 4 questions to be published!"); return null;
    }  	 
    _.size(this.questions) > 4 ? Quizzes.update(this._id, {$set: {status: "published", author: username}}) : warning();
    Meteor.defer(function () {
      Session.set("publ", "published");
      Session.set("state", false);
    });
  }
});

var Add  = function() {
  $('input[type="text"]').eq(0).focus();
  if ($('input[type="text"]').eq(0).val() == "" || $('input[type="text"]').eq(1).val() == "") return false;
  Session.set("inc", inc++);
  var update = Quizzes.findOne({name: Session.get("selected_quiz")});
  Session.set("keyup_q", null); Session.set("keyup_a", null);
  Quizzes.update(update._id,{$push:{questions:{question: $('.Question').val(), answer: $('.Answer').val()}}});  	 
  $(".Question, .Answer").val("");
}

Template.kitchen.helpers({	
  selected: function () {
    var selected = Quizzes.findOne({name: Session.get("selected_quiz")});
    return Session.equals("selected_quiz", this.name) ? "warning" : '';
  },
  Selected: function () {
	 return Session.get("state");
  },
  questions: function () {
    var selected = Session.get("selected_quiz");
    var sel = Quizzes.findOne({name: selected});
    if (_.isUndefined(sel)) return null; 
    var author = sel.author;
    var status = sel.status;
    var questions = _.map(sel.questions, function(num, key){ num.label = key; num.author = author; num.status = status; return num });
    return _.isEqual(selected, "capitals") || _.isEqual(status, "unpublished") ? _.map(sel.questions, function(num, key){ num.label = key + 1; num.author = author; num.status = status; return num }) : _.rest(questions);
  },
  statusIs: function(status) {
    return this.status === status;
  },
  stat: function () {
	  return "unpublished";
  },
  authorIs: function(author) {
    return this.author === author;
  },
  auth: function () {
	  return username;
  },
  nameIs: function(name) {
    return this.name === name;
  },
  Sel_name: function () {
    return Session.get("selected_quiz");
  },
  keyup_q: function () {
    return Session.get("keyup_q");
  },
  keyup_a: function () {
    return Session.get("keyup_a");
  },
  button: function () {
    return this.status == "published" ? "Close" : "Publish";
  }
});	

var inc = 0;
Template.que.events({
  'keyup .Question': function (e) {
    var q = e.target.value;
    Session.set("keyup_q", q);
  },
  'keyup .Answer': function (e) {var a = e.target.value; 
     Session.set("keyup_a", a);
  },  
  'click': function () {
    Session.set("selected_qa", this); log("clicked ", Session.get("selected_qa"));
  },
  'keyup': function (e) { 
    e.preventDefault(); 
    e.keyCode == 13 ? Add() : null;
  }
});

Template.que.helpers({ 
  rendered: function(){
    $('input[type="text"]').eq(0).focus();
  }, 
  selected_q: function () {
    return _.isUndefined(this.question);
  },
  selected_a: function () {
    return _.isUndefined(this.answer);
  },
  questionIs: function(question) {
    return this.question === question;
  },
  Sel_question: function () { if(Session.get("selected_qa")) 
    return Session.get("selected_qa").question;
  },
  auth: function () {
	  return _.isEqual(this.author, username);
  },
  isUnpublished: function(status) {
    return this.status === "unpublished";
  }
});

Template.list.helpers({ 
  questionIs: function(question) {
    return this.question === question;
  },
  Sel_question: function () { if(Session.get("selected_qa")) 
    return Session.get("selected_qa").question;
  }
});
Template.list.events({  
  'click': function () {
    Session.set("selected_qa", this); log("clicked ", Session.get("selected_qa"));
  }
});

Template.chart.events({ 
  'click #CloseChart': function () { Meteor.call("resetCount", Session.get("playerId"));
  _resetQuiz();
 }
});
Template.chart.helpers({ 
  rendered: function(){Session.set("state", false);
    return !_.isUndefined(Logs.findOne({quiz: Session.get("selected_quiz")})) ? chart() : null; 
  },
  data: function () {
    var logdata = Logs.findOne({name: username});
    return {
    	nickname: logdata.name,
      resultOf: Session.get("selected_quiz")
    };
  },
  participants: function () {
  	 var inLogs = Logs.find({quiz: Session.get("selected_quiz")}).fetch();
    var arr = []; _.each(inLogs, function (n, i) { return arr.push(n.name)});
    participants = _.map(_.uniq(arr), function(n){ return {"name": n}; }); 
    return participants;
  }
});

var chart = function (){
  _.each(participants, function (n, i) {
    var selected = Session.get("selected_quiz");
    var Name = n.name;
    var wrong = Logs.find({name: Name, quiz: selected, message: "was wrong"}).count();
    var right = Logs.find({name: Name, quiz: selected, message: "answered right"}).count();   
    var data = [
      {
      value: wrong, color:"#F7464A", highlight: "#FF5A5E", label: "Was wrong"
      },
      {
      value: right, color: "#46BFBD", highlight: "#5AD3D1", label: "Was right"
      },
      {
      value: _.size(Template.kitchen.questions() || Template.Kitchen.Uquestions()) - wrong - right,
      color: "#AFC5C3",
      highlight: "#BFCFCC",
      label: "Still not answered"
    }
    ]    

    var options = {
      segmentShowStroke : true,
      segmentStrokeColor : "#fff",
      segmentStrokeWidth : 2,
      percentageInnerCutout : 50,
      animationSteps : 50,
      animationEasing : "easeOutQuart",
      animateRotate : true,
      animateScale : true
    };

    var d = $('#' + Name);
    var dt = d.get(0).getContext('2d');
    new Chart(dt).Doughnut(data, options);  	 
  })
}

Template.UKitchen.helpers({
  selected: function () {
    var selected = Quizzes.findOne({name: Session.get("selected_quiz")});
    return Session.equals("selected_quiz", this.name) ? "warning" : '';
  },
  Selected: function () {
	 return Session.get("state");
  },
  Uquestions: function () {
    var selected = Session.get("selected_quiz"); 
    Meteor.call("getquizzes", selected);
    var sel = Quizzes.findOne({name: selected});
    if (_.isUndefined(sel)) return null;
    return selected == "capitals" ? _.map(sel.questions, function(num, key){num.label = key + 1; return num}) : _.map(_.rest(sel.questions), function(num, key){num.label = key + 1; return num});
  },
  nameIs: function(name) {
    return this.name === name;
  },
  Sel_name: function () {
    return Session.get("selected_quiz");
  }
});

Template.UKitchen.events({
  'click': function () {
    Meteor.call("getquestions", _onUQ);
  }
});
_onUQ = function(error, q) {
  //console.log("got Questions: %o", q);
  if (UQuestions.find().count() == 0)
  _.each(q, function(n, i) {
    UQuestions.insert({label: i + 1, question: n.question });
  });
};

/*
 * Template functions for activity log
 */
Template.activities.logs = function () {
  return Logs.find({}, {limit: 10, sort: {timestamp: -1}});
};

Template.logentry.isError = function() {
  return (this.score > 0) ? "success" : "error";
};
  
UI.body.events({
  'mouseover img': function() { 
    function myFunction() {
      wd = Math.floor((Math.random() * ($(window).width() - $("img").width())));
      hg = Math.floor((Math.random() * (0.5 * $(window).width() - $("img").height())));
      $("html").css({'background-color': 'rgb(' + wd%32 + ', ' + hg%32 + ', ' + _.sample(_.range(0,33)) + ')'});      
    }
    myFunction();
    $('img').parent().css({position: 'relative'});
    $("img").css({"top": hg + "px", "left": wd + "px", position:'absolute', transform: 'scaleY(-1)'});
  },
  'mouseout img': function() {
  	 $("img").css({transform: 'scaleY(1)'});
  }
});
