var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {
	var currIP = req.ip;
	MongoClient.connect('mongodb://localhost:27017/cardb', function (error, db){
		db.collection('users').find({ip:currIP}).toArray(function (error, userResult){
			var photosVoted = [];
			for(i=0;i<userResult.length;i++){
				photosVoted.push(userResult[i].image.src);
			}
			db.collection('cars').find({photo: {$nin:photosVoted}}).toArray(function (error, result){
				if(result.length == 0){
					// redirect to the thanks page
					// res.render('index',{photo: result})
				}else{
					var rand = Math.floor(Math.random()*result.length)
					res.render('index',{ photo: result[rand] })
				}

			});
		});
	// Index page should load random picture/item
	// 1. Get all pictures from the MongoDB
	// 2. Get the current user from MongoDB via req.ip;
	// 3. Find which photos the current user has NOT voted on
	// 4. Load all of those photos into an array.
	// 5. Choose a random image from the array, and set it to a var.
	// 6. res.render() the index view and send it the photo.
	
	});
});

router.get('/favorites', function (req, res, next){
	MongoClient.connect('mongodb://localhost:27017/cardb', function (error, db){
		db.collection('users').find({vote: 'favorites'}).toArray(function (error, result){
			console.log(result)
			res.render('favorites',{title: "Standings", photos : result})
		})
	})
	// 1. get all the photos
	// 2. sort them by most likes
	// 3. res.render the standings view and pass it the sorted photo array.
})

router.post('/favorites', function (req, res, next){
	MongoClient.connect('mongodb://localhost:27017/cardb', function (error, db){
		db.collection('users').insertOne({
			ip: req.ip,
			vote: 'favorites',
			image: req.body
		})
	})
	res.redirect('../');
})

router.post('/pass', function (req, res, next){
	MongoClient.connect('mongodb://localhost:27017/cardb', function (error, db){
		db.collection('users').insertOne({
			ip: req.ip,
			vote: 'pass',
			image: req.body
		})
	})
	res.redirect('../');
});

module.exports = router;
