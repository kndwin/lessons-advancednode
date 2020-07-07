"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const pug = require("pug");

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.route("/").get((req, res) => {
  // process.cwd means current working directory
  res.render( __dirname + '/views/pug/index.pug' ) ;

});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
