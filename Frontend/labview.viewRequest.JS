const BASE_URL = window.location.origin;

let allRequests = [];


retrieveRequestsFromDatabase();

 async function retrieveRequestsFromDatabase(){
fetch(`${BASE_URL}/api/getformData/fullRequestView`,{
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }

})

.then (res => res.json())
.then (allRequestData => { 
allRequests = allRequestData;


requestRetrieval(allRequests, rowRequest)
})


}

//need to redefine rowrequest to reflect change from local storage to URL parameter.

const patientDemographics = document.getElementById("patientDemographics")
const clinicalInformation = document.getElementById("clinicalInformation")
const testRequestInformation = document.getElementById("testRequestInformation")
const hospitalInformation = document.getElementById("hospitalInformation")

const rowRequest = new URLSearchParams(window.location.search).get("requestId");



 function requestRetrieval(allRequests, rowRequest){
 
    
   const match = allRequests.find(item => item.id == rowRequest) // Item.id is an object and row request is a string so had to use unstrict operator
   renderRequest(match);

    
}

function renderRequest(match){
    dobFormatter();
    dateAndTimeRequestsFormatter();
    dateAndTimeOfSampleArrivalFormatter();
    formatDateofRecentTransfusion();
    formattedAdditionalInfo();
    formatNhsNumberandHospitalNumber();

    //FORMATS THE DOB
    function dobFormatter() {
    dob = new Date(match.date_of_birth)
    formattedDob = dob.toLocaleDateString("en-GB")
    }
    //Formats date and time of request
    function dateAndTimeRequestsFormatter(){
    dateRequested = new Date(match.daterequested)
    formattedDateOfRequest = dateRequested.toLocaleDateString("en-GB")
   
    formattedTimeOfRequest = match.timerequested.slice(0,5);
   

    }


    //Formats transfusion date
    function formatDateofRecentTransfusion(){
            


        if (match.transfusiondate === null){
            formattedTransfusionDate =  "N/A"

        }else{

            formattedTransfusionDate = new Date(match.transfusiondate).toLocaleDateString("en-GB")

        }

    }

    //Formats Date and time of sample of arrival
    function dateAndTimeOfSampleArrivalFormatter(){
        dateSampleArrival = new Date(match.dateofsamplearrival)
        formattedDateSampleArrival = dateSampleArrival.toLocaleDateString("en-GB")

        formattedTimeSampleArrival = match.timeofsamplearrival.slice(0,5)

    }

    function formattedAdditionalInfo(){
        if (match.additionalinfo === ""){
            match.additionalinfo = "Not provided"

        }

    }

    function formatNhsNumberandHospitalNumber(){
        if (match.nhs_number === ""){
            match.nhs_number = "Not provided"

        }

        if (match.hospital_number === ""){
            match.hospital_number = "Not provided"

        }

    }

    renderPatientDemographics();
    function renderPatientDemographics(){

    // format dob




    patientDemographics.innerHTML = 
    `  <div class="contentHeader"> 
    <div class="contentHeaderImg"> <img src = "Images/patientDemoSymbol.PNG" alt="Patient profile image"/> </div>
    <div class="contentHeaderHeading"> <h2> Patient Demographics </h2> </div>
    
    </div>

    <div class="sectionContent">
    <ul> 
    <li> <strong> Forename: </strong>  <span> ${match.forename} </span> </li>
     <li> <strong> Surname: </strong> <span> ${match.surname} </span>  </li>
     <li> <strong> Date of Birth: </strong> <span> ${formattedDob} </span> </li>
    <li>  <strong> Hospital Number: </strong> <span> ${match.hospital_number} </span> </li>
     <li> <strong> NHS Number: </strong> <span> ${match.nhs_number} </span> </li>
    </ul>
    </div>
    `
    
    }

    renderClinicalInformation()
    function renderClinicalInformation(){

    clinicalInformation.innerHTML =
    `<div class="contentHeader"> 
    <div class="contentHeaderImg"> <img src="Images/clinicalInfoSymbol.PNG" alt="Clinical Notepad"> </div>
    <div class="contentHeaderHeading">  <h2> Clinical Information </h2> </div> </div>

    <div class="sectionContent">
    <ul>
    <li> <strong> Patient Stability: </strong> <span> ${match.patientstability} </span>  </li>
    <li> <strong> Bleeding or haemolysing: </strong> <span>${match.bleedingorhaemolysing}</span> </li>
    <li> <strong> Haemoglobin range (g/l): </strong> <span>${match.hb} </span></li>
    <li> <strong> Clinical details: </strong> <span> ${match.clinicaldetails}</span> </li>
    <li> <strong> Recently transfused: </strong> <span>${match.patienttransfusedinlastthreemonths}</span> </li>
    <li> <strong> Date of recent transfusion: </strong> <span> ${formattedTransfusionDate} </span> </li>
     </ul> 
     </div>
     ` 
    
     
    }

    renderHospitalInformation()
    function renderHospitalInformation(){
        hospitalInformation.innerHTML = 
        
        `
        <div class="contentHeader">
        <div class="contentHeaderImg"> <img src="Images/hospitalInfoSymbol.PNG" alt="Hospital symbol">  </div>
        <div class="contentHeaderHeading"> <h2> Hospital Information </h2> </div>
        </div>


        <div class="sectionContent">
        <ul>
        <li> <strong> Requesting Hospital: </strong> <span> ${match.hospitalname} </span> </li>
        <li> <strong>Laboratory contact number: </strong> <span> ${match.laboratorycontactnumber} </span> </li>
        <li> <strong>Grouping results: </strong> <span> ${match.abogroup} ${match.rhdgroup} </span> </li>
        <li> <strong> Serological results: </strong> <span> ${match.serologicalresults} </span> </li>
        <li> <strong> Sample transportation: </strong> <span> ${match.sampletransportmethod} </span> </li>
        <li> <strong> Sample expected by: </strong> <span> ${formattedDateSampleArrival} ${formattedTimeSampleArrival} </span> </li>
        </ul>
        </div>
        `


    }

    renderTestRequested()
    function renderTestRequested(){
        testRequestInformation.innerHTML =
        `
        <div class="contentHeader">
        <div class="contentHeaderImg"> <img src="Images/testRequestSymbol2.PNG" alt="Test Request"> </div>
        <div class="contentHeaderHeading"> <h2> Test Request Information</h2> </div>
        </div>

        <div class="sectionContent">
        <ul>
        <li> <strong> Test Requested: </strong> <span> ${match.testrequested} </span> </li>
        <li> <strong> No of units required </strong> <span> ${match.unitsrequired} </span> </li>
        <li> <strong> Additional information provided: </strong> <span> ${match.additionalinfo} </span> </li>
        <li> <strong> Date and time test required: </strong> <span> ${formattedDateOfRequest} ${formattedTimeOfRequest} </span> </li>
        <li> <strong> Current request status: </strong> <span> ${match.request_status} </span>
        
        </div>
        `

    }
}




const communicationLogDate = document.getElementById("communicationLogDate")
const communicationLogTime = document.getElementById("communicationLogTime")
const communicationLogForm = document.getElementById("communicationLogForm")
const communicationLogName = document.getElementById("communicationLogName")
const communicationLogDetails = document.getElementById("communicationLogDetails")
const communicationLogAction = document.getElementById("communicationLogAction")
const communicationLogSuccessful = document.getElementById("communicationLogSuccessful")



let totalClicks = 1

console.log(totalClicks)

function openCommunicationLog(communicationLogDate, communicationLogTime, communicationLogForm){
    totalClicks++;
    console.log(totalClicks)
    communicationLogSuccessful.hidden=true;

    if (totalClicks % 2 === 0){
        communicationLogForm.classList.remove("communicationLogFormInactive")
        communicationLogForm.classList.add("communicationLogForm")

    }else{
        communicationLogForm.classList.add("communicationLogFormInactive")
        communicationLogForm.classList.remove("communicationLogForm")

    }

    date = new Date()

    const today =
    date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");

    time = date.toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"})

    communicationLogDate.value = today
    communicationLogTime.value = time

}

async function submitCommunicationlog(){

const communicationLogData = {
    Date: communicationLogDate.value,
    Time: communicationLogTime.value,
    Contact_Name: communicationLogName.value,
    Conversation_Details: communicationLogDetails.value,
    Action: communicationLogAction.value

}

    if (communicationLogDate.value === "" || communicationLogTime.value === "" || communicationLogName.value === "" || communicationLogDetails.value === "" || communicationLogAction.value === "") {
        document.getElementById("communicationLogValidation").hidden = false;
}else{
    document.getElementById("communicationLogValidation").hidden = true;
    const requestId = new URLSearchParams(window.location.search).get("requestId")
    console.log(requestId)
    const token = await window.getAuth0Token()
    console.log(token)
    

const response =  await fetch(`/api/communicationLog/${requestId}`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },

body: JSON.stringify(communicationLogData)


})

console.log(await response.status)
if (await response.status === 200){
    totalClicks++
communicationLogForm.classList.add("communicationLogFormInactive")
communicationLogSuccessful.hidden = false;
}



}










}

function getCommunicationLogView(){
    const requestId = new URLSearchParams(window.location.search).get("requestId")

    window.location.href = `communicationLogView.html?requestId=${requestId}`

}

function getAuditTrailView(){

    const rowRequest = new URLSearchParams(window.location.search).get("requestId");

    window.location.href = `auditTrail.html?requestId=${rowRequest}`

}