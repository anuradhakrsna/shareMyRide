var express = require('express');
var router = express.Router();
var data = require("../data");
var signin = data.signin;
var fs = require('fs');
var bcrypt = require("bcrypt-nodejs");
var uuid = require('node-uuid');
var xss = require('xss');

router.get("/initial", (req, res) => {
        res.render("signin/initial",{ partial: "signin-scripts"});
})
router.get("/membersign",(req,res)=>{
    res.render("signin/membersignup", {partial:"memberSignup-scripts",createorUpdate:"Y"});
});

router.get("/deletedprofile",(req,res)=>{
    res.render("signin/deleteorlogout", {partial:"signin-scripts",delete:true});
});

router.get("/logout",(req,res)=>{
    if(req.cookies.sessionId)
    {
        var expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() -1);
        res.cookie("sessionId", "", { expires: expiresAt });
        res.clearCookie("sessionId");
    }
    //console.log(req.cookies + " After logged out");
    res.render("signin/deleteorlogout", {partial:"signin-scripts",logout:true});
});

router.get("/memberupdate",(req,res)=>{
   // console.log("Cookie value in memeberupdate: "+ req.cookies.sessionId);
    signin.getmemberBySessionId(req.cookies.sessionId).then((memberInfo)=>{
        if(memberInfo.ride_provider === "Y")
        {
            signin.getcarInfobyMember(memberInfo._id).then((carInfo)=>{
                res.render("signin/membersignup", {partial:"memberSignup-scripts",createorUpdate:"N",firstname: memberInfo.first_name, lastname: memberInfo.last_name, gender: memberInfo.gender, email:memberInfo.email,password:memberInfo.hashedPassword,phone_number:memberInfo.phone_number,dl_number:memberInfo.dl_number,door_no:memberInfo.door_no,apt:memberInfo.apt,street:memberInfo.street_name,city:memberInfo.city,state:memberInfo.state,
            zip:memberInfo.zip,carname:carInfo.name,make_year:carInfo.make_year,regist_number:carInfo.registration_number,color:carInfo.color,checkCar:"Y"});
            }).catch((e)=>{
                res.render("error/errorpage", {partial:"signin-scripts",invalidUser:false,error:e});
            });
        }
        else{
            res.render("signin/membersignup", {partial:"memberSignup-scripts",createorUpdate:"N",firstname: memberInfo.first_name, lastname: memberInfo.last_name, gender: memberInfo.gender, email:memberInfo.email,password:memberInfo.hashedPassword,phone_number:memberInfo.phone_number,dl_number:memberInfo.dl_number,door_no:memberInfo.door_no,apt:memberInfo.apt,street:memberInfo.street_name,city:memberInfo.city,state:memberInfo.state,
            zip:memberInfo.zip,checkCar:"N"});
        }
    }).catch((e)=>{
        res.render("error/errorpage", {partial:"signin-scripts",invalidUser:true,error:e});
    })
});

router.post("/validateUser",(req, res) => {
    var userData = req.body;
    /*console.log("inside validate user");
    console.log(userData);*/
    var checkUser = signin.checkUser(userData.email,"Y");

    checkUser.then((value) => {
        return signin.validateUser(userData).then((memberObj)=>{
            bcrypt.compare(userData.password, memberObj.hashedPassword, function(err, response) {
                    if (response === true) {
                       //console.log("hash matched" + memberObj._id);
                       memberObj.sessionId = uuid.v4(); // setting the session ID once the user name and password matches.
                       signin.updateSession(memberObj).then((updatedObj)=>{
                           res.cookie("sessionId",updatedObj.sessionId);
                           res.json({ success: true});
                       }).catch((e)=>{
                           res.json({ error: true, message:"Error in validating a user information"});
                       }); 
                    } else {
                        res.json({ error: true, message:"Invalid credentials"});
                    }
                })
        }).catch((e)=>{
            res.json({ error: true, message:e});
        })

    }).catch((e) => {
        res.json({ error: true, message:e});
    });
    
});

router.post("/memberSignup", (req, res) => {
    var signupData = req.body;
    
    if(signupData.createorUpdateBack === 'Y')
    {
        var checkUser = signin.checkUser(signupData.email,"N");        
        checkUser.then(() => {
        return signin.addMember(signupData.firstname,signupData.lastname,signupData.gender,signupData.email,signupData.password,signupData.phone_number,
                            signupData.dl_number,signupData.door_no,signupData.apt,signupData.street,signupData.city,signupData.state,signupData.zip,signupData.image,
                            signupData.carname,signupData.make_year,signupData.regist_number,signupData.color,signupData.checkCar
        ).then((newMember)=>{
            if(signupData.checkCar === 'Y')
            res.render("signin/membersignup",{ success: true,result:"You have been successfully added ! Please sign in again !",createorUpdate:"Y",partial:"memberSignup-scripts",firstname: xss(newMember[0].first_name), lastname: xss(newMember[0].last_name), gender: newMember[0].gender, email:xss(newMember[0].email),password:newMember[0].hashedPassword,phone_number:xss(newMember[0].phone_number),dl_number:xss(newMember[0].dl_number),door_no:xss(newMember[0].door_no),apt:xss(newMember[0].apt),street:xss(newMember[0].street_name),city:xss(newMember[0].city),state:xss(newMember[0].state),
            zip:xss(newMember[0].zip),carname:xss(newMember[1].name),make_year:xss(newMember[1].make_year),regist_number:xss(newMember[1].registration_number),
            color:xss(newMember[1].color),checkCar:signupData.checkCar});
            else
            res.render("signin/membersignup",{ success: true,result:"You have been successfully added ! Please sign in again !",createorUpdate:"Y",partial:"memberSignup-scripts",firstname: xss(newMember.first_name), lastname: xss(newMember.last_name), gender: newMember.gender, email:xss(newMember.email),password:newMember.hashedPassword,phone_number:xss(newMember.phone_number),dl_number:xss(newMember.dl_number),door_no:xss(newMember.door_no),apt:xss(newMember.apt),street:xss(newMember.street_name),city:xss(newMember.city),state:xss(newMember.state),
            zip:xss(newMember.zip),checkCar:signupData.checkCar});

        }).catch((e) => {
            if(!(signupData.image.indexOf("default")>-1))
            fs.unlink(signupData.image);
                res.render("signin/membersignup",{error:e,message:e,createorUpdate:"Y",partial:"memberSignup-scripts",firstname: xss(signupData.firstname), lastname: xss(signupData.lastname), gender: signupData.gender, email:xss(signupData.email),password:signupData.password,
                phone_number:xss(signupData.phone_number),dl_number:xss(signupData.dl_number),door_no:xss(signupData.door_no),apt:xss(signupData.apt),street:xss(signupData.street),city:xss(signupData.city),state:xss(signupData.state),
                zip:xss(signupData.zip),carname:xss(signupData.carname),make_year:xss(signupData.make_year),regist_number:xss(signupData.regist_number),color:xss(signupData.color),checkCar:signupData.checkCar});
        });
        }).catch((e) => {
            if(!(signupData.image.indexOf("default")>-1))
            fs.unlink(signupData.image);
            res.render("signin/membersignup",{error: e,partial:"memberSignup-scripts",createorUpdate:"Y",firstname: xss(signupData.firstname), lastname: xss(signupData.lastname), gender: signupData.gender, email:xss(signupData.email),password:signupData.password,
            phone_number:xss(signupData.phone_number),dl_number:xss(signupData.dl_number),door_no:xss(signupData.door_no),apt:xss(signupData.apt),street:xss(signupData.street),city:xss(signupData.city),state:xss(signupData.state),
            zip:xss(signupData.zip),carname:xss(signupData.carname),make_year:xss(signupData.make_year),regist_number:xss(signupData.regist_number),color:xss(signupData.color),checkCar:signupData.checkCar});
        return;
        });
    }
    else
    {
        return signin.getmemberBySessionId(req.cookies.sessionId).then((member)=>{
                return signin.updateMember(member._id,signupData.firstname,signupData.lastname,signupData.gender,signupData.email,signupData.password,signupData.phone_number,
                            signupData.dl_number,signupData.door_no,signupData.apt,signupData.street,signupData.city,signupData.state,signupData.zip,signupData.image,
                            signupData.carname,signupData.make_year,signupData.regist_number,signupData.color,signupData.checkCar,member.image_path
            ).then((updatedMember)=>{
                    if(signupData.checkCar === 'Y')
                     res.render("signin/membersignup",{ success: true,result:"Your information is updated successfully ! Please sign in again !",createorUpdate:"N",partial:"memberSignup-scripts",firstname: xss(updatedMember[0].first_name), lastname: xss(updatedMember[0].last_name), gender: updatedMember[0].gender, email:xss(updatedMember[0].email),password:updatedMember[0].hashedPassword,phone_number:xss(updatedMember[0].phone_number),dl_number:xss(updatedMember[0].dl_number),door_no:xss(updatedMember[0].door_no),apt:xss(updatedMember[0].apt),street:xss(updatedMember[0].street_name),city:xss(updatedMember[0].city),state:xss(updatedMember[0].state),zip:xss(updatedMember[0].zip),carname:xss(updatedMember[1].name),make_year:xss(updatedMember[1].make_year),regist_number:xss(updatedMember[1].registration_number),
                        color:xss(updatedMember[1].color),checkCar:signupData.checkCar});
                    else
                        res.render("signin/membersignup",{ success: true,result:"Your information is updated successfully ! Please sign in again !",createorUpdate:"N",partial:"memberSignup-scripts",firstname: xss(updatedMember.first_name), lastname: xss(updatedMember.last_name), gender: updatedMember.gender, email:xss(updatedMember.email),password:updatedMember.hashedPassword,phone_number:xss(updatedMember.phone_number),dl_number:xss(updatedMember.dl_number),door_no:xss(updatedMember.door_no),apt:xss(updatedMember.apt),street:xss(updatedMember.street_name),city:xss(updatedMember.city),state:xss(updatedMember.state),
                        zip:xss(updatedMember.zip),checkCar:signupData.checkCar});
        }).catch((e) => {
            if(signupData.image)
            if(!(signupData.image.indexOf("default")>-1))
            fs.unlink(signupData.image);
            res.render("signin/membersignup",{error:e,message:e,createorUpdate:"N",partial:"memberSignup-scripts",firstname: xss(signupData.firstname), lastname: xss(signupData.lastname), gender: signupData.gender, email:xss(signupData.email),password:signupData.password,
            phone_number:xss(signupData.phone_number),dl_number:xss(signupData.dl_number),door_no:xss(signupData.door_no),apt:xss(signupData.apt),street:xss(signupData.street),city:xss(signupData.city),state:xss(signupData.state),
            zip:xss(signupData.zip),carname:xss(signupData.carname),make_year:xss(signupData.make_year),regist_number:xss(signupData.regist_number),color:xss(signupData.color),checkCar:signupData.checkCar});
        });
        }).catch((e) => {
            if(signupData.image)
            if(!(signupData.image.indexOf("default")>-1))
            fs.unlink(signupData.image);
            res.render("error/errorpage", {partial:"signin-scripts",invalidUser:true,error:e});
        });
    }
    
});

router.delete("/delete", (req, res) => {
    var member = signin.getmemberBySessionId(req.cookies.sessionId);
    member.then((memberObj)=>{
        return signin.removeMember(memberObj._id).then(()=>{
            if(req.cookies.sessionId)
            {
                var expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() -1);
                res.cookie("sessionId", "", { expires: expiresAt });
                res.clearCookie("sessionId");
            }
            res.json({success:true});
        }).catch((e) => {
            res.json({ error: e });
        });
    }).catch((e) => {
        res.render("error/errorpage", {partial:"signin-scripts",invalidUser:true,error:e});
    });
});


module.exports = router;