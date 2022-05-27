const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const queryController = require("./controllers/queryController");
const detailPageController = require("./controllers/detailPageController");

// express app
const app = express();

// process.env.PORT is from heroku and 3000 is my local port , so it chooses 1st if it exists otherwise takes second
const PORT = process.env.PORT || 3000;

// Connect to MongoDb

const dbURI =
  "mongodb+srv://babuRao:KPAUJrqrcVYBZhBQ@probs.vlvbx.mongodb.net/Top_problems?retryWrites=true&w=majority";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    global.flag = 0;
    app.listen(PORT); // Listen for req only after db has been connected
  })
  .catch((err) => console.log(err));

// register view engine
app.set("view engine", "ejs");
// look for HTML named folder
app.set("views", "HTML");

// middleware and static files

// middleware to reference files in "public" folder directly in front end
app.use(express.static("public"));
//middleware to accept form data
app.use(express.urlencoded({ extended: true }));
// middleware to show the request type in terminal
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.render("index", { title: "Noodle", top10prob: [] });
});

app.get("/Problem/:id", detailPageController.details);
// post request for search
app.post("/search", queryController.search);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
