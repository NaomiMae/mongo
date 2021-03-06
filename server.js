var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;
var MONGODB = process.env.MONGODB_URI || "mongodb://localhost/unit18Populater";
// Initialize Express
var app = express();
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(MONGODB, { useNewUrlParser: true });

// Routes
app.get("/", function(req, res) {
  db.Article.find({saved:false})
    .then(function(data) {
      // If we were able to successfully find Articles, send them back to the client
      // res.json(data);
      var hbsObject = {
        articles: data
      };
      console.log(hbsObject);
      res.render("index", hbsObject);
    })
   
    
  });
;
// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
// console.log(response);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      var results = [];
      var title = $(element).children().text();
      var link = $(element).find("a").attr("href");
      var summary = $(element).children().text();
        // result.saved = false;
        results.push({
          title: title,
          link: link,
          summary:summary });
          console.log(results);
      // Create a new Article using the `result` object built from scraping
      db.Article.create(results)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
app.get("/saved", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved:true})
    .then(function(data) {
      // If we were able to successfully find Articles, send them back to the client
      // res.json(data);
      var hbsObject = {
        articles: data
      };
      console.log(hbsObject);
      res.render("saved", hbsObject);
    })
});
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Article.updateOne({_id: req.params.id}, {$set: {saved:req.body.saved}})
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.render("index");
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

