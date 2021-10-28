var express=require("express");
var session = require('express-session');
var bodyParser=require("body-parser");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/attendanceDB";
var path = require('path');
//let alert = require('alert'); 
//import alert from 'alert'

var app=express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
extended: true
}));
app.use(session({
    secret:'cookie-secret',
    resave: true,
    saveUninitialized: true
}));
//session var
var ssn;

app.post('/staff-home', function(req, res){
	var staff_id = req.body.staff_id;
	var password = req.body.staff_password;
    var email = req.body.staff_email;

	var data = {
		"staff_id":staff_id,
		"password":password,
        "email":email
	}
    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("attendanceDB");

        dbo.collection("staff").find(data).toArray(function(err, result){
            if(err) throw err;
            console.log(result);
            if(result.length == 0){
                console.log("Login credentials are incorrect!");
                res.send("<script>alert('Login credentials are incorrect!')</script>");
            }
            else{
                console.log("Redirecting...");
                res.render(__dirname + '/views/staff-home.ejs');
            }
            db.close();
        });
    });
    
});
app.post('/student-home', function(req, res){
	var prn = req.body.prn;
	var password_stud = req.body.password_stud;
    var email_stud = req.body.email_stud;

    ssn = req.session;
    ssn.prn = req.body.prn; 
	var data = {
		"prn":prn,
		"password_stud":password_stud,
        "email_stud":email_stud
	}
    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("attendanceDB");

        dbo.collection("student").find(data).toArray(function(err, result){
            if(err) throw err;
            console.log(result);
            if(result.length == 0){
                console.log("Login credentials are incorrect!");
                res.send("<script>alert('Login credentials are incorrect!')</script>");
            }
            else{
                console.log("Redirecting...");
                res.render(__dirname + '/views/student-home.ejs');
            }
            db.close();
        });
    });
    
});

//staff attendace portal
app.get('/attendance', function(req, res){
    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("attendanceDB");

        dbo.collection("student").find().toArray(function(err, result){
            if(err) throw err;
            //console.log(result);
            res.render('attendance', {result: result});
            db.close();
        });
    });
    
});

//get data from attendance
app.post('/attendancedata', function(req, res){
    var jsondata = req.body.data;
    var data = JSON.parse(jsondata);
    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("attendanceDB");

        dbo.collection("attendance").insertMany(data, function(err, res){
            if(err) throw err;
            console.log('Attendance records inserted');
            db.close();
        });
    });
    res.redirect("/attendance");
});

//get data from announce
app.post('/announce', function(req, res){
    var header = req.body.announce_header;
    var body = req.body.announce_body;

    var data = {
        "header": header,
        "body": body
    }
    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("attendanceDB");

        dbo.collection("announcement").insertOne(data, function(err, res){
            if(err) throw err;
            console.log('Announce record inserted');
            
            db.close();
        });
    });
    res.redirect("/announce");    
});

//get data from database for student-attendance
app.get('/student-attendance', function(req, res){
    ssn = req.session;
    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("attendanceDB");
    
        dbo.collection("attendance").find({"prn": ssn.prn, "status":"p"}).toArray(function(err, result){
            if(err) throw err;

            var present_days = result.length;
            var absent_days = 10 - present_days;
            var attendance_perc = present_days*10;
            var result = {present_days: present_days, absent_days: absent_days, attendance_perc: attendance_perc};

            res.render('student-attendance', {result: result});     
            console.log('Attendance data shown');       
            db.close();
        });
    }); 
});

//get data from database for student-announcement
app.get('/student-announce', function(req, res){
    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("attendanceDB");
    
        dbo.collection("announcement").find().toArray(function(err, result){
            if(err) throw err;

            res.render('student-announce', {result: result});     
            console.log('Announcement data shown');       
            db.close();
        });
    }); 
});

app.get("/", (req, res) => {
    res.render(__dirname + "/views/index.ejs");
});
app.get("/staff-home", (req, res) => {
    res.render(__dirname + "/views/staff-home.ejs");
});
app.get("/attendance", (req, res) => {
    res.render(__dirname + "/views/attendance.ejs");
});
app.get("/announce", (req, res) => {
    res.render(__dirname + "/views/announce.ejs");
});
app.get("/staff-home", (req, res) => {
    res.render(__dirname + "/views/student-home.ejs");
});
app.get("/student-attendance", (req, res) => {
    res.render(__dirname + "/views/student-announce.ejs");
});
app.get("/staff-announce", (req, res) => {
    res.render(__dirname + "/views/staff-announce.ejs");
});
app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
});
