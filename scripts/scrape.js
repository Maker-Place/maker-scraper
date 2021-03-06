var axios = require("axios");
var cheerio = require("cheerio");

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');


//addToDB is the callback passed in where the function is used
var scrape = function(link, id, addToDB) {
	console.log("scraping");

	var classLinks = [];

	axios.get(link).then(function(response) {

		var $ = cheerio.load(response.data);
		
		//get all the class links
		$(".eventModuleItem").each(function(i,element) {
			var link = $(this).find(".itemTitleContainer").find("a").attr("href");
			// we'll only get one link to the class per category
			if (!classLinks.includes(link)) {
				classLinks.push(link);
			}
		});

		let count = 0,
		lesson = {};

		getClassData(count);
		
		function getClassData(count) {

			if (classLinks[count]) {
				// go to the page for the class and get all the data
				axios.get(classLinks[count])
				.then(function(response) {
					var $ = cheerio.load(response.data);

					var title = $(".SystemPageTitle").html().trim();
					var startDate = $(".eventInfoStartDate").children(".eventInfoBoxValue").children("strong").html();
					var endDate = $(".eventInfoEndDate").children(".eventInfoBoxValue").children("span").html();
					var startTime = $(".eventInfoStartTime").children(".eventInfoBoxValue").children("span").html();
					var schedule = $(".eventInfoSession").html();
					var location = $(".eventInfoLocation").children(".eventInfoBoxValue").children("span").html();
					var spacesLeft = $(".eventInfoSpacesLeft").children(".eventInfoBoxValue").children("span").html();
					var classTimes = [];
					var classDay = [];
					var classMonth = [];
					var classYear = [];
					var classStartTime = [];
					var classEndTime = [];
					var registrationOptions = [];
					var url = classLinks[count];
					var eventidstart = "00000000000000000";
					var eventid = url.substr(-7);
					var fullid = eventidstart + eventid;
					_id = ObjectId(fullid);
					var registerLink = $(".boxActionContainer .inner a").attr("href");
					var description = $(".gadgetEventEditableArea").html();
					//strip out the html
					description = description.replace(/<(?:.|\n)*?>/gm, '');
					//replace any number of spaces at the beginning of the string with an open <p> tag
					description = description.replace(/^[\s\r\t\n]*/, '<p>');
					//replace any number of spaces at the end of the string with a close </p> tag
					description = description.replace(/[\s\r\t\n]*$/, '</p>');
					// replace &#xA0; with a space
					description = description.replace(/(&#xA0;)/g, ' ');
					// replace any two or more white space characters with a close and open p tag
					description = description.replace(/[\s\r\t\n]{2,}/g, '</p><p>');
					
					$(".eventInfoSession").each(function(i, element){
						var data = $(this).find("span").html();	
						classTimes.push(data);
					});

					$(".regTypeLiLabel").each(function(){
						var data = $(this).find("strong").html();
						registrationOptions.push(data);
					});

						// storing the class time data for the calendar plugin
						// if there are multiple sessions for this class, there will be elements in the classTimes array
						if (classTimes.length) {
							for (var i = 0; i < classTimes.length; i++) {

							var dayOfMonth = parseInt(classTimes[i].substring(0, 2));
							var monthStr;
							// var date;
							var thisStartTime;
							var endTime;

							var indexOfEndStartTime = classTimes[i].indexOf("PM") + 3;
							var indexOfEndEndTime = indexOfEndStartTime + 8;
							var indexOfEndDate = classTimes[i].indexOf(",") + 2;
							var indexOfEndMonth = classTimes[i].indexOf("201");

							// date = classTimes[i].substring(0, indexOfEndDate -2);
							thisStartTime = classTimes[i].substring(indexOfEndDate, indexOfEndStartTime);
							endTime = classTimes[i].substring(indexOfEndStartTime, indexOfEndEndTime);

							monthStr = classTimes[i].substring(3, indexOfEndMonth);

							var monthNum = moment().month(monthStr).format("M");

							var year = moment(classTimes[i],"DD/MMM/YYYY").year();

							classDay.push(dayOfMonth);
							classMonth.push(monthNum);
							classYear.push(year);
							classStartTime.push(thisStartTime);
							classEndTime.push(endTime);

							}

						} else {
						 //parse startDate, storing the data as an array with just one element to make using the data later simpler								
							var dayOfMonth = parseInt(startDate.substring(0, 2));
							
							var monthStr;

							var indexOfEndMonth = startDate.indexOf("201");

							monthStr = startDate.substring(3, indexOfEndMonth);

							var monthNum = moment().month(monthStr).format("M");

							var year = moment(startDate,"DD/MMM/YYYY").year();

							classDay.push(dayOfMonth);
							classMonth.push(monthNum);
							classYear.push(year);

						 //parse startTime, storing the data as an array with just one element to make using the data later simpler
							var endTime;

							var indexOfEndStartTime = startTime.indexOf("PM") + 3;
							var indexOfEndEndTime = indexOfEndStartTime + 8;
							
							thisStartTime = startTime.substring(indexOfEndDate, indexOfEndStartTime);
							thisEndTime = startTime.substring(indexOfEndStartTime, indexOfEndEndTime);

							classStartTime.push(thisStartTime);
							classEndTime.push(thisEndTime);

						};

					// console.log(_id);

					lesson = {
						_id,
						title,
						startDate,
						endDate,
						startTime,
						location,
						spacesLeft,
						schedule,
						classTimes,
						classDay,
						classMonth,
						classYear,
						classStartTime,
						classEndTime,
						registrationOptions,
						registerLink,
						description,
						url,

					};

					count++;
					//if there are more classes, send the lesson and false (for not done) and run the function again
					if (count < classLinks.length) {
						addToDB(lesson, id);
						getClassData(count);
					} else {
						//if it's the last class
						//only send done if it's also the last category
						addToDB(lesson, id);
					}
				})
				.catch(function(err) {
					console.log(err);
				})
			} else {
				//if there are no classes, check if last category
				addToDB({});
			}
    	}
    })
		
}

module.exports = scrape;