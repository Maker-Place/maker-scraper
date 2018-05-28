const mongoose = require("mongoose");
const db = require("./models");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/makerplace";

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI);

var scrape = require("./scripts/scrape.js");

function scrapeClasses() {
    // scrape has a callback function that will send back classData and a boolean of whether it's done

    // clear out the database
    db.Class.remove()
    .then(() => {
	    scrape(function(classData, done) {
	    	// if there's an id field (meaning data was returned), check if it exists already, then add it if it doesn't
	      if (classData._id) {
	        db.Class.find({"_id": classData._id}).limit(1)
	        .then(function(found) {
	          if (!found.length) {
	            db.Class.create(classData)
	              .then(function(classAdded) {
	                {
	                  console.log("added " + classAdded.id);
	                  if (done) { console.log("done1: " + done) }
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
	})
  }

scrapeClasses();
