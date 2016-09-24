var express = require('express');
var router = express.Router();
var data = require("../data");
var seeker = data.seeker;
var provider=data.provider;
var xss = require('xss');

router.get("/list/:id",(req,res) => {
    return seeker.getPlanListById(req.params.id).then((listofPlan) => {
        res.json(listofPlan);
    }).catch((e) => {
            res.status(500).json({ error: e });
    });
});

router.post("/create", (req, res) => {
    var bookplanData = req.body;
    var newBookData=null;
    return seeker.bookPlan(bookplanData).then((newBookedplan)=>{
        console.log(newBookedplan);
        newBookData=newBookedplan;
        console.log("inisde");
        /*return provider.getbookedplanById(newBookedplan.travel_plan_id);
    }).then((travelPlanInfo)=>{
            var seatsAvailable=travelPlanInfo.seats_offered;
            console.log("seats avalible");
            console.log(seatsAvailable);
            var seatsBookedOnCreate=seatsAvailable-newBookData.seats_needed;
            console.log("after booking");
            console.log(seatsBookedOnCreate);
            var updateTravelInfo={
                seats_needed:seatsBookedOnCreate
            }
            return provider.updatePlan(travelPlanInfo._id,updateTravelInfo);
    }).then((finalData)=>{
            console.log("success");
            console.log(finalData);*/
            res.json(newBookedplan);
    /*})*/
        /*res.json(newBookedplan);
        return newBookedplan*/
        /*return provider.getbookedplanById(newBookedplan.travel_plan_id).then((travelPlanInfo)=>{
            var seatsAvailable=travelPlanInfo.seats_offered;
            console.log("seats avalible");
            console.log(seatsAvailable);
            var seatsBookedOnCreate=seatsAvailable-newBookedplan.seats_needed;
            console.log("after booking");
            console.log(seatsBookedOnCreate);
            var updateTravelInfo={
                seats_needed:seatsBookedOnCreate
            }
            return provider.updatePlan(travelPlanInfo._id,updateTravelInfo);
        }).then((finalData)=>{
            console.log("success");
            console.log(finalData);
            res.json(newBookedplan);
        }).catch((e) => {
                res.status(500).json({ error: e });
        });*/
            

    }).catch((e) => {
            res.status(500).json({ error: e });
    });
});

router.put("/update", (req, res) => {
    var updateData = req.body;
    /*console.log("inside routes");
    console.log(updateData);*/
    var bookedPlan = seeker.getbookedplanById(updateData.id);
    bookedPlan.then(()=>{
        return seeker.updatePlan(updateData.id,updateData).then((updatedPlan)=>{
            return updatedPlan;
        })/*.then((dataToUpdateProvider)=>{
            return provider.updatePlan(dataToUpdateProvider.travel_plan_id,updateData);

        })*/.then((successData)=>{
            res.status(200).json({success:true,message:"ride successfuly updates",updatedPlan:successData});
        }).catch((e) => {
            res.status(500).json({ error: true,message:e });
        });
    }).catch(() => {
        res.status(404).json({ error: "Booked Plan not found to update" });
    });
});
/*
router.put("/update/:id", (req, res) => {
    var updateData = req.body;

    var bookedPlan = seeker.getbookedplanById(req.params.id);

    bookedPlan.then(()=>{
        return seeker.updatePlan(req.params.id,updateData).then((updatedPlan)=>{
            res.json(updatedPlan);
        }).catch((e) => {
            res.status(500).json({ error: e });
        });
    }).catch(() => {
        res.status(404).json({ error: "Booked Plan not found to update" });
    });
});*/
router.delete("/delete", (req, res) => {
    var deleteData=req.body;
    var bookedPlan = seeker.getbookedplanById(deleteData.id);

    bookedPlan.then(()=>{
        return seeker.removePlan(deleteData.id).then(()=>{
            res.sendStatus(200);
        }).catch((e) => {
            res.status(500).json({ error: e });
        });
    }).catch(() => {
        res.status(404).json({ error: "Booked Plan not found to delete" });
    });
});



module.exports = router;