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
console.log(match)
    renderPatientDemographics();
    function renderPatientDemographics(){

    patientDemographics.innerHTML = 
    `<h2> Patient Demographics </h2> 
    Forename: ${match.forename} <br>
     Surname: ${match.surname}   <br>
     Date of Birth: ${match.date_of_birth} <br>
     Hospital Number: ${match.hospital_number} <br>
     NHS Number: ${match.nhs_number}`

    }

    renderClinicalInformation()
    function renderClinicalInformation(){

    clinicalInformation.innerHTML =
    `<h2> Clinical Information </h2>
    Patient Stability: ${match.patientstability} <br>
     Bleeding or haemolysing: ${match.bleedingorhaemolysing} <br>
     Haemoglobin range (g/l): ${match.hb} <br>
     Clinical details: ${match.clinicaldetails} <br>
     Patient recently transfused : ${match.patienttransfusedinlastthreemonths} <br>
     Date of recent transfusion: ${match.transfusiondate} <br> ` 
    
     
    }

    renderHospitalInformation()
    function renderHospitalInformation(){
        hospitalInformation.innerHTML = 
        
        `<h2> Hospital Information </h2>
        Requesting Hospital: ${match.hospitalname} <br>
        Laboratory contact number: ${match.laboratorycontactnumber} <br>
        Grouping results: ${match.abogroup} ${match.rhdgroup} <br>
        Serological results: ${match.serologicalresults} <br> `


    }

    renderTestRequested()
    function renderTestRequested(){
        testRequestInformation.innerHTML =
        `<h2> Test Request Information</h2>
        Test Requested: ${match.testrequested} <br>
        Additional information provided: ${match.additionalinfo} <br>
        Date and Time tests required: ${match.daterequested} ${match.timerequested} <br>
        Sample transportation method: ${match.sampletransportmethod} <br>
        Expected date and time of sample arrival: ${match.dateofsamplearrival} ${match.timeofsamplearrival}
        `

    }
}

