var http = require('http');
var mongoose = require('mongoose')
var express = require('express')


var app = express();

var config = {
	"HOST"		: "ec2-54-172-205-195.compute-1.amazonaws.com",
	"PORT"		: "27017",
	"DATABASE" 	: "test" 
};

var dbPath = "mongodb://"+ 
	config.HOST + ":" +
	config.PORT + "/" +
	config.DATABASE;

var standardGreeting = 'Hello Bernie!';

var db;

var greetingSchema;
var Greeting;

greetingSchema = mongoose.Schema({
	sentence: String
});

var Greeting = mongoose.model('Greeting', greetingSchema);

console.log('\nattempting to connect to remote MondoDB instance on another EC2 Server '+config.HOST);

if ( !(db = mongoose.connect(dbPath)) )
	console.log('unable to connect to MongoDB at '+dbPath);
else
	console.log('connecting to mongo at '+dbPath);

mongoose.connection.on('error', function(err){
	console.log('database connect error '+err);
});

mongoose.connection.once('open', function(){
	var greeting;

	console.log('database '+config.DATABASE+ ' is now open on '+config.HOST);
	
	Greeting.find( function(err, greetings){
		if( !err && greetings ){
			console.log(greetings.length+' grettings already exist in database');
		}
		else{
			console.log('no greetings in database, creating one');
			greeting = new Greeting({ sentence: standardGreeting });
			greeting.save(function (err, greetingsav){
				if(err){
					console('couldnt save greeting to db');
				}
				else{
					console.log('new greeting '+greeting.sentence+' was successfully saved to db');

					Greeting.find( function(err, greetings){
						if ( greetings )
							console.log('checked after save: found '+greetings.length+ ' greetings in db');
					});
				}
			});
		}
	});
});


app.get('/', function(req, res){
	var responseText = '';

	console.log('received client request');
	if( !Greeting )
		console.log('Database not ready');

	Greeting.find(function (err, greetings) {
		if(err){
			console.log('couldnt find a greeting in the database, error: '+err);
			next(err);
		}
		else{
			if(greetings){
				console.log('found '+greetings.length+' greetings in the db');
				responseText = greetings [0].sentence;
			}
			console.log('sending greeting to client: '+responseText);
			res.send(responseText);
		}
	});
});

app.use(function(err, req, res, next){
	if (req.xhr) {
		res.send(500, 'Somthing went wrong!');
	}
	else{
		next(err);
	}
});

console.log('starting the Express (NodeJS) Web server');
app.listen(8080);
console.log('Webserver is listening on port 8080');








