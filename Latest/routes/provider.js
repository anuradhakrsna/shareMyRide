var express = require('express');
var router = express.Router();
var data = require("../data");
var provider = data.provider;
var xss = require('xss');

router.get("/list/:id",(req,res) => {
    return provider.getPlanListById(req.params.id).then((listofPlan) => {
        res.json(listofPlan);
    }).catch((e) => {
            res.status(500).json({ error: e });
    });
});

router.post("/create", (req, res) => {
    var createData = req.body;

    return provider.createPlan(createData).then((newTravelplan)=>{
            res.json({success:true,message:"Ride created successfully!!",travelPlan:createData});
    }).catch((e) => {
            res.json({error:true,message:e,travelPlan:createData});
    });
});

router.put("/update", (req, res) => {
    var updateData = req.body;
    provider.gettravelplanById(updateData.id).then(()=>{
        return provider.updatePlan(updateData.id,updateData).then((updatedPlan)=>{
            res.json({success:true,message:"Sucess",updatedPlan:updatedPlan});
        }).catch((e) => {
            res.status(500).json({ error: true,message:"error" });
        });
    }).catch((e) => {
        res.status(404).json({ error: true,message:"Travel Plan not found to update" });
    });
});

router.delete("/delete", (req, res) => {
    var deleteData=req.body;
    var travelPlan = provider.gettravelplanById(deleteData.id);

    travelPlan.then(()=>{
        return provider.removePlan(deleteData.id).then(()=>{
            res.json({success:true});
        }).catch((e) => {
            res.json({ error: e });
        });
    }).catch((e) => {
        res.json({ error: e });
    });
});

module.exports = router;