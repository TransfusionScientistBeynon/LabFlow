const BASE_URL = window.location.origin;

console.log(BASE_URL)


const params = new URLSearchParams(window.location.search);




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
console.log("request data from backend received:", allRequests)

requestRetrieval(allRequests, rowRequest)
})


}

//need to redefine rowrequest to reflect change from local storage to URL parameter.

const patientDemographics = document.getElementById("patientDemographics")
const clinicalInformation = document.getElementById("clinicalInformation")
const testRequestInformation = document.getElementById("testRequestInformation")
const hospitalInformation = document.getElementById("hospitalInformation")

const rowRequest = new URLSearchParams(window.location.search).get("requestId");
console.log("row request is: ", rowRequest)


 function requestRetrieval(allRequests, rowRequest){
    console.log(allRequests)
    console.log(rowRequest)
    
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
    console.log(formattedDateOfRequest)

    formattedTimeOfRequest = match.timerequested.slice(0,5);
    console.log(formattedTimeOfRequest)

    }


    //Formats transfusion date
    function formatDateofRecentTransfusion(){
            console.log(match.transfusiondate)


        if (match.transfusiondate === null){
            formattedTransfusionDate =  "N/A"

        }else{

            formattedTransfusionDate = new Date(match.transfusiondate).toLocaleDateString("en-GB")

        }
        console.log(formattedTransfusionDate)
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
    <div class="contentHeaderImg"> <img src = "Images/patientDemoSymbol.png" alt="Patient profile image"/> </div>
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
    <div class="contentHeaderImg"> <img src="Images/clinicalInfoSymbol.png" alt="Clinical Notepad"> </div>
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
        <div class="contentHeaderImg"> <img src="Images/hospitalInfoSymbol.png" alt="Hospital symbol">  </div>
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
        <div class="contentHeaderImg"> <img src="Images/testRequestSymbol2.png" alt="Test Request"> </div>
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


   
function goToLabView(){
    window.location.href= "labView.HTML"

}

