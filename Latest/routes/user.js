var express = require('express');
var router = express.Router();
var data = require("../data");
var signin = data.signin;
var provider = data.provider;
var seeker=data.seeker;
var async = require("async");
var xss = require("xss");


router.get("/:id", (req, res) => {
    if(xss(req.params.id) === "provided")
    {
        signin.getmemberBySessionId(req.cookies.sessionId).then((userInfo)=>{
            if(userInfo.ride_provider === 'Y')
            {
                provider.getfuturePlanListById(userInfo._id).then((createdTravelPlan)=>{
                createdTravelPlan.forEach((obj)=>{
                     obj.userInfo = userInfo;
                });
                //console.log(createdTravelPlan);

                    var memberSeekersList = createdTravelPlan.map(obj => provider.getseekerListByTravelPlan(obj._id));
                    Promise.all(memberSeekersList).then((arrayOfSeeker) => {
                        //console.log(arrayOfSeeker);
                        createdTravelPlan.forEach((objTravelplan)=>{
                            objTravelplan.seatsLeft= 0;
                            function filterByID(object) {
                                if ((object.totalBooked > 0)&&(object[0].travel_plan_id.indexOf(objTravelplan._id)>=0)) {
                                    //console.log(object.totalBooked);
                                    objTravelplan.seatsLeft = objTravelplan.seats_offered-object.totalBooked;
                                    delete object.totalBooked;
                                    return true;
                                } else {
                                    if(objTravelplan.seatsLeft < 1)
                                        objTravelplan.seatsLeft = objTravelplan.seats_offered;
                                    return false;
                                }
                            }
                            var resultObject = arrayOfSeeker.filter(filterByID);
                            var merged = [].concat.apply([], resultObject);
                            objTravelplan.seekerInfo = merged;
                            //console.log(objTravelplan);
                        });
                        res.render("user/profile", {partial:"userProfile-scripts",partials:"providerList",modals:"providerModal",rideprovider:true,userInfo:userInfo,createdTravelPlan:createdTravelPlan,checkListValue:"provided"});
                    }).catch((e)=>{
                        //console.log(e);
                        res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});
                    });
                }).catch((e)=>{
                    //console.log(e);
                    res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});
                });
            }
            else
            {
                res.render("user/profile", {partial:"userProfile-scripts",partials:"providerList",modals:"providerModal",rideseeker:true,userInfo:userInfo,checkListValue:"provided"})
            }

        }).catch((e)=>{
            res.render("error/errorpage", {partial:"signin-scripts",invalidUser:true,error:e}); //Error Page.
        });

    }
    else if(xss(req.params.id) === "seeked")
    {
        /*console.log("ANU CALL BACK");*/
        console.log("User requested psth: "+req.params.id);
        console.log("Cookie value in routes: "+req.cookies.sessionId);
        console.log('something is called in seeked..');
        var providerResult=[];
        signin.getmemberBySessionId(req.cookies.sessionId).then((userInfo)=>{

            //console.log(userInfo);
            seeker.getPlanListById(userInfo._id).then((bookedPlans)=>{
                bookedPlans.forEach((obj)=>{
                    obj.userInfo = userInfo;
                });


                var providerList=bookedPlans.map(obj=>provider.gettravelplanById(obj.travel_plan_id));


                Promise.all(providerList).then((arrayOfProviderDetails) => {
                    /*console.log("inside promise all-Array of PROVIDERS");
                     console.log(arrayOfProviderDetails);*/
                    /*console.log("inside promise all-Array of SEEKERS:");
                     console.log(arrayOfSeekers);*/
                    var i=0;
                    bookedPlans.forEach((bookedObj)=>{

                        var resultObj = arrayOfProviderDetails;
                        /* console.log("inside looping and RESULT OBJ and value of i"+ i);
                         console.log(resultObj[i]);*/
                        bookedObj.travelPlanInfo=resultObj[i];
                        i++;
                    });



                    var seekerList=bookedPlans.map(obj=>provider.getseekerListByTravelPlan(obj.travel_plan_id));
                    Promise.all(seekerList).then((arrayOfSeekerLIST) => {
                        /*console.log("SEEKER LIST");
                         console.log(arrayOfSeekerLIST);*/

                        var k=0;
                        bookedPlans.forEach((bookedObj)=>{

                            var resultSeeker = arrayOfSeekerLIST;
                            /*console.log("inside looping and RESULT OBJ and value of i"+ k);
                             console.log(resultSeeker[k]);*/
                            bookedObj.totalBooked=resultSeeker[k].totalBooked;
                            bookedObj.totalSeatsLeft=bookedObj.travelPlanInfo.seats_offered-bookedObj.totalBooked;
                            k++;
                        });



                        var carDetails=bookedPlans.map(obj=>signin.getcarInfo(obj.travelPlanInfo.car_id));

                        Promise.all(carDetails).then((carDetailsArray) => {
                            /* console.log("CAR DETAILS ARRAY");
                             console.log(carDetailsArray);*/
                            var resultCarDetails=carDetailsArray;
                            var m=0;
                            // console.log(resultCarDetails[0].name);
                            bookedPlans.forEach((objForCar)=>{
                                objForCar.providerCarName=resultCarDetails[m].name;
                                m++;
                            });



                            var ProviderInfo=bookedPlans.map(obj=>signin.getmemberById(obj.travelPlanInfo.member_id));

                            Promise.all(ProviderInfo).then((providerInfoList)=>{
                                //console.log("inside provider info");
                                /*console.log("PROVIDER LIST is here");
                                 console.log(providerInfoList);*/
                                var result=providerInfoList;
                                var historySeekerList=[];

                                var j=0;
                                bookedPlans.forEach((bookObj)=>{
                                    bookObj.providerFirstName=result[j].first_name;
                                    bookObj.providerLastName=result[j].last_name;
                                    bookObj.providerImg=result[j].image_path;
                                    bookObj.providerGender=result[j].gender;
                                    bookObj.providerEmail=result[j].email;
                                    bookObj.providerPhoneNo=result[j].phone_number;

                                    j++;



                                    /*Date.prototype.addHours= function(h){
                                     this.setHours(this.getHours()+h);
                                     return this;
                                     };
                                     var dateValue = new Date();

                                     if(bookObj.travelPlanInfo.travel_start_time<dateValue){
                                     console.log("current ride is a history");
                                     historySeekerList=bookObj;
                                     }*/

                                });
                                /*console.log("after ALL THE PROMISE");
                                 console.log(bookedPlans);*/

                                function getEpochTime(dateString) {
                                    /* console.log("inside date string")
                                     console.log(dateString);*/
                                    return Date.parse(dateString);
                                }

                                function comparator(firstDate, secondDate) {
                                    /*console.log("inside comparator");
                                     console.log(firstDate);
                                     console.log(secondDate);*/
                                    return getEpochTime(firstDate.travelPlanInfo.travel_start_time) - getEpochTime(secondDate.travelPlanInfo.travel_start_time);
                                }
                                var sortedArray=bookedPlans.sort(comparator);
                                Promise.all(sortedArray).then((array)=>{
                                    /* console.log("SORTED ARRAY");
                                     console.log(array);*/
                                    bookedPlansSorted=array;

                                    res.render("user/profile", {partial:"userProfile-scripts",partials:"seekerList",modals:"seekerModal",userInfo:userInfo,bookedPlan:bookedPlansSorted,checkListValue:"seeked"});
                                });


                            });


                        });



                    });

                });


            }).catch((e)=>{
                console.log(e);
                res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});
            });
        }).catch((e)=>{
            console.log(e); // Error page
            res.render("error/errorpage", {partial:"signin-scripts",invalidUser:true,error:e});
        });
    }
    else
    {
        if(xss(req.params.id) === "profile")
        {
            signin.getmemberBySessionId(req.cookies.sessionId).then((userInfo)=>{
                Promise.all([provider.getcountofTravelPlan(userInfo._id),provider.latestTravelPlan(userInfo._id),seeker.latestBookPlan(userInfo._id)]).then((results)=>{
                    //console.log(results);
                    if(userInfo.ride_provider === 'Y')
                    {
                        if(results[0] >0)
                        {
                            var datevaluePro = new Date(results[1].travel_start_time);
                            var dateDisplayPro = (datevaluePro.getMonth()+1) + '/' + datevaluePro.getDate()+'/'+datevaluePro.getFullYear();
                            if(results[2].count > 0)
                            {
                                signin.getmemberById(results[2].result.member_id).then((memberInfo)=>{
                                    var datevalueSeek = new Date(results[2].result.travel_start_time);
                                    var dateDisplaySeek = (datevalueSeek.getMonth()+1) + '/' + datevalueSeek.getDate()+'/'+datevalueSeek.getFullYear();
                                    res.render("user/profile", {partial:"userProfile-scripts",partials:"notifications",modals:"providerModal", userInfo:userInfo,checkListValue:"profile",
                                        provideCount:results[0],dateRide:dateDisplayPro,seekcount:results[2].count,dateSeek:dateDisplaySeek,seekName:memberInfo.first_name,providerDetail:true,seekerDetail:true,userType:true});
                                }).catch((e)=>{
                                    //console.log(e);
                                    res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});//Technical error
                                })
                            }
                            else
                            {
                                res.render("user/profile", {partial:"userProfile-scripts",partials:"notifications",modals:"providerModal", userInfo:userInfo,checkListValue:"profile",provideCount:results[0],
                                    dateRide:dateDisplayPro,seekcount:0,providerDetail:true,seekerDetail:false,userType:true});
                            }
                        }
                        else
                        {
                            if(results[2].count > 0)
                            {
                                signin.getmemberById(results[2].result.member_id).then((memberInfo)=>{
                                    var datevalueSeek = new Date(results[2].result.travel_start_time);
                                    var dateDisplaySeek = (datevalueSeek.getMonth()+1) + '/' + datevalueSeek.getDate()+'/'+datevalueSeek.getFullYear();
                                    res.render("user/profile", {partial:"userProfile-scripts",partials:"notifications",modals:"providerModal", userInfo:userInfo,checkListValue:"profile",
                                        provideCount:0,seekcount:results[2].count,dateSeek:dateDisplaySeek,seekName:memberInfo.first_name,providerDetail:false,seekerDetail:true,userType:true});
                                }).catch((e)=>{
                                    //console.log(e);
                                    res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});//Technical error
                                })
                            }
                            else
                            {
                                res.render("user/profile", {partial:"userProfile-scripts",partials:"notifications",modals:"providerModal", userInfo:userInfo,checkListValue:"profile",provideCount:0,
                                    seekcount:0,providerDetail:false,seekerDetail:false,userType:true});
                            }
                        }
                    }
                    else
                    {
                        if(results[2].count > 0)
                        {
                            signin.getmemberById(results[2].result.member_id).then((memberInfo)=>{
                                var datevalueSeek = new Date(results[2].result.travel_start_time);
                                var dateDisplaySeek = (datevalueSeek.getMonth()+1) + '/' + datevalueSeek.getDate()+'/'+datevalueSeek.getFullYear();
                                res.render("user/profile", {partial:"userProfile-scripts",partials:"notifications",modals:"providerModal", userInfo:userInfo,checkListValue:"profile",
                                    provideCount:0,seekcount:results[2].count,dateSeek:dateDisplaySeek,seekName:memberInfo.first_name,providerDetail:false,seekerDetail:true,userType:false});
                            }).catch((e)=>{
                                //console.log(e);
                                res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});//Technical error
                            })
                        }
                        else
                        {
                            res.render("user/profile", {partial:"userProfile-scripts",partials:"notifications",modals:"providerModal", userInfo:userInfo,checkListValue:"profile",provideCount:0,
                                seekcount:0,providerDetail:false,seekerDetail:false,userType:false});
                        }
                    }

                }).catch((e)=>{
                    res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});
                })

            }).catch((e)=>{
                res.render("error/errorpage", {partial:"signin-scripts",invalidUser:true,error:e});//Error Page
            });
        }
    }

});
router.post("/seeked", (req, res) => {

    console.log("User requested psth: "+req.params.id);
    console.log("Cookie value in routes: "+req.cookies.sessionId);

    console.log("Cookie value in routes: "+req.body);

    // var member_id =req.cookies.userid;
    var travelplanid = xss(req.body.travel_plan_id);
    var desc=xss(req.body.description);
    var seats = xss(req.body.seats_needed);


    async.series([
        function(callback) {

            signin.getmemberBySessionId(req.cookies.sessionId).then((userObj)=>{
                //seeker.bookPlanwithdetails(member_id,travelplanid,desc,seats).then((newBookedplan)=>{
                seeker.bookPlanwithdetails(userObj._id,travelplanid,desc,seats).then((newBookedplan)=>{
                    callback();
                }).catch((e) => {
                    res.status(500).json({ error: e });
                });
            }).catch((e)=>{
                //Error Page
            });
        },
        function(callback){
            /* console.log("ANU CALL BACK");*/
            console.log("User requested psth: "+req.params.id);
            console.log("Cookie value in routes: "+req.cookies.sessionId);
            console.log('something is called in seeked..');
            var providerResult=[];
            signin.getmemberBySessionId(req.cookies.sessionId).then((userInfo)=>{

                //console.log(userInfo);
                seeker.getPlanListById(userInfo._id).then((bookedPlans)=>{


                    var providerList=bookedPlans.map(obj=>provider.gettravelplanById(obj.travel_plan_id));


                    Promise.all(providerList).then((arrayOfProviderDetails) => {

                        var i=0;
                        bookedPlans.forEach((bookedObj)=>{

                            var resultObj = arrayOfProviderDetails;

                            bookedObj.travelPlanInfo=resultObj[i];
                            i++;
                        });


                        var seekerList=bookedPlans.map(obj=>provider.getseekerListByTravelPlan(obj.travel_plan_id));
                        Promise.all(seekerList).then((arrayOfSeekerLIST) => {
                            /*console.log("SEEKER LIST");
                             console.log(arrayOfSeekerLIST);*/

                            var k=0;
                            bookedPlans.forEach((bookedObj)=>{

                                var resultSeeker = arrayOfSeekerLIST;
                                bookedObj.totalBooked=resultSeeker[k].totalBooked;
                                bookedObj.totalSeatsLeft=bookedObj.travelPlanInfo.seats_offered-bookedObj.totalBooked;
                                k++;
                            });

                            var carDetails=bookedPlans.map(obj=>signin.getcarInfo(obj.travelPlanInfo.car_id));

                            Promise.all(carDetails).then((carDetailsArray) => {
                                /*console.log("CAR DETAILS ARRAY");
                                 console.log(carDetailsArray);*/
                                var resultCarDetails=carDetailsArray;
                                var m=0;
                                bookedPlans.forEach((objForCar)=>{
                                    objForCar.providerCarName=resultCarDetails[m].name;
                                    m++;
                                });



                                var ProviderInfo=bookedPlans.map(obj=>signin.getmemberById(obj.travelPlanInfo.member_id));

                                Promise.all(ProviderInfo).then((providerInfoList)=>{
                                    //console.log("inside provider info");
                                    /*console.log("PROVIDER LIST is here");
                                     console.log(providerInfoList);*/
                                    var result=providerInfoList;
                                    var historySeekerList=[];

                                    var j=0;
                                    bookedPlans.forEach((bookObj)=>{
                                        bookObj.providerFirstName=result[j].first_name;
                                        bookObj.providerLastName=result[j].last_name;
                                        bookObj.providerImg=result[j].image_path;
                                        bookObj.providerGender=result[j].gender;
                                        bookObj.providerEmail=result[j].email;
                                        bookObj.providerPhoneNo=result[j].phone_number;
                                        /*bookObj.providerCarName=result[j].car_name;*/
                                        j++;
                                        //console.log("at the last 2nd PROMISE");
                                        //console.log(bookObj);


                                        /*Date.prototype.addHours= function(h){
                                         this.setHours(this.getHours()+h);
                                         return this;
                                         };
                                         var dateValue = new Date();

                                         if(bookObj.travelPlanInfo.travel_start_time<dateValue){
                                         console.log("current ride is a history");
                                         historySeekerList=bookObj;
                                         }*/

                                    });
                                    /*console.log("after ALL THE PROMISE");
                                     console.log(bookedPlans);*/

                                    function getEpochTime(dateString) {
                                        /*console.log("inside date string")
                                         console.log(dateString);*/
                                        return Date.parse(dateString);
                                    }

                                    function comparator(firstDate, secondDate) {
                                        /* console.log("inside comparator");
                                         console.log(firstDate);
                                         console.log(secondDate);*/
                                        return getEpochTime(firstDate.travelPlanInfo.travel_start_time) - getEpochTime(secondDate.travelPlanInfo.travel_start_time);
                                    }
                                    var sortedArray=bookedPlans.sort(comparator);
                                    Promise.all(sortedArray).then((array)=>{
                                        /*console.log("SORTED ARRAY");
                                         console.log(array);*/
                                        bookedPlansSorted=array;

                                        res.render("user/profile", {partial:"userProfile-scripts",partials:"seekerList",modals:"seekerModal",userInfo:userInfo,bookedPlan:bookedPlansSorted,checkListValue:"seeked"});
                                    });

                                });


                            });



                        });

                    });


                }).catch((e)=>{
                    console.log(e);
                    res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});
                });
            }).catch((e)=>{
                console.log(e); //Error Page
                res.render("error/errorpage", {partial:"signin-scripts",invalidUser:true,error:e});
            });
        }
    ], function(error, results) {
        console.log("inside error");
        console.log(results);
        res.render("error/errorpage", {partial:"signin-scripts",invalidUser:true,error:e});
    });

    // travel_plan_id:

    /* var bookplanData = req.body;

     return seeker.bookPlan(bookplanData).then((newBookedplan)=>{
     res.json(newBookedplan);

     }).catch((e) => {
     res.status(500).json({ error: e });
     });
     */








});


module.exports = router;