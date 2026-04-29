// script.js
const BASE_URL = window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login").addEventListener("click", window.login);


    //Creation of Website state and allows const to be updated depending on user input

let state = {
    stability: "",
    hb: "",
    testRequest: "",
    recentTx: "",
    antigenR: "",


    showBackupWarning:false,
    showTxDate:false,
    showCrossmatch:false,
    showDateTimeRequired:false,

};


//Modal Box for alerts
const overlay = 
document.getElementById("overlay")


const modalBox=
document.getElementById("modalBox")

const confirmAdviceReadBox =
document.getElementById("confirmAdviceReadBox")


// These are elements required for state
const dtrq= 
    document.getElementById("dtrq"); 

const dtrqDate =
    document.getElementById("dtrqDate");

const dtrqTime =
    document.getElementById("dtrqTime");

const patientStability = 
document.getElementById("patientStability");

const currentHb = 
document.getElementById("currentHb");

const clinicalInfoInput =
document.getElementById ("clinicalInfoInput");

const recentTxInput = 
document.getElementById ("recentTxInput");

const testRequestSelect = 
document.getElementById("testRequestSelect");

const unitno = 
document.getElementById("unitno");

const spqr = 
document.getElementById("spqr");

const antigenR = 
document.getElementById("antigenR");

const datetx = 
document.getElementById("datetx");

const datetxinput=
document.getElementById ("datetxinput");

const bleedinghaemolysis=
document.getElementById("bleedinghaemolysis");

const crossmatchInfo=
document.getElementById("crossmatchInfo");
crossmatchInfo.hidden = true;

const currentHbInput =
document.getElementById("currentHbInput");

const hospitalNameList =
document.getElementById("hospitalNameList")

const labContactNumberInput =
document.getElementById("labContactNumberInput");

const aboGroupInput =
document.getElementById("aboGroupInput");

const rhdGroupInput=
document.getElementById("rhdGroupInput");

const serologicalResultsInput=
document.getElementById("serologicalResultsInput")

const unitNoInput=
document.getElementById("unitNoInput");

const sampleTransportInput = 
document.getElementById("sampleTransportInput")

const dateSampleArrival = 
document.getElementById("dateSampleArrival")

const timeSampleArrival =
document.getElementById("timeSampleArrival")

const additionalInformationInput =
document.getElementById("additionalInformationInput")

//Elements for validation of request form

const dobInput =
document.getElementById("dobInput");

let hospNoInput= 
document.getElementById("hospNoInput");

let nhsNomInput=
document.getElementById("nhsNomInput");



let forenameInput=
document.getElementById("forenameInput");

let surnameInput=
document.getElementById("surnameInput");

const valHospNo= 
document.getElementById("valHospNo");
valHospNo.hidden=true;

const valNhsNo=
document.getElementById("valNhsNo");
valNhsNo.hidden = true;

const valDob=
document.getElementById("valDob");

const valRecentTx=
document.getElementById("valRecentTx");
valRecentTx.hidden = true;

const valDemo = document.getElementById("valDemo");
valDemo.hidden = true;

const valForename = document.getElementById ("valForename");
valForename.hidden = true;

const valSurname = document.getElementById("valSurname");
valSurname.hidden = true;

const valStability=
document.getElementById("valStability");
valStability.hidden=true;

const valBleeding=
document.getElementById("valBleeding");
valBleeding.hidden=true;

const valCurrentHb=
document.getElementById("valCurrentHb");
valCurrentHb.hidden=true;

const valClinicalInfo = 
document.getElementById ("valClinicalInfo");


const valTx3Month=
document.getElementById("valTx3Month");


const valHospitalName=
document.getElementById("valHospitalName")
valHospitalName.hidden = true;

const valAboGroup = 
document.getElementById("valAboGroup");
valAboGroup.hidden = true;

const valRhDGroup =
document.getElementById("valRhDGroup");
valRhDGroup.hidden=true;

const valContactNumber =
document.getElementById("valContactNumber")
valContactNumber.hidden = true;

const valSerologicalResults =
document.getElementById("valSerologicalResults");
valSerologicalResults.hidden=true;


const valTestRequest=
document.getElementById("valTestRequest");
valTestRequest.hidden=true;

const valDtrq=
document.getElementById("valDtrq");
valDtrq.hidden = true;

const valUnitNo = 
document.getElementById("valUnitNo");
valUnitNo.hidden = true;

const valSpqr =
document.getElementById("valSpqr");
valSpqr.hidden=true;












//Updates values of stability, Hb, test request and transfusion status when user changes the page and runs the relevant
overlay.addEventListener("click", function(){
    if (overlay.classList.contains("overlayActive") && modalBox.classList.contains("modalBoxActive")){
        hideBackupAlert();

    }

});


patientStability.addEventListener("change", function(){
    confirmAdviceReadBox.checked = false;
    state.stability = patientStability.value;
    
    alertRule();

});




recentTxInput.addEventListener("change", function(){
    state.recentTx = recentTxInput.value;
    runRules();


});

testRequestSelect.addEventListener("change", function(){
    state.testRequest = testRequestSelect.value;
    runRules();
});






// Event listeners for form validation and hospital search

hospNoInput.addEventListener("blur", validateForm);
nhsNomInput.addEventListener ("blur", validateForm);
dobInput.addEventListener ("blur", validateForm);
datetxinput.addEventListener("input",validateRecentTxDate);
forenameInput.addEventListener("blur", validateForename);
surnameInput.addEventListener("blur", validateSurname);
patientStability.addEventListener("blur",validateStability);
bleedinghaemolysis.addEventListener("blur",validateBleeding);
currentHbInput.addEventListener("blur", validateCurrentHb);
clinicalInfoInput.addEventListener("blur", validateClinicalDetails);
recentTxInput.addEventListener("blur", validateRecentTx3month);
hospitalNameList.addEventListener("blur", validateHospitalName);
labContactNumberInput.addEventListener("blur", validateLabContactNumber);
aboGroupInput.addEventListener("blur", validateAboGroup);
rhdGroupInput.addEventListener("blur", validateRhdGroup);
serologicalResultsInput.addEventListener("blur", validateSerologicalResults);
testRequestSelect.addEventListener("blur", validateTestRequest);
dtrqDate.addEventListener("blur", validateDtrq);
dtrqTime.addEventListener("blur", validateDtrq);
unitNoInput.addEventListener("blur", validateUnitNo);



//Functions for Form Validation

function validateForename() {

if (!forenameInput.value){
    valForename.hidden=false;
}else{
    valForename.hidden=true;

}

}

function validateSurname() {

    if (!surnameInput.value){
        valSurname.hidden=false;
    } else {
        valSurname.hidden=true;
    }

}

function validateStability(){
    if (!state.stability){
        valStability.hidden = false;

    }else{
        valStability.hidden=true;

    }


}

function validateBleeding(){
    if (!bleedinghaemolysis.value){
        valBleeding.hidden= false;

    } else {
        valBleeding.hidden=true;
    }

}

function validateCurrentHb(){
    if (!currentHbInput.value){
        valCurrentHb.hidden = false;

    }else{
        valCurrentHb.hidden = true;
    }
}

function validateClinicalDetails(){
    if (!clinicalInfoInput.value){
        valClinicalInfo.hidden = false;

    }else{
        valClinicalInfo.hidden = true;

    }

}

function validateRecentTx3month(){
    if (!recentTxInput.value){

        valTx3Month.hidden = false;

    }else{
        valTx3Month.hidden = true;

    }

}



function validateRecentTxDate(){

    let recentTxDate = new Date(datetxinput.value);
    let getTodaysDate = new Date();

    
    if (!datetxinput.value) {
        valRecentTx.hidden = true;
        return;
    }
    


        if  (recentTxDate > getTodaysDate){
                    valRecentTx.hidden = false; 
                    }else{
                        valRecentTx.hidden = true; 
                    }

                }


function validateHospitalName(){
    if (!hospitalNameList.value){
        valHospitalName.hidden = false;

    }else{
        valHospitalName.hidden = true;
    }
}

function validateLabContactNumber(){
    if (!labContactNumberInput.value) {
        valContactNumber.hidden = false;

    }else{
        valContactNumber.hidden = true;

    }
}

function validateAboGroup(){
    if (!aboGroupInput.value){
        valAboGroup.hidden = false;
    }else{
        valAboGroup.hidden= true;
    }

}

function validateRhdGroup(){
    if (!rhdGroupInput.value){
        valRhDGroup.hidden = false;

    }else{
        valRhDGroup.hidden = true;

    }

}

function validateSerologicalResults(){
    if (serologicalResultsInput.value.trim().length <2 || 
        !serologicalResultsInput ){
        valSerologicalResults.hidden = false;

    }else{
        valSerologicalResults.hidden = true;

    }

}

function validateTestRequest(){
    if (!testRequestSelect.value){
    valTestRequest.hidden=false;

    }else{
        valTestRequest.hidden=true;

    }


}

function validateDtrq(){
    if (!dtrqDate.value || !dtrqTime.value){
        valDtrq.hidden = false;

    }else{
        valDtrq.hidden= true;    
    }

}

function validateUnitNo(){

    if (crossmatchInfo.hidden){
        return;

    }
    if (!unitNoInput.value){
        valUnitNo.hidden = false;

    }else{
        valUnitNo.hidden = true;

    }

}



    spqr.addEventListener("change", validateSpqr);



function validateSpqr(){
    if (crossmatchInfo.hidden){
        return;
    }
    const checkedboxes = document.querySelectorAll('input[name="spqrBoxes"]:checked');

    if (checkedboxes.length >0) {
        valSpqr.hidden = true;

    }else{
        valSpqr.hidden = false;

    }
   
}



function validateForm() {
        let getTodaysDate = new Date();
        let dob = new Date(dobInput.value);

    if (nhsNomInput.value.trim().length >=1 && 
      nhsNomInput.value.trim().length <=9) {
        valNhsNo.hidden = false;
    } else {

        valNhsNo.hidden = true;
    }

    if (hospNoInput.value.trim().length <1 && 
        nhsNomInput.value.trim().length <1) {
            
            valDemo.hidden=false;
        }else{
            valDemo.hidden=true;

        }

    if (!dob.getDate() ||  dob > getTodaysDate){
        valDob.hidden = false;
    } else {
        valDob.hidden = true;
    }

}



//Backup alert

function showBackupAlert(){
console.log(state.stability)
    overlay.classList.remove("overlayInactive")
    modalBox.classList.remove("modalBoxInactive")

    overlay.classList.add("overlayActive")
    modalBox.classList.add("modalBoxActive")
    //alert("Ensure a backup plan is made immediately! Inform your haematology consultant for further advice and promptly phone the RCI department")

}

function hideBackupAlert() {
    console.log(state.stability)
    if (confirmAdviceReadBox.checked){
        overlay.classList.remove("overlayActive")
        modalBox.classList.remove("modalBoxActive")

        overlay.classList.add("overlayInactive")
        modalBox.classList.add("modalBoxInactive")
    
   
    }

     confirmAdviceReadBox.checked = false;

}


//show crossmatch fields

function showCrossmatchFields() {
    crossmatchInfo.hidden = false;
    crossmatchInfo.classList.add ("crossmatchInfo")
}

//hideCrossmatchFields

function hideCrossmatchFields() {
    crossmatchInfo.hidden=true;
    crossmatchInfo.classList.remove("crossmatchInfo")
}

//showdate

function showdate() {
    datetx.classList.add("formField")
}

function hideDate(){
    datetx.classList.remove("formField")

}




//Rules - These decide what code triggers

function runRules() {
    state.showTxDate =
    state.recentTx === "Yes";

    state.hideTxDate = 
    state.recentTx === "No";

    state.showCrossmatch =
    state.testRequest === "Antibody identification and crossmatch";



  

    render();
}

function alertRule() {
    state.showBackupWarning =
    state.stability === "Unstable";
    alertRender();

}

function alertRender() {

    if (state.showBackupWarning){
    showBackupAlert();

    }

}
        
function render() {
    
        
    if (state.showTxDate) {
        showdate();
    }else{
        hideDate();

    }
    

    if  (state.showCrossmatch){

        showCrossmatchFields();
     }
    else{
        hideCrossmatchFields();

    }
    

}


console.log(state.testRequest)

//Elements required for page submission and event listener

const formSubmission=
document.querySelector(".requestForm");

formSubmission.addEventListener("submit", pageSubmission);

function pageSubmission(event){
    event.preventDefault();//prevents page from reloading on the clicking of submit button
    state.testRequest = testRequestSelect.value
    console.log(state.testRequest)
    performFullValidationCheck();

}

function performFullValidationCheck(){

    if (state.testRequest === "Antibody identification and crossmatch"){
    
    validateDtrq();
    validateUnitNo();
    validateSpqr();
    validateForm();

    }else{
        console.log(valUnitNo.hidden)
        console.log(testRequestSelect.value)

    validateForename();
    validateSurname();
    validateStability();
    validateBleeding();
    validateCurrentHb();
    validateClinicalDetails();
    validateRecentTx3month();
    validateRecentTxDate();
    validateHospitalName();
    validateLabContactNumber();
    validateAboGroup();
    validateRhdGroup();
    validateSerologicalResults();
    validateTestRequest();

    }

    submissionErrorCheck();


   



}

function submissionErrorCheck(){
    const validationError =
    document.querySelectorAll(".validation")


    for (let error of validationError){  //for loop which goes through all the elements of validationError(any elements of the .validation class. If elements are NOT hidden then an alert is displayed and the script ends)
        if (!error.hidden){
            alert ("Please complete all fields")
            return false;
        
            }    
            
    }
        getIdofCheckedBoxes();
        collectRequest();

}

function getIdofCheckedBoxes(){
    const checkedboxes = document.querySelectorAll('input[name="spqrBoxes"]:checked');


}

function collectRequest(){

    const checkedboxes = document.querySelectorAll('input[name="spqrBoxes"]:checked');

    let checkedBoxValue = []
    for (let box of checkedboxes){
        checkedBoxValue.push(box.value);
    }




 
const requestState = {
    requestSent : "Request sent",
    requestReceived: "Request Received",
    sampleReceived : "Sample received in laboratory",
    sampleInProgress : "Sample in progress",
    sampleComplete :"Complete"

}


    const formData ={
    Forename : forenameInput.value,
    Surname : surnameInput.value,
    DateOfBirth: dobInput.value,
    HospitalNumber: hospNoInput.value,
    NHSNumber: nhsNomInput.value,

    PatientStability: patientStability.value,
    BleedingOrHaemolysing: bleedinghaemolysis.value,
    Hb: currentHbInput.value,
    ClinicalDetails: clinicalInfoInput.value,
    PatientTransfusedInLastThreeMonths: recentTxInput.value,
    TransfusionDate: datetxinput.value,

    HospitalName: hospitalNameList.value,
    LaboratoryContactNumber: labContactNumberInput.value,
    ABOGroup: aboGroupInput.value,
    RhDGroup: rhdGroupInput.value,
    SerologicalResults: serologicalResultsInput.value,
    
    TestRequested: testRequestSelect.value,
    AdditionalInfo: additionalInformationInput.value,
    DateRequested: dtrqDate.value,
    TimeRequested: dtrqTime.value,
    SampleTransportMethod: sampleTransportInput.value,
    DateOfSampleArrival: dateSampleArrival.value,
    TimeOfSampleArrival: timeSampleArrival.value,

    UnitsRequired: unitNoInput.value,
    SpecialRequirements: checkedBoxValue,
    
    requestId: Date.now().toString(), //generates a unique request ID based on the current timestamp

    requestDisplayStamp: "",

    auditTrail : [
        {
            status: requestState.requestSent,
            timeStamp: new Date()

        }]

    }
    

 

 fetch(`${BASE_URL}/api/formSubmit`,{ //this function uses the fetch API to send a POST request to the backend server at the specified URL. It sends the formData object as a JSON string in the request body, along with the appropriate headers to indicate that the content type is JSON.
    method:"POST",
    headers:{
        "Content-Type": "application/json"

    },
    body: JSON.stringify(formData)


})

.then(res => res.json())
.then (result => {
    console.log(result)
    console.log(result.Data_Submitted.id)
    if (result.duplicate){
        alert("Duplicate request detected. Please check your form.");
        return;
    }else{
    window.location.href= `RCIRequestSubmission.html?requestId=${result.Data_Submitted.id}`; 
    }//this code redirects the user to the RCIREQUESTSUBMISSION PAGE and adds the request ID as a URL parameter so that the relevant request can be pulled up on the submission page
//?requestId is a query parameter that allows us to pass the request ID to the next page, where we can use it to retrieve the specific request data from local storage or the backend server and display it on the RCIRequestSubmission.html page. This means
//on the RCIRequestSubmission.html page, we can access the request ID from the URL parameters, use it to fetch the corresponding request data from local storage or the backend, and then display that data to the user in a meaningful way, such as showing the details of their transfusion request and its current status.
    

    
});

}})