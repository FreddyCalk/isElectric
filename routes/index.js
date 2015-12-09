var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var mongoURL = 'mongodb://localhost:27017/cardb';

/* GET home page. */
router.get('/', function (req, res, next) {
	var currIP = req.ip;
	MongoClient.connect(mongoURL, function (error, db){
		db.collection('users').find({ip:currIP}).toArray(function (error, userResult){
			var photosVoted = [];
			for(i=0;i<userResult.length;i++){
				photosVoted.push(userResult[i].image);
			}
			db.collection('cars').find({src : {$nin:photosVoted}}).toArray(function (error, result){
				if(result.length == 0){
					// redirect to the thanks page
					res.render('thanks', {photo: result})
				}else{
					var rand = Math.floor(Math.random()*result.length);
					res.render('index', { photo: result[rand] })
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
})
router.get('/favorites', function (req, res, next){
	MongoClient.connect(mongoURL, function (error, db){
		db.collection('users').find({vote: 'favorites'}).toArray(function (error, result){
			res.render('favorites',{title: "Standings", photos : result})
		})
	})
	// 1. get all the photos
	// 2. sort them by most likes
	// 3. res.render the standings view and pass it the sorted photo array.
})
router.get('/list', function (req, res, next){
	MongoClient.connect(mongoURL, function (error, db){
		db.collection('cars').find().toArray(function (error, result){
			
			result.sort(function (p1, p2){
				return (p2.totalVotes - p1.totalVotes);
			})

			res.render('list',{photos : result})
		})
	})
})
router.get('/losers', function (req, res, next){
	MongoClient.connect(mongoURL, function (error, db){
		db.collection('users').find({vote: 'pass'}).toArray(function (error, result){
			res.render('losers',{photos : result});
		})
	})
})

router.get('/add', function (req, res, next){
	res.render('add',{});
})
router.post('*', function (req, res, next){
	if(req.url == '/favorites'){
		var page = 'favorites';
	}else if(req.url == '/losers'){
		var page = 'losers';
	}else{
		res.redirect('/');
	}
	MongoClient.connect(mongoURL, function (error, db){
		db.collection('cars').find({src: req.body.src}).toArray(function (error, result){
			var updateVotes = function(db, votes, callback){
				if(page =='favorites'){var newVotes = votes+1;}
				else if(page == 'losers'){var newVotes = votes - 1;}

				db.collection('cars').updateOne(
					{ "src" : req.body.src },
					{
						$set: {"totalVotes": newVotes},
						$currentDate: {"lastModified":true}
					}, function (err, result){
						callback()
					})
			};
			MongoClient.connect(mongoURL, function (error, db){
				console.log(result)
				updateVotes(db,result[0].totalVotes, function() {});
			})
		})
		res.redirect('/');
	})
})


router.post('/add', function (req,res,next){
	MongoClient.connect(mongoURL, function(error, db){
		console.log(req.body);
		db.collection('cars').insertOne({
			name: req.body.name,
			src: req.body.src,
			totalVotes: 0
		})
	})
})

// router.post('/favorites', function (req, res, next){
// 	MongoClient.connect(mongoURL, function (error, db){
// 		db.collection('users').insertOne({
// 			ip: req.ip,
// 			vote: req.body.vote,
// 			name: req.body.name,
// 			image: req.body.src
// 		})
// 	})
// 	res.redirect('../');
// })


module.exports = router;
