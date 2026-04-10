const BASE_URL = window.location.origin;

let allRequests = [];
fetch(`${BASE_URL}/api/getformData`,{
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }

})

.then (res => res.json())
.then (allRequestData => { 
allRequests = allRequestData;
console.log("request data from backend received:", allRequests)
requestRetrieval();
renderRequest(requestRetrieval());
})




//need to redefine rowrequest to reflect change from local storage to URL parameter.

const patientDemographics = document.getElementById("patientDemographics")
const clinicalInformation = document.getElementById("clinicalInformation")
const testRequestInformation = document.getElementById("testRequestInformation")
const hospitalInformation = document.getElementById("hospitalInformation")

const rowRequest = new URLSearchParams(window.location.search).get("requestId");
console.log("row request is: ", rowRequest)


requestRetrieval();

function requestRetrieval(){

    const match = allRequests.find(function (item){
     console.log(rowRequest);
     console.log(item.requestId.toString())
    return item.requestId.toString() === rowRequest});

   console.log("match is: ", match)

return match
}


function renderRequest(match){

    renderPatientDemographics();
    function renderPatientDemographics(){

    patientDemographics.innerHTML = 
    `<h2> Patient Demographics </h2> 
    Forename: ${match.Forename} <br>
     Surname: ${match.Surname}   <br>
     Date of Birth: ${match.DateOfBirth} <br>
     Hospital Number: ${match.HospitalNumber} <br>
     NHS Number: ${match.NHSNumber}`

    }

    renderClinicalInformation()
    function renderClinicalInformation(){

    clinicalInformation.innerHTML =
    `<h2> Clinical Information </h2>
    Patient Stability: ${match.PatientStability} <br>
     Bleeding or haemolysing: ${match.BleedingOrHaemolysing} <br>
     Haemoglobin range (g/l): ${match.Hb} <br>
     Clinical details: ${match.ClinicalDetails} <br>
     Patient recently transfused : ${match.PatientTransfusedInLastThreeMonths} <br>
     Date of recent transfusion: ${match.TransfusionDate} <br> ` 
    
     
    }

    renderHospitalInformation()
    function renderHospitalInformation(){
        hospitalInformation.innerHTML = 
        
        `<h2> Hospital Information </h2>
        Requesting Hospital: ${match.HospitalName} <br>
        Laboratory contact number: ${match.LaboratoryContactNumber} <br>
        Grouping results: ${match.ABOGroup} ${match.RhDGroup} <br>
        Serological results: ${match.SerologicalResults} <br> `


    }

    renderTestRequested()
    function renderTestRequested(){
        testRequestInformation.innerHTML =
        `<h2> Test Request Information</h2>
        Test Requested: ${match.TestRequested} <br>
        Additional information provided: ${match.AdditionalInfo} <br>
        Date and Time tests required: ${match.DateRequested} ${match.TimeRequested} <br>
        Sample transportation method: ${match.SampleTransportMethod} <br>
        Expected date and time of sample arrival: ${match.DateOfSampleArrival} ${match.TimeOfSampleArrival}
        `

    }
}

