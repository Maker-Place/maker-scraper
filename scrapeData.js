const mongoose = require("mongoose");
const db = require("./models");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/makerplace";

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI);

var scrape = require("./scripts/scrape.js");

function scrapeClasses() {
    // scrape has a callback function that will send back classData and a boolean of whether it's done
    db.Class.remove()
    .then(() => {
	    scrape(function(classData, done) {
	      if (classData.url) {
	        db.Class.find({"url": classData.url}).limit(1)
	        .then(function(found) {
	          if (!found.length) {
	            console.log('not found');
	            db.Class.create(classData)
	              .then(function(classAdded) {
	                {
	                  console.log("added " + classAdded.id);
	                  console.log(done);
	                  if (done) {
	                  	console.log("done");
	                  }
	                }
	             })
	             .catch(function(err) {
	                   console.log("------------------------------------------------------------------------------");
	                   console.log(err);
	             });
	          } else {
	            console.log("in the db", done);
	            if (done) {
	            	console.log("done");
	            }
	          } 
	        });
	      } else {
	        if (done) {
	        	console.log("done");
	        }
	      }
	    })
	})
  }


scrapeClasses();
