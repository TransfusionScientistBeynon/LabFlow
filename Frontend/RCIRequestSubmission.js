const params = new URLSearchParams(window.location.search);
const requestId = params.get("requestId");
console.log(requestId + " This is from the frontend")


let rciRequest = "";
fetch (`http://localhost:3000/api/getformData/${requestId}`)

    .then (res => res.json())
    .then ( requestData => {
        rciRequest = requestData;
        console.log(rciRequest.match)
        updatePage();
});




function updatePage(){

    const requestOutput = 
    document.getElementById("requestOutput");


    // This section of code creates a variable called patient demographics. If the key words from the key of formData object are present the for loop changes the HTML of
    // the demographics section of the page and changes the HTML accordingly. 

    let patientDemographics = [
    "Forename",
    "Surname",
    "DateOfBirth",
    "HospitalNumber",
    "NHSNumber",
    ]

    const patientDemoOutput = 
    document.getElementById("patientDemoOutput");

        let demographicHTML = "";

    for (let [key, value] of Object.entries(rciRequest.match)){
    if (patientDemographics.includes(key)){
        demographicHTML +=  `<p> <strong> ${keyToLabel(key)} </strong> ${value} </p> `
    }

    }

    patientDemoOutput.innerHTML = demographicHTML;

    const clinicalDetailsOutput =
    document.getElementById("clinicalDetailsOutput");

    let formClinicalDetails = [
    "PatientStability",
    "BleedingOrHaemolysing",
    "Hb",
    "ClinicalDetails",
    "PatientTransfusedInLastThreeMonths",
    "TransfusionDate",
    ]

    let clinicalDetailsOutputHTML = "";

    for ([key,value] of Object.entries(rciRequest.match)) {
    if (formClinicalDetails.includes(key)){
        clinicalDetailsOutputHTML += `<p> <strong> ${keyToLabel(key)} </strong> ${value} </p>`

    }

    }

    clinicalDetailsOutput.innerHTML = clinicalDetailsOutputHTML

    let formHospitalDetails = [
    "HospitalName",
    "LaboratoryContactNumber",
    "ABOGroup",
    "RhDGroup",
    "SerologicalResults",
    ] 

    const hospitalDetailsOutput =
    document.getElementById("hospitalDetailsOutput");

    let hospitalDetailsOutputHTML = "";

    for ([key,value] of Object.entries(rciRequest.match)) {
     if (formHospitalDetails.includes(key)){
    
    hospitalDetailsOutputHTML += `<p> <strong> ${keyToLabel(key)} </strong> ${value} </p> `

    }

    }

    hospitalDetailsOutput.innerHTML = hospitalDetailsOutputHTML;

    let formTestDetails = [
    "TestRequested",
    "DateRequested",
    "TimeRequested",
    "UnitsRequired",
    "SpecialRequirements",
    ]

    const testDetailsOutput =
    document.getElementById("testDetailsOutput");

    function keyToLabel(key){ //this function is named and then acts on a parameter called "key " from our formDataArray. Return tells it to return the replaced value of key.
    return key.replace(/([A-Z])/g, ' $1').trim();

    }

    let testDetailsOutputHTML = ""


    for (let [key,value] of Object.entries(rciRequest.match)){

 if (formTestDetails.includes(key)){
        testDetailsOutputHTML += `<p> <strong> ${keyToLabel(key)} </strong> ${value} </p>` //This code inserts the HTML but uses the keyToLabel function to add spaces to key
        


    }

} 

testDetailsOutput.innerHTML = testDetailsOutputHTML;

}
   
function goToLabView(){
    window.location.href= "labView.HTML"

}

