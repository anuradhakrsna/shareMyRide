(function ($,location,localStorage) {

    /*To display the menu item dynamically */
    var liProfile=$("#li-profile");
	var liProvided=$("#li-provided");
	var liSeeked=$("#li-seeked");
	var liSearch=$("#li-search");

    if($("#checkLivalue").val() === 'profile')
	{
		liProfile.addClass("active");
        liProvided.removeClass("active");
        liSeeked.removeClass("active");
        liSearch.removeClass("active");
	}
    else if($("#checkLivalue").val() === 'provided')
    {
        liProfile.removeClass("active");
        liProvided.addClass("active");
        liSeeked.removeClass("active");
        liSearch.removeClass("active");
    } 
    else if($("#checkLivalue").val() === 'seeked')
    {
        liProfile.removeClass("active");
        liProvided.removeClass("active");
        liSeeked.addClass("active");
        liSearch.removeClass("active");
    }
    else if($("#checkLivalue").val() === 'search')
    {
        liProfile.removeClass("active");
        liProvided.removeClass("active");
        liSeeked.removeClass("active");
        liSearch.addClass("active");
    }

    /*End of display the menu item dynamically */

    /* For date picker*/
   $('#planDate').datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: '+1d',
        changeMonth: true,
        changeYear: true,
        altField: "#hiddenplanDate",
        altFormat: "yy-mm-dd"
    });

   
/* Create travel plan submit*/
var member_id = $("#memberid").val();


var postSubmit=$("#postSubmit");
var createErrorContainer=$("#create-error-container-p");
var createResultContainer=$("#create-result-container-p");
var createErrorText = $("#create-error-text-p");
var createSuccessText = $("#create-result-text-p");
    
    postSubmit.click(function(event){
    	event.preventDefault();
        createErrorContainer.addClass("hidden");
        createResultContainer.addClass("hidden");
        
    	try
    	{
            
        var sourStreet=$("#sourStreet").val();
        var sourCity=$("#sourCity").val();
        var sourState=$("#sourState").val();
        var destStreet=$("#destStreet").val();
        var destCity=$("#destCity").val();
        var destState=$("#destState").val();
        var planDate=$("#planDate").val();
        var planTime=$("#planTime").val();
        var estTravelTime=$("#estTravelTime").val();
        var noofSeats=$("#noofSeats").val();
        var price=$("#price").val();
        var description=$("#description").val();

        var ett = parseInt(estTravelTime);
        var nos = parseInt(noofSeats);
        var priceInt = parseInt(price);

        if (typeof sourStreet !== "string") throw "Source street field must be a string";
        if (!sourStreet) throw "Source street field cannot be empty";
        if (typeof sourCity !== "string") throw "Source city field must be a string";
        if (!sourCity) throw "Source city field cannot be empty";
        if (typeof sourState !== "string") throw "Source state field must be a string";
        if (!sourState) throw "Source state field cannot be empty";
        if (typeof destStreet !== "string") throw "Destination street field must be a string";
        if (!destStreet) throw "Destination street field cannot be empty";
        if (typeof destCity !== "string") throw "Destination city field must be a string";
        if (!destCity) throw "Destination city field cannot be empty";
        if (typeof destState !== "string") throw "Destination state field must be a string";
        if (!destState) throw "Destination state field cannot be empty";
        if (typeof planDate !== "string") throw "Date of travel field must be a string";
        if (!planDate) throw "Date of travel field cannot be empty";
        if (typeof planTime !== "string") throw "Time of travel field must be a string";
        if (!planTime) throw "Time of travel field cannot be empty";
        if (!estTravelTime) throw "Estimated Travel Time field cannot be empty";
        if (typeof ett !== "number") throw "Estimated Travel Time field must be a number";
        if (!noofSeats) throw "No.of seats field cannot be empty";
        if (typeof nos !== "number") throw "No.of seats field must be a number";
        if (!price) throw "Price per co-passenger field cannot be empty";
        if (typeof priceInt !== "number") throw "Price per co-passenger field must be a number";
        if (!description) throw "description field cannot be empty";

    		var requestConfig = {
                method: "POST",
                url: "/travelplan/create",
                contentType: 'application/json',
                data: JSON.stringify({
                id:member_id,
                source_street: sourStreet,
                source_city:sourCity,
                source_state:sourState,
                destination_street:destStreet,
                destination_city:destCity,
                destination_state:destState,
                planDate:planDate,
                planTime:planTime,
                estimated_travel_time:estTravelTime,
                seats_offered:noofSeats,
                price:price,
                description:description
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if(responseMessage.error){
                    createResultContainer.addClass("hidden");
                  	createErrorText.text(responseMessage.message);
            		createErrorContainer.removeClass("hidden");
                 }else if(responseMessage.success){
                     createErrorContainer.addClass("hidden");
                   	createSuccessText.text(responseMessage.message);
            		createResultContainer.removeClass("hidden");
                    //$("#providerList").load("/user/provided  #providerList");
                    window.location="http://localhost:3000/user/provided";
                 }
                    
             });
    	}catch(e){

    		var message = typeof e === "string" ? e : e.message;
            createResultContainer.addClass("hidden");
            createErrorText.text(e);
            createErrorContainer.removeClass("hidden");
            event.preventDefault();   
    	}

    });

/** End of create travel plan*/

/**Update or delete an existing travel plan */
var selectedProviderListId=$("#providerList li");
var deleteBtnSelected=$("#deleteBtnSubmit");
var updateBtnSubmitSelected=$("#updateBtnSubmit-p");


var idSelected=null;
var seatsProvided=null;
var seatsLeft=null;

selectedProviderListId.click(function(event){
  idSelected=this.id;

  seatsProvided= $(this).attr('seats-offered');
  seatsLeft= $(this).attr('seats-left');
  //alert(idSelected+"    "+seatsProvided);
});

$('[id^="updateBtnSubmit-p-"]').click(function(index) {
        var splitID = this.id.split('-p-');
    event.preventDefault();
    var uprC = "#update-result-container-p-"+splitID[1];
    var upeC = "#update-error-container-p-"+splitID[1];
    var upeT = "#update-error-text-p-"+splitID[1];
    var uprT = "#update-result-text-p-"+splitID[1];

    var updatePlanResultContainer=$(uprC);
    var updatePlanErrorContainer=$(upeC);
    var updatePlanErrorText = $(upeT);
    var updatePlanResultText = $(uprT);

    updatePlanResultContainer.addClass("hidden");
    updatePlanErrorContainer.addClass("hidden");

    
    //var providerTimePlanUpdate=$("#timePlanUpdate-p").val();
    var idseats = "#noOfSteatsUpdate-p-"+splitID[1];
    var idprice = "#priceUpdate-p-"+splitID[1];
    var providerNoOfSeatUpdate=$(idseats).val();
    var providerPriceUpdate=$(idprice).val();
    
    try{
        if(!providerNoOfSeatUpdate && !providerPriceUpdate){
            throw "please enter atleast one of the above values to update !"
        }
        if(providerNoOfSeatUpdate < (seatsProvided-seatsLeft)){
            throw "Already "+(seatsProvided-seatsLeft)+" seats are booked on this plan. please update to "+(seatsProvided-seatsLeft)+ "or higher";
        }

        var requestConfig = {
                method: "PUT",
                url: "/travelplan/update",
                contentType: 'application/json',
                data: JSON.stringify({
                id:splitID[1],
                seats_offered:providerNoOfSeatUpdate,
                price:providerPriceUpdate
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if(responseMessage.success){
                    updatePlanErrorContainer.addClass("hidden");
                    updatePlanResultText.text(responseMessage.message);
            		updatePlanResultContainer.removeClass("hidden");
                    $("#providerList").load("/user/provided  #providerList");
                   // window.location="http://localhost:3000/user/provided";
                }else{
                    updatePlanResultContainer.addClass("hidden");
                    updatePlanErrorText.text(responseMessage.error);
            		updatePlanErrorContainer.removeClass("hidden");   
                }     
             });

    }catch(e){
            var message = typeof e === "string" ? e : e.message;
            alert(e);
            updatePlanResultContainer.addClass("hidden");
            updatePlanErrorText.text(e);
            updatePlanErrorContainer.removeClass("hidden");
           // event.preventDefault(); 
    }
});

$('[id^="rideProUpdate-"]').on('hidden.bs.modal', function (e) {
  $(this)
    .find("input,textarea,select")
       .val('')
       .end()
    .find("input[type=checkbox], input[type=radio]")
       .prop("checked", "")
       .end();
})

$('[id^="deleteBtnSubmit-p-"]').click(function(index) {
        var deleteID = this.id.split('-p-');
        var deletePlanErrorContainer=$("#delete-error-container-p-"+deleteID[1]);
        var deleteplanText=$("#delete-error-text-p-"+deleteID[1]);
        event.preventDefault();
        deletePlanErrorContainer.addClass("hidden");
    try{
        var requestConfig = {
                method: "DELETE",
                url: "/travelplan/delete",
                contentType: 'application/json',
                data: JSON.stringify({
                id:deleteID[1]
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if(responseMessage.success)
                 window.location="http://localhost:3000/user/provided";
                 else{
                     deleteplanText.text(responseMessage.error);
                     deletePlanErrorContainer.removeClass("hidden");
                 }
                //$("#providerList").load("/user/provided  #providerList");     
             });

    }catch(e){
            var message = typeof e === "string" ? e : e.message; 
            deleteplanText.text(message);
            deletePlanErrorContainer.removeClass("hidden"); 
            event.preventDefault();

    }
    
});
/** End of Update or delete an existing travel plan */

/** Update or delete an existing booked plan  */
var SelectedSeekerUl=$("#seeked-ul-list li");
var seekerId=null;
var seekerSeatsProvided=null;
var seekerInfoUpdate=$("#updatebtn-s");
var seekerInfoDelete=$("#deleteBtn-s");
var sErrorContainer=$("#update-error-container-s");
var sErrorText=$("#update-error-text-s");
var sResultConatiner=$("#update-result-container-s");
var sResultText=$("#update-result-text-s");
var updateModalOpen=$("#updateModalOpen");
SelectedSeekerUl.click(function(event){
  seekerId=this.id;
  seekerSeatsProvided= $(this).attr('seats-offered');
  seatsBookedAlready=$(this).attr('seats-needed');
  /*alert(seekerId+"    "+seekerSeatsProvided+"  "+seatsBookedAlready);*/
});



seekerInfoDelete.click(function(event){
    event.preventDefault();
    /*alert(seekerId);*/
    try{

        var requestConfig = {
                method: "DELETE",
                url: "/bookplan/delete",
                contentType: 'application/json',
                data: JSON.stringify({
                id:seekerId
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                console.log("successfully deleted !");
                 /*$("#seeked-ul-list").load("/user/seeked  #seeked-ul-list");*/
                 window.location="http://localhost:3000/user/seeked";
                 /*seekerId=null;*/
                    
             });

    }catch(e){
            var message = typeof e === "string" ? e : e.message;
            
            console.log(e);
            alert(e);
            event.preventDefault();

    }
});

updateModalOpen.click(function(event){
    sErrorContainer.addClass("hidden");
    sResultConatiner.addClass("hidden");
    $("#noOdSeatsUpdate-s").val('');
});

    $('#rideSeekUpdate').on('hidden.bs.modal', function (e) {
        sErrorContainer.addClass("hidden");
        sResultConatiner.addClass("hidden");
        $("#noOdSeatsUpdate-s").val('');
    });


seekerInfoUpdate.click(function(event){
    /*alert("hello");*/
    event.preventDefault();
    sErrorContainer.addClass("hidden");
    sResultConatiner.addClass("hidden");
    var seekerNoOfSeatsUpdate=$("#noOdSeatsUpdate-s").val();

    /*alert(seekerNoOfSeatsUpdate);*/
   /*var totalSeatsToBeBooked=parseInt(seekerNoOfSeatsUpdate)+parseInt(seatsBookedAlready);*/
    
   
    /*alert(totalSeatsToBeBooked);*/
    try{
        if(!seekerNoOfSeatsUpdate){
            throw "Please enter the no of seats needed inorder to Update!";
        }
        if(seekerNoOfSeatsUpdate>parseInt(seekerSeatsProvided)){
            throw "Please choose to enter valid number of seats !"
        }

        var requestConfig = {
                method: "PUT",
                url: "/bookplan/update",
                contentType: 'application/json',
                data: JSON.stringify({
                id:seekerId,
                seats_needed:seekerNoOfSeatsUpdate
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if(responseMessage.success){
                    sErrorContainer.addClass("hidden");
                    sResultText.text(responseMessage.message);
                    sResultConatiner.removeClass("hidden");
                    console.log("successfully Updated !");
                    $("#seeked-ul-list").load("/user/seeked  #seeked-ul-list");
                    window.location="http://localhost:3000/user/seeked";
                }else{
                    console.log("error part after ajax");

                    console.log(responseMessage.error);
                    sResultConatiner.addClass("hidden");
                    sErrorText.text(responseMessage.message);
                    sErrorContainer.removeClass("hidden");

                }
                
                    
             });

    }catch(e){
            var message = typeof e === "string" ? e : e.message;
            
            console.log(e);
            sResultConatiner.addClass("hidden");
            sErrorText.text(e);
            sErrorContainer.removeClass("hidden");
            

    }
    $("#noOdSeatsUpdate-s").val('');
});

/** End of Update or delete an existing travel plan */

/** Delete user account */
var deleteAccount = $("#deleteAccount");
var deleteEContainer=$("#del-account-errorcontainer");
var deleteEText=$("#del-account-error-text");
deleteAccount.click(function(event){
    deleteEContainer.addClass("hidden");
    try{

        var requestConfig = {
                method: "DELETE",
                url: "/signup/delete",
                contentType: 'application/json'
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if(responseMessage.success)
                window.location = "http://localhost:3000/signup/deletedprofile";    
             });

    }catch(e){
            var message = typeof e === "string" ? e : e.message;
            deleteEText.text(e);
            console.log(e);
            deleteEContainer.removeClass("hidden");
            /*event.preventDefault();*/

    }
})
/** End of delete user account */

})(jQuery,window.location,window.localStorage);