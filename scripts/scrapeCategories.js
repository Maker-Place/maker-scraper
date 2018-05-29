var axios = require("axios");
var cheerio = require("cheerio");

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');


//addToDB is the callback passed in where the function is used
var scrapeCategories = new Promise(function(resolve, reject) {
	console.log("scraping");
	
  // First, we grab the body of the html
	axios.get("http://makerplace.com/classes").then(function(response) {
	    // Then, we load that into cheerio and save it to $ for a shorthand selector
	    var $ = cheerio.load(response.data);

	    // categoryLinks will be an array of objects with the category title and link
	    var categoryLinks = [];
	    
	    //the div with this id contains the navigation links to each of the category pages
	    $("#id_MenuGadget_idMainMenu1208398").find("a").each(function(i,element) {
	    	// add each link in the menu to the array
	    	categoryLinks.push({
	    		name: $(this).html(),
	    		link: $(this).attr("href")
	    	});
	    });
		
	    resolve(categoryLinks);
	});
});

module.exports = scrapeCategories;