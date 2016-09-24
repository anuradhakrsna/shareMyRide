var express = require('express');
var router = express.Router();
var data = require("../data");
var search = data.search;
var async = require("async");
var signin = data.signin;
var seeker = data.seeker;
var xss = require('xss');


router.get("/", (req, res) => {

    res.render("signin/initial",{ partial: "signin-scripts"});
});

router.get("/user", (req, res) => {

   res.render("search/searchwithlogin",{ partial: "signin-scripts"});
});
router.post("/cityFinder", (req, res) => {

    var cities= [];
    var enteredData = req.body;
    //Retrives the source and destination city from the database (travel pan and booked plan collections)
    var sourceCity= search.getalltravelplansource();
    var destinationCity= search.getalltravelplandestination();


    destinationCity.then(function (peopledata) {

            for( var i = 0; i < peopledata.length; i++ ) {
                cities.push(peopledata[i]);
            }
            sourceCity.then(function (peopledata) {
                    for( var i = 0; i < peopledata.length; i++ )

                    {
                        cities.push(peopledata[i]);
                    }
                    console.log(cities);
                    res.json({cities});
                }
            );

        }
    );

});

router.get("/searchResult", (req, res) => {

      res.render("search/searchResult", {});

});

router.post("/searchResult", (req, res) => {


    //This funtion gives the resuls for the search criteria entered in the search page

    var source = xss(req.body.source);
    var destination = xss(req.body.destination);
    var searchdate = xss(req.body.travelDate);
    var searchtime =xss(req.body.search_time);



    var finaldate="";

    Date.prototype.addHours= function(h){
        this.setHours(this.getHours()+h);
        return this;
    };

    //this converts te date to the mongo DB format
    var startDate = searchdate+"T"+searchtime+":00.000Z";

    finaldate = new Date(startDate).addHours(4);// Adding 4 hours since it is taking the input in GMT.
    var lessthanDate =searchdate+"T"+"23:59"+":00.000Z"; // checking for the end of the day
    var finallessthanDate=new Date(lessthanDate).addHours(4);



    var travelplanData= [];
    var travelprovidermemberdata = [];
    var travelprovidercardata = [];
    var seatsdata = [];



    async.series([
        function(callback) {
            search.getPlanListBydate(source,destination,finaldate,finallessthanDate).then(function (plandata) {
                //Getting all the travel plans (rides created by  the ride provider) from the Travel plans collections
                    var addData ={};
                    //This is for checking if there are any results.If no results then a No result page will be displayed
                    if(plandata.length ==0)
                    {
                    //checking if the member is signed in
                        if (req.cookies.sessionId === undefined || req.cookies.sessionId === null) {
                            res.render("search/searchNoResultwithoutlogin", {travelplanData:travelplanData,partial:"signin-scripts"});
                      callback();
                        }
                        else
                        {
                            //checking signed in member details and retriving the
                            signin.getmemberBySessionId(req.cookies.sessionId).then((userInfo)=> {
                                res.render("user/profile", {
                                    partial: "userProfile-scripts",
                                    partials: "searchNoResult",
                                    modals: "providerModal",
                                    userInfo: userInfo,
                                    travelplanData: travelplanData,
                                    checkListValue: "searchResult"
                                });
                            }).catch((e)=> {
                                res.render("search/searchResultwithoutlogin", {travelplanData: travelplanData, partial: "signin-scripts"});
                            });

                            callback();

                        }

                    }

                    //this will run if there are travel plans available in teh database for the particular date and time searched
                    for( var i = 0; i < plandata.length; i++ ) {

                        //Collecting all the details of the searched travel plan from the database
                        addData = {

                            _id: plandata[i]._id,
                            member_id: plandata[i].member_id,
                            car_id: plandata[i].car_id,
                            source_street: plandata[i].source_street,
                            source_city: plandata[i].source_city,
                            source_state: plandata[i].source_state,
                            destination_street: plandata[i].destination_street,
                            destination_city: plandata[i].destination_city,
                            destination_state: plandata[i].destination_state,
                            travel_start_time: plandata[i].travel_start_time,
                            estimated_travel_time: plandata[i].estimated_travel_time,
                            seats_offered: plandata[i].seats_offered,
                            price: plandata[i].price,
                            description: plandata[i].description,
                            travelprovidermemberdata:[],
                            travelprovidercardata:[],
                            seatsdata:[],
                            totalseats:[],
                            seatsover:[],
                            alreadybooked:[],
                            totalseatsalreadybooked:[]
                        };
                        travelplanData.push(addData);
                      if(i+1 == plandata.length)
                      {callback();}

                    }
  }
            );

        },
        function(callback) {

            // Getting details of the ride provider (person who provides the ride with his car)
            var count =0;
            for( var j = 0; j < travelplanData.length; j++ ) {

                signin.getmemberById(travelplanData[j].member_id).then(function (memberdata) {

                   var addData ={};
                           addData = {
                            _id: memberdata._id,
                            first_name: memberdata.first_name,
                            last_name: memberdata.last_name,
                            gender: memberdata.gender,
                            email: memberdata.email,
                            phone_number: memberdata.phone_number,

                        };
                    travelprovidermemberdata.push(addData);
                    travelplanData[count].travelprovidermemberdata.push(addData);

                    if(count+1 == travelplanData.length)
                    {callback();}
                    count=count+1;

                });
                }

        },
        function(callback) {
    // Getting details of the car details of the ride provider (person who provides the ride with his car)
            var count =0;
          for (var k = 0; k < travelplanData.length; k++) {
                    signin.getcarInfo(travelplanData[k].car_id).then(function (cardata) {
                        var addData = {};
                        addData = {
                            _id: cardata._id,
                            name: cardata.name,
                            make_year: cardata.make_year,
                            registration_number: cardata.registration_number,
                            color: cardata.color,
                        };
                        travelprovidercardata.push(addData);
                        travelplanData[count].travelprovidercardata.push(addData);
                       if (count + 1 == travelplanData.length) {
                            callback();
                        }
                        count = count + 1;
                    });
                }

    },
        function(callback) {
            // Getting details of the seat count available for each rides provided  by ride provider (person who provides the ride with his car)
             var count =0;
            async.eachSeries(travelplanData, function(travelData, next) {


                    if (req.cookies.sessionId === undefined || req.cookies.sessionId === null)
                    {
                        //checking if the user is logged in already

                            search.getPlanListByTravelId(travelData._id).then(function (bookeddata)

                            { var usercheck=0;
                                var seats =travelData.seats_offered;

                                for( var i = 0; i < bookeddata.length; i++ ) {

                            seats= seats-bookeddata[i].seats_needed;

                        }

                                 if (usercheck==1)
                                {
                                    travelplanData[count].alreadybooked.push("You have already made a booking in this plan");

                                    travelplanData[count].totalseatsalreadybooked.push(seats);
                                }

                                else {

                                    if (seats > 0) {
                                        for (var z = 1; z <= seats; z++) {

                                            travelplanData[count].seatsdata.push(z);

                                            if (z == seats) {
                                                travelplanData[count].totalseats.push(z);
                                            }
                                        }
                                    }
                                    else if (seats <= 0) {
                                        travelplanData[count].seatsover.push("No seats left.Booking cannot be done");
                                    }
                                }


                                if(count+1 == travelplanData.length)
                                {callback();

                                }
                                count=count+1;
                                next();

                            });


                    }
else
                    {
                        signin.getmemberBySessionId(req.cookies.sessionId).then((userInfo)=>{
                            search.getPlanListByTravelId(travelData._id).then(function (bookeddata)

                            { var usercheck=0;
                                var seats =travelData.seats_offered;

                                for( var i = 0; i < bookeddata.length; i++ ) {

                                    seats= seats-bookeddata[i].seats_needed;
                                    if (userInfo._id==bookeddata[i].member_id)
                                    {
                                        usercheck =1;
                                    }
                                }

                                if (usercheck==1)
                                {
                                    travelplanData[count].alreadybooked.push("You have already made a booking in this plan");

                                    travelplanData[count].totalseatsalreadybooked.push(seats);
                                }

                                else {

                                    if (seats > 0) {
                                        for (var z = 1; z <= seats; z++) {

                                            travelplanData[count].seatsdata.push(z);

                                            if (z == seats) {
                                                travelplanData[count].totalseats.push(z);
                                            }
                                        }
                                    }
                                    else if (seats <= 0) {
                                        travelplanData[count].seatsover.push("No seats left.Booking cannot be done");
                                    }
                                }


                                if(count+1 == travelplanData.length)
                                {callback();

                                }
                                count=count+1;
                                next();

                            });

                        }).catch((e)=>{
                            //Error Page


                            search.getPlanListByTravelId(travelData._id).then(function (bookeddata)

                            { var usercheck=0;
                                var seats =travelData.seats_offered;

                                for( var i = 0; i < bookeddata.length; i++ ) {

                                    seats= seats-bookeddata[i].seats_needed;

                                }

                                if (usercheck==1)
                                {
                                    travelplanData[count].alreadybooked.push("You have already made a booking in this plan");

                                    travelplanData[count].totalseatsalreadybooked.push(seats);
                                }

                                else {

                                    if (seats > 0) {
                                        for (var z = 1; z <= seats; z++) {

                                            travelplanData[count].seatsdata.push(z);

                                            if (z == seats) {
                                                travelplanData[count].totalseats.push(z);
                                            }
                                        }
                                    }
                                    else if (seats <= 0) {
                                        travelplanData[count].seatsover.push("No seats left.Booking cannot be done");
                                    }
                                }


                                if(count+1 == travelplanData.length)
                                {
                                   // res.render("search/searchResultwithoutlogin", {travelplanData:travelplanData,partial:"signin-scripts"});
                                    callback();

                                }
                                count=count+1;
                                next();

                            });


                        });
                    }





           },function(err) {
                callback();
                // all data has been updated
                // do whatever you want

            });



        }
    ], function(error, results) {

        //Forwarding to the corresponding search result page if he is etiher logged in or not logged in
        if (req.cookies.sessionId === undefined || req.cookies.sessionId === null) {
            res.render("search/searchResultwithoutlogin", {travelplanData:travelplanData,partial:"signin-scripts"});
        }
        else
        {
            signin.getmemberBySessionId(req.cookies.sessionId).then((userInfo)=> {
                res.render("user/profile", {
                    partial: "userProfile-scripts",
                    partials: "searchResult",
                    modals: "providerModal",
                    userInfo: userInfo,
                    travelplanData: travelplanData,
                    checkListValue: "searchResult"
                });
            }).catch((e)=> {
                res.render("search/searchResultwithoutlogin", {travelplanData: travelplanData, partial: "signin-scripts"});
            });




        }

    });



});

module.exports = router;



