var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var userID;
var userType;
var sid;

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
				userID = results[0].ID;
				userType = results[0].TYPE;
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/index');
			} else {
				response.redirect('/goLogin');
			}
		});
	} else {
		response.redirect('/goLogin');
	}
});

app.post('/delete', function(request, response) {
	sessionID = parseInt(request.body.sessionID);
	var VALUES = [userID, sessionID];
	console.log(VALUES);
  con.query('delete from enrolled WHERE CUSTOMER_ID = ? and SERVICE_ID = ?', [userID, sessionID], function (err, result) {
    if (err) throw err;
    console.log(result);
	});
});

app.post('/createCourse', function(request, response) {
	console.log("creating course");
	var lesson = request.body.lesson;
	var location = request.body.location;
	var date = request.body.date;
	var duration = request.body.duration;
	//Generate new course ID
	var VALUES1 = [null, userID];
	var sql1 = "INSERT INTO services (SERVICE_ID, tutor_id) VALUES (?)";
	con.query(sql1, [VALUES1], function(error, result) {
		console.log("ID generated")
		});
	var sql2 = "select service_id from services group by service_id order by service_id desc limit 1;";
	con.query(sql2, function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}
		else{
		sid = results1[0].service_id;
		console.log(sid);
		}
		
	});
	
	var VALUES = [sid,lesson, date, location, duration];
	var sql = "INSERT INTO course (COURSE_ID, COURSE_NAME, SCHEDULE, LOCATION, duration) VALUES (?)";
	
	if (lesson && location && date && duration){
		con.query(sql, [VALUES], function(error, result) {
		console.log(lesson + " added")
		response.redirect('/index');
		});
	}else {
	console.log("Please fill all fields correctly");
	}
});

app.post('/createSession', function(request, response) {
	console.log("creating session");
	var lesson = request.body.lesson;
	var location = request.body.location;
	var date = request.body.date;
	var duration = request.body.duration;

	var VALUES = [null, lesson, date, location, duration];
	var sql = "INSERT INTO booking (SESSION_ID, TOPIC, datetime, LOCATION, duration) VALUES (?)";
	
	if (lesson && location && date && duration){
		con.query(sql, [VALUES], function(error, result) {
		console.log(lesson + " added")
		response.redirect('/index');
		});
	}else {
	console.log("Please fill all fields correctly");
	}
});

app.post('/createSeminar', function(request, response) {
	console.log("creating course");
	var lesson = request.body.lesson;
	//var location = request.body.location;
	var price = request.body.price;
	var date = request.body.date;
	var duration = request.body.duration;
	
	var VALUES = [null, lesson, price, location, duration];
	var sql = "INSERT INTO seminar (SEMINAR_ID, TITLE, PRICE, VENUE_ID, datetime, duration) VALUES (?)";
	
	if (lesson && location && date && duration){
		con.query(sql, [VALUES], function(error, result) {
		console.log(lesson + " added")
		response.redirect('/index');
		});
	}else {
	console.log("Please fill all fields correctly");
	}
});

app.post('/register', function(request, response) {
	var username = request.body.username;
	var email = request.body.email;
	var fname = request.body.firstName;
	var lname = request.body.lastName;
	var password = request.body.password;
	var confirmpassword = request.body.confirmpassword;
	var birthday = request.body.bday;
	var type = request.body.type;
	if (type === "on") {
		type = "T";
	} else {
		type = "C";
	}

	var VALUES = [null, username, password, null, fname, lname, birthday, email, null, type];
	var sql = "INSERT INTO user (ID, USERNAME, PASSWORD, CREATED_AT, FIRST_NAME, LAST_NAME, DOB, EMAIL, SCHOOL_ID, TYPE) VALUES (?)";
	if (username && email && fname && lname && birthday && type && (password === confirmpassword)) {
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

app.post('/enrollSeminar', function(request, response) {
	sessionID = parseInt(request.body.sessionID);
	var VALUES = [null, userID, sessionID];
  var sql = "INSERT INTO enrolled (ENROLMENT_ID, CUSTOMER_ID, SERVICE_ID) VALUES (?)";
  con.query(sql, [VALUES], function (err, result) {
    if (err) throw err;
    console.log(result);
	});
});

app.post('/enrollSession', function(request, response) {
	sessionID = parseInt(request.body.sessionID);
	var VALUES = [null, userID, sessionID];
  var sql = "INSERT INTO enrolled (ENROLMENT_ID, CUSTOMER_ID, SERVICE_ID) VALUES (?)";
  con.query(sql, [VALUES], function (err, result) {
    if (err) throw err;
    console.log(result);
	});
});

app.post('/delete', function(request, response) {
	sessionID = parseInt(request.body.sessionID);
	var VALUES = [null, userID, sessionID];
  var sql = "DELETE FROM ENROLLED WHERE CUSTOMER_ID = ? AND SERVICE_ID = ?";
  con.query(sql, [VALUES], function (err, result) {
    if (err) throw err;
    console.log(result);
	});
});

app.get('/countCurrent', function(req, res) {
	var data;
	con.query('SELECT * FROM enrolled WHERE customer_id = ?',[userID], function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}
		data = results1
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
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) AS tutorName, c.course_name, c.location, c.course_id, t.rate_hr, c.schedule, c.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN course c ON c.course_id = s.service_id INNER JOIN enrolled e on e.service_id = s.service_id where e.customer_id = ?', [userID], function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getCurrentSeminars', function(req, res) {
	var data;
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) as tutorName, sem.title, v.name, sem.price, sem.datetime, sem.seminar_id, sem.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN seminar sem ON sem.seminar_id = s.service_id INNER JOIN venue v ON sem.venue_id = v.venue_id INNER JOIN enrolled e ON e.service_id = sem.seminar_id WHERE e.customer_id = ?', [userID], function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getCurrentSession', function(req, res) {
	var data;
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) as tutorName, b.topic, b.location, b.session_id, t.rate_hr, b.datetime, b.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN booking b ON b.session_id = s.service_id INNER JOIN enrolled e ON b.session_id = e.service_id WHERE e.customer_id = ?', [userID], function(error1, results1, fields1){
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
	con.query('SELECT CONCAT(u.first_name, " ", u.last_name) as tutorName, sem.title, v.name, sem.price, sem.datetime, sem.seminar_id, sem.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN seminar sem ON sem.seminar_id = s.service_id INNER JOIN venue v ON sem.venue_id = v.venue_id', function(error1, results1, fields1){
		if (error1) {
			console.log(error1);
		}	
		data = results1;
		res.send({data})
	});
});

app.get('/getAllSessions', function(req, res) {
	var data;
	con.query('select concat(u.first_name, " ", u.last_name) as tutorName, b.topic, b.location, b.session_id, t.rate_hr, b.datetime, b.duration FROM user u INNER JOIN tutor t ON t.id = u.id INNER JOIN services s ON s.tutor_id = t.id INNER JOIN booking b ON b.session_id = s.service_id', function(error1, results1, fields1){
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

app.get('/addSeminar', function(request, response) {
	response.sendFile(path.join(__dirname + '/addSeminar.html'));
});

app.get('/addSession', function(request, response) {
	response.sendFile(path.join(__dirname + '/addSession.html'));
});


app.listen(3000, function() {
	console.log('Server is running on port 3000...');
});
