var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var userID;

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "./public/")));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var con = mysql.createConnection({
  host: "10.13.170.110",
  user: "jasonl",
	password: "password",
	database: "project",
	
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM user", function (err, result, fields) {
    if (err) throw err;
		
  });
});

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;

	if (username && password) {
		con.query('SELECT ID FROM user WHERE USERNAME = ? AND PASSWORD = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				console.log("USER INFO");
				console.log(results[0].ID);
				userID = results[0].ID;
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/index');
			}
		
	
			response.end();
		});
	} else {
		response.end();
	}
});

app.post('/test', function(request, response) {
	var username = request.body.username;
	var email = request.body.email;
	var fname = request.body.firstName;
	var lname = request.body.lastName;
	var password = request.body.password;
	var confirmpassword = request.body.confirmpassword;

	var VALUES = [null, username, password, Date.now(), fname, lname, null, email, null];
	var sql = "INSERT INTO customers (ID, USERNAME, PASSWORD, CREATED_AT, FIRST_NAME, LAST_NAME, DOB, EMAIL, SCHOOL_ID) VALUES ('99999', 'TESTUSER', 'password', '2019-04-09T19:46:08.000Z', 'TESTUSER', 'TESTUSER', '1996-01-01T07:00:00.000Z', 'test@gmail.com, '9999')";
	con.query(sql, function(error, result) {
		console.log(result);
	});
});

app.post('/register', function(err) {
  if (err) throw err;
  var sql = "INSERT INTO user (ID, USERNAME, PASSWORD, CREATED_AT, FIRST_NAME, LAST_NAME, DOB, EMAIL, SCHOOL_ID, TYPE) VALUES ('99999', 'TESTUSER', 'password', '2019-04-09T19:46:08.000Z', 'TESTUSER', 'TESTUSER', '1996-01-01T07:00:00.000Z', 'test@gmail.com, '9999', 'T')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});

app.get('/countCurrent', function(req, res) {
	var data;
	con.query('SELECT COUNT(*) AS courseCount FROM enrolled WHERE customer_id = ?',[userID], function(error1, results1, fields1){
		if (error1) {
			console.log("THERE IS AN ERROR");
			console.log(error1);
		}
		data = results1[0].courseCount
		console.log(data);
		res.send({data})
	});
	
});

app.get('/getRating', function(req, res) {
	var data;
	con.query('SELECT AVG(rating_val) AS avgRating from rating where id = ?;',[userID], function(error1, results1, fields1){
		if (error1) {
			console.log("THERE IS AN ERROR");
			console.log(error1);
		}
		console.log("AVG RATING VVVVVV");
		console.log(results1[0]);
		data = results1([0]);
		res.send({data})
	});
	
});

app.get('/getCurrentCourses', function(req, res) {
	var data;
	console.log(userID);
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name), c.course_name, c.location, t.rate_hr, c.schedule FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN course c ON c.course_id = s.service_id INNER JOIN enrolled e on e.service_id = s.service_id where e.customer_id = ?', [userID], function(error1, results1, fields1){
		if (error1) {
			console.log("THERE IS AN ERROR");
			console.log(error1);
		}
		console.log("HI DANNY");
		console.log(results1);
		data = results1;
		console.log(data);
		res.send({data})
	});
});

app.get('/goLogin', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/index', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/available', function(request, response) {
	response.sendFile(path.join(__dirname + '/available.html'));
});

app.get('/previous', function(request, response) {
	response.sendFile(path.join(__dirname + '/previous.html'));
});

app.get('/logout', function(request, response) {
	response.sendFile(path.join(__dirname + '/'));
});

app.listen(3000, function() {
	console.log('Server is running on port 3000...');
});
