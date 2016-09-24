var express = require('express');
var router = express.Router();
var providerRoutes = require("./provider");
var searchRoutes=require("./search");
var seekerRoutes = require("./seeker");
var signinRoutes = require("./signin");
var userRoutes = require("./user");



var constructorMethod = (app) => {
    app.use("/signup", signinRoutes);
    app.use("/user",userRoutes);
    app.use("/search", searchRoutes);
    app.use("/travelplan",providerRoutes);
    app.use("/bookplan",seekerRoutes);
    
    app.use("*", (req, res) => {
        res.render("signin/initial",{ partial: "signin-scripts"});
    })
};

module.exports = constructorMethod;