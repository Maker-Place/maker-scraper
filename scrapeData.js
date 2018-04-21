const mongoose = require("mongoose");
const db = require("./models");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/maker-scraper-heroku-test";
mongoose.Promise = global.Promise;
// This file empties the Books collection and inserts the memberships below
mongoose.connect(MONGODB_URI);

var scrape = require("./scripts/scrape.js");

const membershipsSeed = [
    {
        membership_type: "1 Year Prepaid",
        annual_cost: "$1,296/year",
        monthly_cost: "($52/month)",
        discount: "(Save 33%)",
        description: "Free Shop Orientation. After completion of the commitment period the membership will continue to automatically renew until member cancels. The member will be notified prior to any price increases."
    },
    {
        membership_type: "6 Months Prepaid",
        annual_cost: "$720/year",
        monthly_cost: "$120/month",
        discount: "(Save 25%)",
        description: "Free Shop Orientation. After completion of the commitment period the membership will continue to automatically renew until member cancels. The member will be notified prior to any price increases."
    },
    {
        membership_type: "3 Months Prepaid",
        annual_cost: "$408/year",
        monthly_cost: "($136/month)",
        discount: "(Save 15%)",
        description: "Free Shop Orientation. After completion of the commitment period the membership will continue to automatically renew until member cancels. The member will be notified prior to any price increases."
    },
    {
        membership_type: "Month to Month",
        annual_cost: "$160/month",
        monthly_cost: "",
        discount: "",
        description: "Free Shop Orientation. After completion of the commitment period the membership will continue to automatically renew until member cancels. The member will be notified prior to any price increases."
    },
    {
        membership_type: "Fabrication Pass",
        annual_cost: "$79/month",
        monthly_cost: "",
        discount: "",
        description: "Access to the craft room, assembly room, and 3D printing area. Membership will be automatically renewed and the associated debit/credit card will be charged at the current list price until cancelled. The member will be notified prior to any price increases."
    },
    {
        membership_type: "10 Day Punch Card",
        annual_cost: "$375/month",
        monthly_cost: "",
        discount: "",
        description: "Valid for 10 days of membership and does not need to be used consecutively. Purchase of this pass does not include Shop Orientation or membership discounts on classes. Does not require any specific duration commitment. Promotional value valid for 1 year from date of purchase."
    }
];

function addClasses() {
    db.Membership
	.remove({})
	.then (() => db.Membership.insertMany(membershipsSeed))
    .then(data => {
        data.map(item => (
          console.log(item._id)
        ));
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
}
function scrapeClasses() {
    // scrape has a callback function that will send back classData and a boolean of weather it's done
    return scrape(function(classData, done) {
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
  }


scrapeClasses();
