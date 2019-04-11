var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var userID;
var userType;

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
		con.query('SELECT * FROM user WHERE USERNAME = ? AND PASSWORD = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				console.log("USER INFO");
				console.log(results);
				userID = results[0].ID;
				userType = results[0].TYPE;
				console.log("USER TYPE ------------> " + userType);
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

app.post('/register', function(request, response) {
	var lesson = request.body.lesson;
	var location = request.body.location;
	var rate = request.body.rate;
	var date = request.body.date;
	var duration = request.body.duration;

	var VALUES = [null, username, password, null, fname, lname, null, email, null];
	var sql = "INSERT INTO user (ID, USERNAME, PASSWORD, CREATED_AT, FIRST_NAME, LAST_NAME, DOB, EMAIL, SCHOOL_ID) VALUES (?)";
	if (username && email && fname && lname && (password === confirmpassword)) {
	con.query(sql, [VALUES], function(error, result) {
		response.redirect('/index');
	});
	} else {
		console.log("Please fill all fields correctly");
	}
});

app.post('/createCourse', function(request, response) {
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

app.post('/enroll', function(request, response) {
	sessionID = parseInt(request.body.sessionID);
	var VALUES = [null, userID, sessionID];
  var sql = "INSERT INTO enrolled (ENROLMENT_ID, CUSTOMER_ID, SERVICE_ID) VALUES (?)";
  con.query(sql, [VALUES], function (err, result) {
    if (err) throw err;
    console.log(result);
	});
});

app.get('/countCurrent', function(req, res) {
	var data;
	con.query('SELECT COUNT(*) AS courseCount FROM enrolled WHERE customer_id = ?',[userID], function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}
		data = results1[0].courseCount
		res.send({data})
	});
	
});

app.get('/getRating', function(req, res) {
	var data;
	con.query('SELECT AVG(rating_val) AS avgRating from rating where id = ?;',[userID], function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}
		data = results1[0].avgRating;
		res.send({data})
	});
	
});

app.get('/getCurrentCourses', function(req, res) {
	var data;
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) AS tutorName, c.course_name, c.location, t.rate_hr, c.schedule, c.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN course c ON c.course_id = s.service_id INNER JOIN enrolled e on e.service_id = s.service_id where e.customer_id = ?', [userID], function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getCurrentSeminars', function(req, res) {
	var data;
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) as tutorName, sem.title, v.name, sem.price, sem.datetime, sem.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN seminar sem ON sem.seminar_id = s.service_id INNER JOIN venue v ON sem.venue_id = v.venue_id INNER JOIN enrolled e ON e.service_id = sem.seminar_id WHERE e.customer_id = ?', [userID], function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getCurrentSession', function(req, res) {
	var data;
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) as tutorName, b.topic, b.location, t.rate_hr, b.datetime, b.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN booking b ON b.session_id = s.service_id INNER JOIN enrolled e ON b.session_id = e.service_id WHERE e.customer_id = ?', [userID], function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getAllCourses', function(req, res) {
	var data;
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) as tutorName, c.course_name, c.location, t.rate_hr, c.schedule, c.duration, c.course_id FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN course c ON c.course_id = s.service_id', function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getAllSeminars', function(req, res) {
	var data;
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) as tutorName, sem.title, v.name, sem.price, sem.datetime, sem.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN seminar sem ON sem.seminar_id = s.service_id INNER JOIN venue v ON sem.venue_id = v.venue_id', function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getAllSessions', function(req, res) {
	var data;
	con.query('select concat(u.first_name, " ", u.last_name) as tutorName, b.topic, b.location, t.rate_hr, b.datetime, b.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN booking b ON b.session_id = s.service_id', function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getType', function(req, res) {
	var data = userType;
	console.log("Sending type " + userType);
	res.send({data})
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

app.get('/create', function(request, response) {
	response.sendFile(path.join(__dirname + '/create.html'));
});


app.listen(3000, function() {
	console.log('Server is running on port 3000...');
});
