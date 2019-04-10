var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
let io = require('socket.io')(http);

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var con = mysql.createConnection({
  host: "10.13.163.141",
  user: "jasonl",
	password: "password",
	database: "project"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM user", function (err, result, fields) {
    if (err) throw err;
		console.log(result);
  });
});

app.post('/test', function(request, response) {
	console.log("test")
});

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;

	if (username && password) {
		con.query('SELECT * FROM user WHERE USERNAME = ? AND PASSWORD = ?', [username, password], function(error, results, fields) {
		if (results.length > 0) {
			console.log(results)
			request.session.loggedin = true;
			request.session.username = username;
			response.redirect('/goHome');
		}
		con.query("SELECT COUNT(*) AS courseCount FROM enrolled WHERE customer_id = ?", [results[0].ID], function(error1, results1, fields1){
			console.log(results1[0].courseCount)
			});
		});
	}
});
			

app.post('/register', function(request, response) {
	var username = request.body.username;
	var email = request.body.email;
	var fname = request.body.firstName;
	var lname = request.body.lastName;
	var password = request.body.password;
	var confirmpassword = request.body.confirmpassword;

	var VALUES = [null, username, password, null, fname, lname, null, email, null];
	var sql = "INSERT INTO user (ID, USERNAME, PASSWORD, CREATED_AT, FIRST_NAME, LAST_NAME, DOB, EMAIL, SCHOOL_ID) VALUES (?)";
	if (username && email && fname && lname && (password === confirmpassword)) {
	con.query(sql, [VALUES], function(error, result) {
		response.redirect('/goLogin');
	});
	} else {
		console.log("Please fill all fields correctly");
	}
});

app.get('/goLogin', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/goHome', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.listen(3000, function() {
	console.log('Server is running on port 3000...');
});
