let allRequests = [];
let tableDataHTML = ""
fetch("http://localhost:3000/api/getformData",{
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }

})

.then (res => res.json())
.then (allRequestData => { 
allRequests = allRequestData;
console.log("request data from backend received:", allRequests)
renderTable(); // without this the table doesn't render until the page is refreshed. This is because the fetch request is asynchronous and the table is trying to render before the data has been received from the backend. By calling renderTable() after the data has been received, it ensures that the table is rendered with the correct data.

})




// Elements for generating the current date
let currentDate= new Date();
let currentHour = currentDate.getHours();
let currentMinutes = currentDate.getMinutes();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth()+1;
let currentDay = currentDate.getUTCDate();



//Variables made to set sample state in audit trail and for updating UI
const requestState = {
    requestReceived: "Request Received",
    requestSampleReceived : "Sample received in laboratory",
    requestInProgress : "Sample in progress",
    requestComplete :"Complete"


}

const overlay = 
document.getElementById("updateSampleStatus");

const revertStatusReasonInput = document.getElementById ("revertStatusReasonInput")

let reason = revertStatusReasonInput.value;
        console.log(reason)
const valModalBox = document.getElementById("valModalBox")

const tableData =
document.getElementById("tableData");



const modalBox =
document.getElementById("modalBox");
modalBox.hidden=true;

const revertStatusPopUp = 
document.getElementById("revertStatusPopUp")

const modalCheckBox = document.querySelectorAll('input[name="revertStatusInput"]:checked')



/*formData.status = requestState.requestReceived;
formData.requestDisplayStamp = new Date().toLocaleString('en-GB');
formData.auditTrail.push({
            status : requestState.requestReceived,
            timeStamp : new Date()
        })*/




const tableStatus =
document.getElementById("status");



        
       /* allRequests.push(formData); //formData is the parsed version of rcirequest
        localStorage.setItem("allRequests", JSON.stringify(allRequests))
        localStorage.setItem("allHospitalNumbers", JSON.stringify(allHospitalNumbers))
        allRequests.sort() */




    
//This is a sort function which sorts the objects in the allRequests array according to Date and Time. It states that a = date requested and b = time requested and constructs a date/time variable.


// This script works by getting the Rcirequest from the original page and parsing the information into an object stored in form data.
//I then created another storage method which stores all current requests or if there are no requests it makes an array.
// After this I created a function which pushes the previous request into the array thereby storing all current requests.
// At the send of the page the storage is set again and is stringified acting like a loop.





function renderTable(){
    
    tableDataHTML = ""
    tableData.innerHTML = tableDataHTML;

allRequests.sort(function (a,b) {
       
a.DateRequested
a.TimeRequested

b.DateRequested
b.TimeRequested

a.dateTime = `${a.DateRequested} ${a.TimeRequested}`
b.dateTime = `${b.DateRequested} ${b.TimeRequested}`

a.dateTimeObject = new Date(a.dateTime);
b.dateTimeObject = new Date(b.dateTime);

return (a.dateTimeObject) - b.dateTimeObject; 

    });
    allRequests.forEach (function (item) { ///This line states that for each item in the allRequests array add a line in the table
    
    //Table formatting
    if (item.UnitsRequired === undefined || item.UnitsRequired === "" || item.UnitsRequired === null){
        item.UnitsRequired = "N/A"
     }

    
    if (item.status !== requestState.requestComplete){
    tableDataHTML += `<tr> </tr>`;

    tableDataHTML += 
    
    `<tr id=${item.requestId} class="requestRow">
    <td> ${item.Forename} ${item.Surname} </td> 
    <td> ${item.HospitalName} </td> 
    <td> ${item.TestRequested} </td> 
    <td> ${item.UnitsRequired} </td>
    <td> ${item.DateRequested} <br> ${item.TimeRequested} </td>
    <td> ${item.status} <br> ${item.requestDisplayStamp} </td>
    
    <td> 
    <input type="button" value="Request received" id="${item.requestId}" class="requestReceivedButton" data-id="${item.requestId}" data-action="statusChangeToRequestReceived">
    <input type ="button" value="Sample received" id="${item.requestId}" class="sampleReceivedButton" data-id="${item.requestId}" data-action="statusChangeTosampleReceived"> 
    <input type="button" value="In progress" id="${item.requestId}" class="sampleInProgressButton" data-id="${item.requestId}" data-action="statusChangeToSampleInProgress">
    <input type="button" value="Completed" class="requestCompleteButton" id="${item.requestId}" data-id="${item.requestId}" data-action="statusChangeToRequestComplete"> 
     </td>

    </tr>`

    }


});
    tableData.innerHTML = tableDataHTML;


}


//This Table data listener looks for when the user clicks an update button. When the status is updated it gets the buttons id and finds item id within all requests which matches the buttons Id
//Look in the table generated by javascript which shows how it gets the items id.
//I then set conditions so that if the user clicks backwards in status e.g. in progress to sample received it renders a modal box.

    tableData.addEventListener("click" ,(event) => {

    fetch("http://localhost:3000/api/validateStatusChange",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: event.target.dataset.id,
            action: event.target.dataset.action
        })

    })
    .then (res => res.json())
    .then (updateStatusResponse =>  {
        const modalBoxRequestId = updateStatusResponse.requestId
        overlay.dataset.id = modalBoxRequestId;
            console.log(updateStatusResponse)
      
        
        
        if (updateStatusResponse.status === "invalid"){
            renderModalBox();

        
        console.log(updateStatusResponse)
        console.log(updateStatusResponse.requestId)

        }
        
         if (updateStatusResponse.newMatchStatus = requestState.requestComplete){
           const requestToUpdateStatus = updateStatusResponse.requestId
           const newStatus = updateStatusResponse.newMatchStatus

           const foundRequest = allRequests.find(function (item){
              return item.requestId === requestToUpdateStatus;
           });

           foundRequest.status = newStatus
           
           renderTable();
        }
       
         return modalBoxRequestId
    }
    )
    



    function renderModalBox(){

overlay.hidden = true;
    if (overlay.hidden = true ){
        overlay.hidden = false;
        modalBox.hidden = false;
        overlay.classList.add("overlayActive");

    }

renderReasonBox();
}

// When the user clicks on the modal box it either renders the reason box or hides the modal box. When the user clicks submit it updates the requests audit trail.

function renderReasonBox(){

overlay.addEventListener("click", (event) =>{

    
     if (event.target.id === "yes"){
            
        revertStatusPopUp.hidden = false;
           
     }

      if (event.target.id === "no"){
        overlay.hidden = true;
        revertStatusPopUp.hidden = true;
        modalBox.hidden = true;
        valModalBox.hidden = true;
        overlay.classList.remove("overlayActive");
        }

    if (event.target.id === "submitButton"){

    validateReason()
        
    }
});
    }




    //VALIDATE REASON COLLECTS THE INPUT FROM REASON AND IF NO REASON GIVEN IT CREATES AN ERROR MESSAGE
function validateReason(){
    const modalBoxRequestId = overlay.dataset.id



 reason = revertStatusReasonInput.value

 fetch("http://localhost:3000/api/validateModalReason",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            reason,
            modalBoxRequestId
        })

         })
        .then (res => res.json())
    .then (data =>  {
    console.log(data);
    console.log(data.status)

    if (data.status === "invalid"){
        valModalBox.hidden = false;
    
    }

    if (data.status === "valid"){
        valModalBox.hidden = true;
        overlay.hidden = true;
        overlay.classList.remove("overlayActive")
        modalBox.hidden = true;
        resetCheckboxes();

    }
        
    })  

function resetCheckboxes(){

    const auditCheckBoxes = document.querySelectorAll('input[type="checkbox"]')

    auditCheckBoxes.forEach(function (checkbox){
        checkbox.checked = false

    });

}

}

let rowRequest = ""
    if (event.target.type === 'button'){ //This stops the fullrequest loading if when the button is clicked on the row.
        return

    }else{
        const rowClicked = event.target.closest("tr"); //this looks for the nearest table element
    console.log(rowClicked.id)
     rowRequest = rowClicked.id
    
    window.location.href = `labview.viewRequest.HTML?requestId=${rowRequest}` //This takes the request id and adds it as a URL parameter to the new page. This is used to identify which request has been clicked on and to render the correct information on the new page.

    console.log(rowRequest)

    }
    

//This section references the overlay, modal box and reason box. */





      /*  if (event.target.classList.contains ('requestReceivedButton')){
             const buttonId = event.target.id;
              const match = allRequests.find(function (item){
              return item.requestId === buttonId;
        });

       
      
        if (match &&
  (
    match.status === requestState.requestReceived ||
    match.status === requestState.requestSampleReceived ||
    match.status === requestState.requestInProgress
  )
){
            overlay.dataset.id = match.requestId
            renderModalBox();
            

        }
        return;
        }

        if (event.target.classList.contains ('sampleReceivedButton')) {
        const buttonId = event.target.id;

        const match = allRequests.find(function (item){
        return item.requestId === buttonId;
        });
        
        
        if (match && match.status !== requestState.requestReceived ){
           
            if (match.status === requestState.requestInProgress){
                renderModalBox();
                overlay.dataset.id = match.requestId
                console.log (overlay.dataset.id)
            }
           
            match.status = requestState.requestSampleReceived
            match.requestDisplayStamp = new Date().toLocaleString('en-GB');
            match.auditTrail.push({
                status: requestState.requestSampleReceived,
                timeStamp: new Date(),
            })
           
            localStorage.setItem("allRequests",JSON.stringify(allRequests))
        renderTable();
        }
        return;
        }

        if (event.target.classList.contains ('sampleInProgressButton')){
        

        const buttonId = event.target.id;

        const match = allRequests.find(function (item){
        return item.requestId === buttonId;
                
        });

        if (match && match.status !== requestState.requestInProgress){
            match.status = requestState.requestInProgress
            match.requestDisplayStamp = new Date().toLocaleString('en-GB')
            
            match.auditTrail.push({
                status : requestState.requestInProgress,
                timeStamp : new Date()

            })
            localStorage.setItem("allRequests",JSON.stringify(allRequests))
            renderTable();
        }
        return;
        }

        if (event.target.className === 'requestCompleteButton' ){
        

        const buttonId = event.target.id;
        let requestReceivedButtonId = event.target.id;


        const match = allRequests.find(function (item){
        return item.requestId === buttonId;
                
        });
        

        if (match && match.status !== requestState.requestComplete ){
            match.status = requestState.requestComplete
            match.requestDisplayStamp = new Date().toLocaleString('en-GB');
            match.auditTrail.push({
                status: requestState.requestComplete,
                timeStamp: new Date()

            })

            localStorage.setItem("allRequests",JSON.stringify(allRequests))
        renderTable();
        }
        return;
        }
    
    





//This code is going to allow user to view the full request when they click on the request




//Logic for resetting status for debugging 
/*allRequests.forEach(function (item){ 
    item.status = "Request Received"

});

localStorage.setItem("allRequests", JSON.stringify(allRequests));
renderTable(); //

allRequests.forEach (function (item){
    

}); 
//*/
})

function submitNewRequest(){
    window.location.href= "index.HTML"

}