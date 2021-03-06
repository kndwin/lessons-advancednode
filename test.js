tests:
  - text: Register route and display on home
    testString: 
    getUserInput => $.get(getUserInput('url')+ '/_api/server.js')
    .then(data => { 
      assert.match(data, /showRegistration:( |)true/gi, 
        `You should be passing the variable "showRegistration" 
        as true to your render function for the homepage`
      ); 
      assert.match(data, /register[^]*post[^]*findOne[^]*username:( |)req.body.username/gi, 
        `You should have a route accepted a post request on register that querys the db 
        with findone and the query being "username: req.body.username"`
      ); 
    }, xhr => { 
      throw new Error(xhr.statusText); 
    })
  - text: Registering should work
    testString: 
    getUserInput => $.ajax({
      url: getUserInput('url')+ '/register', data: {
        username: 'freeCodeCampTester', 
        password: 'freeCodeCampTester'
      },crossDomain: true, 
      type: 'POST', 
      xhrFields: { withCredentials: true }
    }).then(data => { 
      assert.match(data, /Profile/gi, 
        `I should be able to register and it direct me to my profile. 
        CLEAR YOUR DATABASE if this test fails (each time until its right!)
        `   
      );
    }, xhr => { throw new Error(xhr.statusText); })
  - text: Login should work
    testString: 'getUserInput => $.ajax({url: getUserInput(''url'')+ ''/login'',data: {username: ''freeCodeCampTester'', password: ''freeCodeCampTester''}, type: ''POST'', xhrFields: { withCredentials: true }}) .then(data => { assert.match(data, /Profile/gi, ''Login should work if previous test was done successfully and redirect successfully to the profile. Check your work and clear your DB''); assert.match(data, /freeCodeCampTester/gi, ''The profile should properly display the welcome to the user logged in''); }, xhr => { throw new Error(xhr.statusText); })'
  - text: Logout should work
    testString: 'getUserInput => $.ajax({url: getUserInput(''url'')+ ''/logout'', type: ''GET'', xhrFields: { withCredentials: true }}) .then(data => { assert.match(data, /Home/gi, ''Logout should redirect to home''); }, xhr => { throw new Error(xhr.statusText); })'
  - text: Profile should no longer work after logout
    testString: 'getUserInput => $.ajax({url: getUserInput(''url'')+ ''/profile'', type: ''GET'', crossDomain: true, xhrFields: { withCredentials: true }}) .then(data => { assert.match(data, /Home/gi, ''Profile should redirect to home when we are logged out now again''); }, xhr => { throw new Error(xhr.statusText); })'
