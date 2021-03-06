var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  Campground = require("./models/campground"),
  Comment = require("./models/comment"),
  User = require("./models/user"),
  seedDB = require("./seeds")

mongoose.connect("mongodb://localhost/yelp_camp_v6", { useNewUrlParser: true, useUnifiedTopology: true  });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
seedDB();

// PASSPORT CONFIGURATION

app.use(require("express-session")({
  secret: "Lucy will always be remembered!",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());

app.get("/", function (req, res) {
  res.render("landing");
});

// INDEX - show all campgrounds
app.get("/campgrounds", function (req, res) {
  //Get all campgrounds from DB
  Campground.find({}, function (err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      // console.log(allCampgrounds);
      res.render("campgrounds/index", { campgrounds: allCampgrounds });
    }
  });
});

// CREATE - add new campground to DB
app.post("/campgrounds", function (req, res) {
  // get data from form and add to db
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var newCampground = { name: name, image: image, description: description };

  // create new campground and save to db

  Campground.create(newCampground),
    function (err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        // redirect back to campgrounds page
        res.redirect("/campgrounds");
      }
    };
});

// NEW - show form to create new campground
app.get("/campgrounds/new", function (req, res) {
  res.render("campgrounds/new");
});

// SHOW - shows more info about one campground

app.get("/campgrounds/:id", function (req, res) {
  // find the campground with provided id
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        // render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});


//=====================================
// COMMENT ROUTES
//=====================================

app.get("/campgrounds/:id/comments/new", function(req, res){
  // find campground by id
  Campground.findById(req.params.id, function(err, campground){
    if (err){
      console.log(err);
    }else {
      res.render("comments/new", {campground: campground});
    }
  })
})

app.post("/campgrounds/:id/comments", function(req, res){
  // lookup campground using id
  Campground.findById(req.params.id, function(err, campground){
    if (err){
      console.log(err);
      res.redirect("/campgrouds");
    } else {
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          console.log(err);
        } else {
          campground.comments.push(comment);
          campground.save();
          res.redirect("/campgrounds/" + campground._id);
        }
      })
    }
  })
})

//==================
//AUTH ROUTES
//==================

// show register form
app.get("/register", function(req, res){
  res.render("register");
});

//handle sign up logic

app.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect("campgrounds");
    });
  });
});




app.listen(3004, function () {
  console.log("Server is listening on port 3004!");
});
