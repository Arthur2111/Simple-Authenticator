const mysql = require('mysql');
const express = require("express");
const session = require('express-session');
const path = require('path');
const app = express();

//the session data is stored on the database. Hence, it can accommodate larger amounts of data. To access data from the server-side, a session is authenticated with a secret key or a session id that we get from the cookie on every request.
app.use(session({
	secret: 'secret123',
	resave: true,
	saveUninitialized: true
}));

//use sessions to determine if user is logged in or not
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

//connection to database
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'nodelogin'
});


// http://localhost:3000/
app.get('/', (req,res) => {
	// Render login template
	res.sendFile(path.join(__dirname + '/views/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', (req,res) => {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				// Redirect to home page
				res.redirect('/home');
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

const PORT= process.env.PORT || 5050
app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`)
});