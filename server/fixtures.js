if ( Meteor.users.find().count() === 0 ) {
  Accounts.createUser({
    username: 'admin',
    email: 'lawegard@gmail.com',
    password: 'asdfasdf',
    profile: {
      name: 'admin',
      role: 'admin'
    }
  });
  Players.insert({name: "admin", role: "admin", score: 0, count: 0});
  Quizzes.insert({name: "capitals", description: "geography", author: "admin", status: "published"});
}