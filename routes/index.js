var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {
	MongoClient.connect('mongodb://localhost:27017/mongotest', function (error, db){
		db.collection('teams').find().toArray(function (error, result){
			console.log(result);
		})
	});
	// Index page should load random picture/item
	// 1. Get all pictures from the MongoDB
	// 2. Get the current user from MongoDB via req.ip;
	// 3. Find which photos the current user has NOT voted on
	// 4. Load all of those photos into an array.
	// 5. Choose a random image from the array, and set it to a var.
	// 6. res.render() the index view and send it the photo.

	var serverPhotos = [{name: "http://www.boston.com/cars/newsandreviews/overdrive/2010/04/27/Chad-Conway-Comuta-Car.jpg"},
	{name: "https://i.ytimg.com/vi/dJfSS0ZXYdo/hqdefault.jpg"}];

	res.render('index', { photo: serverPhotos });
});

router.get('/standings', function (req, res, next){
	// 1. get all the photos
	// 2. sort them by most likes
	// 3. res.render the standings view and pass it the sorted photo array.
	res.render('index',{title: "Standings"})
})

router.post('*', function (req, res, next){
	// this will run for all posted pages.
});

module.exports = router;
