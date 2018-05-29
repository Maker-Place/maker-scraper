const mongoose = require("mongoose");
const db = require("./models");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/makerplace";

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI);
var scrapeCats = require("./scripts/scrapeCategories.js");
var scrape = require("./scripts/scrape.js");

function scrapeCategories() {
	scrapeCats
	.then(function(categoryData) {
		db.Category.create(categoryData)
		.then(function(catAdded) {
			{console.log("added " + catAdded)}
			scrapeClasses();
		})
		.catch(function(err) {
			console.log(err);
		})
	}), function(err) {
		console.log(err);
	}
}

function scrapeClasses() {
    // scrape has a callback function that will send back classData and a boolean of whether it's done
    var categories;
   	db.Category.find()
    .then(function(data) {
    	categories = data;
    	for (var i = 0; i < categories.length; i++) {
    		console.log(categories[i]._id)
    		scrape(categories[i].link, categories[i]._id, function(classData, id, done) {
		    	// if there's an id field (meaning data was returned), check if it exists already, then add it if it doesn't
		      if (classData._id) {
		        db.Class.find({"_id": classData._id}).limit(1)
		        .then(function(found) {
		          if (!found.length) {
		          	//if the class doesn't already exist in the database
		            db.Class.create(classData)
		              .then(function(classAdded) {
		                {
		                  console.log("added " + classAdded.id);
		                  
		                  db.Category.findOneAndUpdate({_id:id}, { $push: { lessons: classAdded.id } }, { new: true })
		                  .then(console.log("lesson added"));
		     
		                }
		             })
		             .catch(function(err) {
		                   console.log("------------------------------------------------------------------------------");
		                   console.log(err);
		             });
		          } else {
		          	// it's already in the database
		          	// ToDo: add a new category to it if we're on a new category page
		           
		            if (done) { console.log("done1: " + done) }
		            db.Category.findOneAndUpdate({_id:id}, { $push: { lessons: classData._id } }, { new: true })
		        	.then(console.log("duplicate lesson added"));
		          } 
		        });
		      } else {
		      	// if there's no data
		      	console.log("done3: " + done);
		      	// this doesn't happen last because the scraping is not asynchronous
		      	// need to add promises in order to exit after last data
		      	// process.exit();
		      }
		    })
    	}
    })
}

 // clear out the database
db.Class.remove()
.then(() => {
	db.Category.remove()
	.then(() => {
		scrapeCategories()
	});
});
