// server.js
const express = require('express');
const path = require('path');
const auth = require("./middleware/auth"); //required to connect middleware for authentication


const app = express();
const cors = require('cors'); // means app will use CORS

// This allows us to accept JSON from the frontend and use CORS
app.use(cors());
app.use(express.json()); // This allows us to parse JSON bodies in incoming requests
app.use(express.static(path.join(__dirname, '../Frontend')));


//Routes for authentication
// Public route (no login needed)
app.get("/", (req, res) => {
  res.send("API is running");
});

// Protected route (requires Auth0 login)
app.get("/api/protected", auth, (req, res) => {
  console.log("AUTH INFORMATION:", req.auth);
  res.json({
    message: "You are authenticated"
   
  });
});


// database initialization code
const fs = require("fs");
const db = require('./db/connection');

async function initDb() {
  const sql = fs.readFileSync(
    path.join(__dirname, "db", "init.sql"),
    "utf-8"
  );

  await db.query(sql);
  console.log("Database initialized ✅");
}

//Code to test Database connection
db.connect()
  .then(async () => {
    console.log("Connected to PostgreSQL 🎉");
    await initDb();
  })
  .catch(console.err);

//Code for testing initial ESP32 connection with the backend

app.post('/api/esp32BarcodeInfo', async (req,res) =>{

  const esp32Barcode = req.body.barcode

  if (esp32Barcode){
    console.log(esp32Barcode)

      res.status(200).json({
        message: "Barcode recieved is to be updated",
        testRequired: "ABO Group",
        conditions: "37 degrees celsius"
        

      })

  }else{
    res.status(400).json({
      message: "body not valid"

    }) 

  }



})




  //This route is used for obtaining the users details on login directly from the server

app.post(`/api/getUserInfo`, auth, async (req, res) => {
  (console.log("accessed"))

  console.log(req.headers.authorization)
  
  
    const response = await fetch(
            "https://labdash.uk.auth0.com/userinfo",
            {
                headers: {
                    Authorization: `${req.headers.authorization}`
                }
            }
        );


const user = await response.json()
console.log("User info", user)


const roles = await req.auth["https://labflow.uk/roles"];
const labId = await req.auth["https://labflow.uk/referral_lab_id"]
const workplaceId =  await req.auth ["https://labflow.uk/hospitalId"];

const hospital = await db.query(
  `SELECT hospital_name
   FROM workplaces
   WHERE workplaces.id = $1`
   ,[workplaceId]

)

console.log("This is the hospital Name of the user", hospital.rows[0].hospital_name)

user.role = roles
user.workplaceName = hospital.rows[0].hospital_name
user.workplaceId = workplaceId

console.log("looook here", workplaceId)
console.log(req.auth)


 
const checkUser = await db.query (
 `SELECT * FROM users WHERE auth0_sub = $1` , 
 [user.sub]
);



const currentUser = checkUser.rows[0]

const currentUserSub = checkUser.auth0_sub

// If the current user is not known then add the user to the database. This prevents user duplicates and is important for the audit trail.
if (!currentUser) {

  user.authorisation_status = "Authorised"

  const userData = await db.query(
   `INSERT INTO users (auth0_sub, full_name, email, workplaceId, workplaceName,  job_role, authorisation_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id`,
        [
        user.sub,
        user.name,
        user.email,
        user.workplaceId,
        user.workplaceName,
        user.role,
        user.authorisation_status,
      ]

        );
          
      }
  
   
   
  res.json( await user)
})


app.post("/api/redirectUserBasedOnRole", auth, async (req, res) => {
 /*console.log("accessed")

let redirectPage = ""

const role = await req.auth["https://labflow.uk/roles"];

if (role.includes("Admin" || "RCI")){

  redirectPage = "labView"
  res.status(200)
  res.json(redirectPage)

}else if (role.includes("hospitalStaff")){
  redirectPage = "hospitalView"
  res.json(redirectPage)

}else if (!role){
res.status(400)
res.json ("An error has occurred. Please contact system administrator")

}


*/
})

app.get('/api/loadHospitalRequests', auth, async (req, res) => {



console.log("route accessed loadHospital")

const userHospitalId = await req.auth ["https://labflow.uk/hospitalId"];
console.log("this is the userHospitalId", userHospitalId)

const response = await db.query(
`SELECT * FROM requests JOIN patients ON requests.patients_id = patients.id WHERE requests.hospitalid = $1`,
[userHospitalId] 



);
console.log(response.rows, "this is the response")

res.json(response.rows)
});

//In memory storage that will act as a temporary database for the form data. This is just for demonstration purposes and should be replaced with a proper database in a production application.
let allRequests = [];

//Variable used to assign form data with request State for audit trail.
const requestState = {
    requestReceived: "Request Received",
    requestSampleReceived : "Sample received in laboratory",
    requestInProgress : "Sample in progress",
    requestComplete : "Complete"


}

//This dictates the order that status changes should go through. This is used for error handling so if the request goes backwards the user has to validate why.
const orderOfStateTransition = [
  requestState.requestSampleReceived, 
  requestState.SampleReceived,
  requestState.requestInProgress,
  requestState.requestComplete
  

]




//First route to handle form submission from the frontend. It receives the form data, stores it in the in-memory array.
//Also checks for duplicate requests using the checkDuplicateRequest function and if a duplicate is found it returns a 400 status code with an error message. If no duplicate is found it stores the form data and returns a success message.


app.post('/api/formSubmit', auth, async (req, res) => {

  const user = req.auth.sub

  const pageData = req.body; // Get the form data from the request body

  console.log("This is the pageData", pageData)

  await checkFormDataComplete(pageData)

  async function checkFormDataComplete(pageData){

    //This function checks which information was completed and which wasn't.

    let completedFields = {}
    let emptyKeys = {}

    Object.entries(pageData).forEach(item => {
    const [key, value] = item;

   

    if (value != ''){
      completedFields[key] = value
    }
  
    if (value === '' || value === null){
    
    emptyKeys[key] = value

      
    
  }
  
});
 await checkIfMandatoryFieldsAreComplete(completedFields, emptyKeys)
  }


  async function checkIfMandatoryFieldsAreComplete(completedFields, emptyKeys){

// creates an object with the requests validation criteria for submission to the database.
  let validationCriteria = {
  forename : true,
  surname : true,
  date_of_birth : true,
  hospital_number : true,
  nhs_number : true,

  patient_stability: true,
  bleeding_or_haemolysing: true,
  haemoglobin : true,
  clinical_details : true,

  transfusion_history : true,
  transfusion_history_date : false,

  abo_group: true,
  rhd_group : true,
  serological_results : true,

  test_required : true,
  additional_information : false,
  sample_transportation : true,

  date_of_sample_arrival : true,
  time_of_sample_arrival : true,

  test_date_required : true,
  test_time_required : true,

  no_units_required : false,
  unit_spqr : false,
  unit_transportation_method : false
  }

   
    //looks through completed fields and decides which fields are required for later validation based on form criteria
   Object.entries(completedFields).forEach(([key, value]) => {

    if (key === 'transfusion_history' && value === 'Yes') {
        validationCriteria.transfusion_history_date = true;
    }


    if (key === 'test_required' && value === 'Antibody identification and crossmatch' ){
      validationCriteria.no_units_required = true;
      validationCriteria.unit_spqr = true;
      validationCriteria.unit_transportation_method = true;
    }

    if (key === 'hospital_number' && value !== ''){
      validationCriteria.nhs_number = false;

    }

    if (key === 'nhs_number' && value !== ''){
      validationCriteria.hospital_number = false;

    }

   



});

   const requiredFields = Object.entries(validationCriteria) //Creates object into key  and values so we can iterate through it.
  .filter(([key, value]) => value === true) //Filters out results that aren't required
  .map(([key, value]) => key) //.map makes a new array from our iteration only providing the keys that we want as we no longer need the value.

  const completedFieldsIteration = Object.entries(completedFields)
  .map(([key, value]) => key) //removes the values from the completedFileds array to make comparison easier.

  const areMandatoryFieldsComplete = requiredFields.every(requiredParameter => //.every is a function which iterates through each item and checks that fields within requiredparameters matches the completed fields. This checks all mandatory fields are completed
  completedFieldsIteration.includes(requiredParameter)
  );

  console.log("These are the required fields",requiredFields)
  console.log("these are the completed fields", completedFieldsIteration)
  console.log("This is the areMandatoryFieldsComplete result", areMandatoryFieldsComplete)

  if (areMandatoryFieldsComplete){
    await checkValuesProvidedAreValid(areMandatoryFieldsComplete, completedFields,requiredFields,completedFieldsIteration)

  }else{

    console.log("Required fields:", requiredFields);
console.log("Completed fields:", completedFieldsIteration);

console.log("Required fields array:", Array.isArray(requiredFields));
console.log("Completed fields array:", Array.isArray(completedFieldsIteration));
   
    return res.status(400).json({
     message: "Mandatory fields not completed",
     mandatoryFields: requiredFields,
     completedFields: completedFieldsIteration,
     status: 400

    })

  }
  

 
}

async function checkValuesProvidedAreValid(areMandatoryFieldsComplete, completedFields, requiredFields, completedFieldsIteration){

  console.log(completedFields)



  const currentDate = new Date;
  const currentTime = new Date;

  const stringDate = JSON.stringify(currentDate)
  const stringAndSliceDate = stringDate.slice(1,11)

  const stringTime = JSON.stringify(currentTime)
  const stringAndSliceTime = stringTime.slice(12,17)

const joinCurrentDateTime = stringAndSliceDate.concat(stringAndSliceTime)

const dateOfSampleArrival = completedFields.date_of_sample_arrival
const timeOfSampleArrival = completedFields.time_of_sample_arrival
const combinedDateTimeSampleArrival = dateOfSampleArrival.concat(timeOfSampleArrival)

const dateSampleRequested = completedFields.test_date_required
const timeSampleRequested = completedFields.test_time_required
const combinedDateTimeTestRequired = dateSampleRequested.concat(timeSampleRequested)

const patientLastTransfused = completedFields.transfusion_history_date
const completedFieldsDateObject = new Date(completedFields.transfusion_history_date)
  const todayDateObject = new Date
  const threeMonthsAgo = new Date
   threeMonthsAgo.setMonth(todayDateObject.getMonth() - 3)
   

console.log(patientLastTransfused)


  const valueCheck = {
    haemoglobin : false,  
    date_of_birth : false,
    date_of_sample_arrival: false,
    test_date_required: false,
    transfusion_history_date : false

    
  }

  const invalidErrorMessages = {



  }

  if (completedFields.haemoglobin < 15 || completedFields.haemoglobin >250){
    console.log("Invalid Haemoglobin")
    valueCheck.haemoglobin = false;
    invalidErrorMessages.haemoglobin = "Hb values <15 or >250 are invalid"
  }else{
    valueCheck.haemoglobin = true;

  }

  if (completedFields.date_of_birth > stringAndSliceDate){

    valueCheck.date_of_birth = false;
    invalidErrorMessages.date_of_birth = "Date of Birth cannot be beyond today's date"    

  }else{
    valueCheck.date_of_birth = true;

  }

  if (combinedDateTimeSampleArrival < joinCurrentDateTime){

    console.log("sample Arrival date invalid")
    valueCheck.date_of_sample_arrival = false;
    invalidErrorMessages.date_of_sample_arrival = "Sample cannot arrive before current date/time"


  }else{
    valueCheck.date_of_sample_arrival = true;
    
  }

  if (combinedDateTimeTestRequired < joinCurrentDateTime || combinedDateTimeTestRequired < combinedDateTimeSampleArrival){

    valueCheck.test_date_required = false;
    invalidErrorMessages.test_date_required = "Date and time of test results can't be before current date/time and must be after sample arrival date" 

  }else{
    valueCheck.test_date_required = true;

  }

  console.log("This is date object", completedFieldsDateObject)
  console.log("This is threeMonthsAgo", threeMonthsAgo)

  if (completedFields.transfusion_history_date > stringAndSliceDate || completedFieldsDateObject < threeMonthsAgo ){
    valueCheck.transfusion_history_date = false;
    invalidErrorMessages.transfusion_history_date = "Transfusion Date can't be beyond today's date and must be within the last 3 months. Select 'no' if patient not transfused in the last 3 months"
    console.log("The transfusion date failed", completedFields.transfusion_history_date)
    console.log("stringandSliceDate", stringAndSliceDate)
    
  }else{
    valueCheck.transfusion_history_date = true;
  }
  
  const areCompletedFieldsValid = Object.values(valueCheck).every(condition => condition === true)
  
let invalidFields = []

 const checkWhichFieldsAreInvalid = Object.entries(valueCheck).forEach(([key,value]) => {

  console.log("This is value Check", valueCheck)
  
    if (value === false){

      invalidFields.push(key)

    }

 });
  
 


  //Takes all the values from value Check.

 await formValidationResultHandler(areMandatoryFieldsComplete, areCompletedFieldsValid, requiredFields, completedFieldsIteration, invalidFields, invalidErrorMessages)

}

async function formValidationResultHandler(areMandatoryFieldsComplete, areCompletedFieldsValid, requiredFields, completedFieldsIteration, invalidFields, invalidErrorMessages){
  if (areMandatoryFieldsComplete && areCompletedFieldsValid){

   const duplicateRequestCheck = await checkForDuplicateRequests();

    if (!duplicateRequestCheck.success){
       return res.status(409).json({
        duplicateRequestCheck
    });
  }

  if (duplicateRequestCheck.success){


    const checkUserWorkplaceAdded = await addUserWorkplaceToRequest();  


    if (checkUserWorkplaceAdded.success){

      const workplaceId = checkUserWorkplaceAdded.workplaceId
      const workplaceName = checkUserWorkplaceAdded.workplaceName

      const checkPatientDemographicsInsertedIntoDatabase = await insertPatientDemographics();
      
      if (checkPatientDemographicsInsertedIntoDatabase.success){

      const patientDemoData = checkPatientDemographicsInsertedIntoDatabase.patientDemoData


      const checkRequestInsertedIntoDatabase =  await insertRequestIntoDatabase(patientDemoData, workplaceId, workplaceName)

      if (checkRequestInsertedIntoDatabase.success){
        return res.status(200).json({
            success: true,
            message: "Request successfully stored in the database"

          })

      }else{
        return res.status(400).json({
          success: false,
          message: "Failed to insert request into database",
          status: 400
        })

      }

      

      }else{
        return res.status(400).json({
          message: "Failed to insert patient Demographics into Database",
          status: 400

          })

        }
      
    }else{
      return res.status(400).json({
        message: "Unable to Attach User's Workplace to the request",
        status: 400

      })

    }

  }

  

}else{

    return res.status(400).json({
      message: "Form Validation check failed",
      status: 400,
      mandatoryFields: requiredFields,
      completedFields: completedFieldsIteration,
      InvalidFields: invalidFields,
      InvalidErrorMessages: invalidErrorMessages

    })

}

}


async function checkForDuplicateRequests () {

  try{

  const databaseLookup = await db.query(
    `SELECT *
     FROM patients
    
     WHERE 
    forename = $1
    AND 
    surname = $2
    AND
    date_of_birth = $3
    AND
    (
    hospital_number = $4
    OR 
    nhs_number = $5 
  )
    `,
    [pageData.forename, pageData.surname, pageData.date_of_birth, pageData.hospital_number, pageData.nhs_number]


  );

  if (databaseLookup.rows.length === 0){

    return{
      success:true,
      message: "No Duplicate Requests found"

    }
  }else if(databaseLookup.rows.length >0){

    return{
      success: false,
      message: "Duplicate requests detected",
      code: "DUPLICATE_REQUEST",
      duplicateRequestFound: databaseLookup.rows[0]

    }

  }

  }catch(error){

    return{
      success:false,
      message: "Database unable to check for errors",
      error: error

    }


  }
  


}


async function addUserWorkplaceToRequest(){

try{
   const databaseUser = await db.query(
    `SELECT workplacename, workplaceid FROM users WHERE auth0_sub = $1`,
    [user]

    
  );

  const workplaceName = databaseUser.rows[0].workplacename
  const workplaceId = databaseUser.rows[0].workplaceid

  
    return{
      success: true,
      message: "WorkplaceName and Id sent Successfully",
      workplaceName : workplaceName,
      workplaceId: workplaceId

    }

  }catch (error){
    return{
      success: false,
      message: "Unable to retrieve workplace",
      error: error

    }

  }


}

 async function insertPatientDemographics(){

  try{

      const patientDemoData = await db.query(
      `INSERT INTO patients (forename, surname, date_of_birth, hospital_number, NHS_number)
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id`,
        [
        pageData.forename,
        pageData.surname,
        pageData.date_of_birth,
        pageData.hospital_number,
        pageData.nhs_number
      ]

        );
        return {
          success: true,
          message: "Patient Demographics successfully entered into the database",
          patientDemoData: patientDemoData
          }
      }catch (error){
          return {
            success: false,
            message: "Failed to Insert patient Demographics into the database",
            error: error

          }
  }

 }

async function insertRequestIntoDatabase(patientDemoData, workplaceId, workplaceName){

 

  const patientId = patientDemoData.rows[0].id;
  const telephoneNumber = 0;

  try{

   const requestData = await db.query(
  `INSERT INTO requests (
  patients_id,
  PatientStability,
  BleedingOrHaemolysing,
  Hb,
  ClinicalDetails,
  PatientTransfusedInLastThreeMonths,
  TransfusionDate, 
  HospitalId,
  HospitalName,
  LaboratoryContactNumber,
  ABOGroup,
  RhDGroup,
  SerologicalResults,
  TestRequested,
  AdditionalInfo,
  DateRequested,
  TimeRequested,
  SampleTransportMethod,
  DateOfSampleArrival,
  TimeOfSampleArrival,
  UnitsRequired,
  SpecialRequirements,
  UnitTransportationMethod,

  Requester,
  request_status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
  RETURNING id`,
  [
    patientId,
    pageData.patient_stability,
    pageData.bleeding_or_haemolysing,
    pageData.haemoglobin,
    pageData.clinical_details,
    pageData.transfusion_history,
    pageData.transfusion_history_date,
    workplaceId,
    workplaceName,
    telephoneNumber,
    //THIS IS WHERE I INSERT NEW VARIABLES FROM USER INFO
    pageData.abo_group,
    pageData.rhd_group,
    pageData.serological_results,
    pageData.test_required,
    pageData.additional_information,
    pageData.test_date_required,
    pageData.test_time_required,
    pageData.sample_transportation,
    pageData.date_of_sample_arrival,
    pageData.time_of_sample_arrival,
    pageData.no_units_required,
    pageData.unit_spqr,
    pageData.unit_transportation_method,

   
    pageData.requester || "Unknown Requester",
    requestState.requestReceived,
  ]
   );

   return{
    success: true,
    message: "Request successfully submitted into the database",
    successfulSubmissionState: true

   }

  }catch (error){
    return{
      success: false,
      message: "Failed to insert the request into the database",
      error: error

    }

  }


  
}


});


//First route to retrieve the stored form data. It sends the entire array of form data back to the frontend as a JSON response.
app.post("/api/getformData", auth, async (req, res) => {

  const data = req.body;

  console.log(data.pageDisplayed.outstanding_requests)

  console.log(req.body, "This is the data from the labView page")
   let currentUser = req.auth
 console.log(currentUser)
   
//if (currentUser['https://labflow.uk/referral_lab_id'].includes ("RCI") ) {

  if (data.pageDisplayed.outstanding_requests) {

    const requests = await db.query(
      `SELECT 
        requests.id,
        patients.forename,
        patients.surname,
        patients.date_of_birth,
        patients.hospital_number,
        patients.NHS_number,
        requests.HospitalName,
        requests.TestRequested,
        requests.UnitsRequired,
        requests.DateRequested,
        requests.TimeRequested,
        requests.request_status,
        requests.created_at,
        
     
        
        patients.hospital_number,
        patients.NHS_number
      FROM requests JOIN patients ON requests.patients_id = patients.id 
      WHERE requests.request_status <> 'Complete'
      ORDER BY requests.created_at DESC`
      
    );
  
    res.json(requests.rows);

  }else if (data.pageDisplayed.completedRequests){

    const requests = await db.query(
      
      `
      SELECT  
        requests.id,
        patients.forename,
        patients.surname,
        patients.date_of_birth,
        patients.hospital_number,
        patients.NHS_number,
        requests.HospitalName,
        requests.TestRequested,
        requests.UnitsRequired,
        requests.DateRequested,
        requests.TimeRequested,
        requests.request_status,
        requests.created_at,
        
     
        
        patients.hospital_number,
        patients.NHS_number

        
        FROM requests JOIN patients ON requests.patients_id = patients.id 
        WHERE requests.request_status = 'Complete'
      ORDER BY requests.created_at DESC
      `
  );
  res.json(requests.rows);
}
//}
})

   
app.post("/api/myHospitalsOustandingRequestSearch", auth, async (req, res) =>{

  const stringUserInfo = JSON.stringify(req.auth)

  

 function checkUserRole(){

    if (stringUserInfo.includes("/hospitalId")){
    
      return true


     

    }else{
      return false

    }
  
  }

  if (checkUserRole() === true){
 const searchTerm = req.body.searchTerm

 const hospitalId = req.auth['https://labflow.uk/hospitalId']  
 console.log(hospitalId)


try{
const searchResult = await db.query(
  `SELECT * from patients
   JOIN requests ON patients.id = requests.patients_id
  WHERE forename ILIKE $1
  OR surname ILIKE $1
  OR hospital_number ILIKE $1
  OR nhs_number ILIKE $1
  AND hospitalid = $2

 
   `
  , [`%${searchTerm}%`,
    hospitalId
  ]

  //The percentages around the search Term act as a wildcard, they tell SQL that we are looking for any request that contains the word charlie

)

 res.status(200).json({
    message: "Search successful",
    SearchResults: searchResult.rows
 })

}catch(error){
  console.error(error)

   res.status(400).json({
    message: "Search Unsuccessful. Please try again",
    

  })

}
 
}else{

  res.status(200).json({
    status: 200,
    Message: "Invalid permissions , please contact a system administrator"

})
}

})






// The join statement in the SQL query combines data from the requests and patients tables based on the patients_id foreign key. This allows us to retrieve both the request data and the associated patient demographics in a single query. The results are ordered by the created_at timestamp in descending order, so the most recent requests will be returned first.
    
 



app.get('/api/getformData/fullRequestView', async (req, res) => {
  
  try {
    const requests = await db.query(
      `SELECT 
        requests.id,
        patients.forename,
        patients.surname,
        patients.date_of_birth,
        patients.hospital_number,
        patients.NHS_number,
        requests.PatientStability,
        requests.BleedingOrHaemolysing,
        requests.Hb,
        requests.ClinicalDetails,
        requests.PatientTransfusedInLastThreeMonths,
        requests.TransfusionDate,
        requests.LaboratoryContactNumber,
        requests.ABOGroup,
        requests.RhDGroup,
        requests.SerologicalResults,
        requests.AdditionalInfo,
        requests.SpecialRequirements,
        requests.Requester,
        requests.request_status,
        requests.created_at,
        requests.HospitalName,
        requests.TestRequested,
        requests.UnitsRequired,
        requests.DateRequested,
        requests.TimeRequested,
        requests.request_status,
        requests.created_at,
        requests.SampleTransportMethod,
        requests.DateOfSampleArrival,
        requests.TimeOfSampleArrival
       
      FROM requests JOIN patients ON requests.patients_id = patients.id 
      ORDER BY requests.created_at DESC`
      
    );
  
    // The join statement in the SQL query combines data from the requests and patients tables based on the patients_id foreign key. This allows us to retrieve both the request data and the associated patient demographics in a single query. The results are ordered by the created_at timestamp in descending order, so the most recent requests will be returned first.

    res.json(requests.rows);
    
  }catch (err){
    console.log(err);
    res.status(500).json(
      {Message: "Unable to retrieve all requests from database",
      fullMessage: err.message,
      fullError: err
    })
  
  }

});

// A route to update the status of a request. 
app.post('/api/validateStatusChange', auth, async (req, res) => {

  const token = req.headers.authorization
  const currentUser = req.auth.sub

  console.log("This is the sub", currentUser)

  await locateUserInfo(currentUser);
  
  async function locateUserInfo(currentUser){
    const userInfo = await db.query(
      `SELECT * FROM users WHERE auth0_sub = $1`,
      [currentUser]

    );

    const matchingUserInfo = userInfo.rows[0];
    console.log(matchingUserInfo, "LOOK HERE");
    
    return matchingUserInfo

  }  

  const name = await locateUserInfo(currentUser)

  
  const displayName = JSON.stringify(name.full_name)

  console.log("This is the displayName", displayName);



 
  const requestedAction = req.body.action;
  
  const buttonClicked = req.body;
   console.log(buttonClicked)

  const match = await locateMatchingRequest(buttonClicked);
  console.log(match,"hey")
  console.log("Action before update", requestedAction)
  
 function actionTranslationTable(requestedAction, requestState) {

  if (requestedAction === "statusChangeToRequestReceived"){
    console.log("match")
    return requestState.requestReceived

  }else if (requestedAction === "statusChangeTosampleReceived") {
    
    return requestState.requestSampleReceived

  }else if (requestedAction === "statusChangeToSampleInProgress"){

    return requestState.requestInProgress
      

  
  }else if (requestedAction === "statusChangeToRequestComplete"){
     return requestState.requestComplete
  }

} 

console.log(displayName, "next to updateStatusResponse")
  
  let updateStatusResponse = {
    status:"",
    message:"",
    requestedAction,
    reason: "Reason not required",
    requestId: match.id,
    oldMatchStatus: match.request_status,
    newMatchStatus: actionTranslationTable(requestedAction, requestState) ,
    ChangedBy: req.auth.sub
  
  }


  

  const updatedVariables = await validateStatusChange(buttonClicked, updateStatusResponse, match)
  await updateDatabaseAndAuditTrail(updatedVariables)

console.log("UpdateStatusResponse before response to frontend", updateStatusResponse)

  res.json(updateStatusResponse);
});

async function locateMatchingRequest(buttonClicked){
      const result = await db.query(
      'SELECT * FROM requests WHERE id = $1',
       [buttonClicked.id]
         
    );
    const matchingRequest = result.rows[0];

    return matchingRequest;
  }


 async function validateStatusChange(buttonClicked, updateStatusResponse, match ){
  await locateMatchingRequest(buttonClicked);
  await match;

    if (buttonClicked.action === 'statusChangeToRequestReceived' &&
      (
      match.request_status === requestState.requestReceived ||
      match.request_status === requestState.requestSampleReceived ||
      match.request_status === requestState.requestInProgress ||
      match.request_status === requestState.requestComplete
    )
   ){ updateStatusResponse.status = "invalid"
       updateStatusResponse.message = "Invalid request. Please provide reason"
       updateStatusResponse.requestAction = buttonClicked.action;
       

       return updateStatusResponse

      

  }else if (buttonClicked.action === 'statusChangeTosampleReceived' && 

      (
      match.request_status === requestState.requestSampleReceived ||
      match.request_status === requestState.requestInProgress ||
      match.request_status === requestState.requestComplete
    )
    ){
        
        updateStatusResponse.status = "invalid"
        updateStatusResponse.message = "Invalid request. Please provide reason"
        updateStatusResponse.requestAction = buttonClicked.action;
        

      return updateStatusResponse


    }else if (buttonClicked.action === 'statusChangeTosampleReceived') {
      updateStatusResponse.status = "valid"
      updateStatusResponse.message = "Valid request. Transition accepted" 
      updateStatusResponse.requestAction = buttonClicked.action;
      updateStatusResponse.newMatchStatus = requestState.requestSampleReceived
      
      return updateStatusResponse

    }else if  (buttonClicked.action === 'statusChangeToSampleInProgress' &&
      (
      match.request_status === requestState.requestInProgress ||
      match.request_status === requestState.requestComplete
    )
  ){
     updateStatusResponse.status = "invalid"
    updateStatusResponse.message = "Invalid request. Please provide reason"
    updateStatusResponse.requestAction = buttonClicked.action;
    return updateStatusResponse


  }else if (buttonClicked.action === 'statusChangeToSampleInProgress'){

      
      updateStatusResponse.status = "valid"
      updateStatusResponse.message = "Valid request. Transition accepted" 
      updateStatusResponse.requestAction = buttonClicked.action;
      updateStatusResponse.newMatchStatus = requestState.requestInProgress
      return updateStatusResponse

  }else if  (buttonClicked.action === 'statusChangeToRequestComplete' &&
  (
      match.request_status === requestState.requestComplete
    )

  ){
    updateStatusResponse.status = "invalid"
        updateStatusResponse.message = "Invalid request. Please provide reason"
        updateStatusResponse.requestAction = buttonClicked.action;
        return updateStatusResponse

  }else if (buttonClicked.action === 'statusChangeToRequestComplete'){

      updateStatusResponse.status = "valid"
      updateStatusResponse.message = "Valid request. Transition accepted" 
      updateStatusResponse.requestAction = buttonClicked.action;
      updateStatusResponse.newMatchStatus = requestState.requestComplete

       
      
      return updateStatusResponse

  }
return updateStatusResponse

}    



app.post('/api/validateModalReason', auth, async (req, res) => {


  const token = req.headers.authorization

  const reason = req.body.reason
  const requestId = req.body.modalBoxRequestId
  const action = req.body.submitAction



    


  let updateStatusResponse = {
    status:"",
    message:"",
    requestedAction: action,
    requestId: requestId,
    reason,
    ChangedBy: req.auth.sub,
    newMatchStatus: actionTranslationTable(action, requestState)
  }



const validationOutput = await validateModalInput(reason, requestId, updateStatusResponse);

updateDatabaseAndAuditTrail(validationOutput)

if (validationOutput.status === "invalid"){
 return res.status(400).json(validationOutput)
}


if (validationOutput.status === "valid"){
  res.status(200).json(validationOutput)
}



});



 function actionTranslationTable(action, requestState) {

  if (action === "statusChangeToRequestReceived"){
   
    return requestState.requestReceived

  }else if (action === "statusChangeTosampleReceived") {
    
    return requestState.requestSampleReceived

  }else if (action === "statusChangeToSampleInProgress"){

    return requestState.requestInProgress
      

  
  }else if (action === "statusChangeToRequestComplete"){
     return requestState.requestComplete
  }

} 


async function validateModalInput (reason, requestId, updateStatusResponse){
    
if (!reason || reason === ""){
  return {
    ...updateStatusResponse,
  status: "invalid", 
  message: "No reason provided, please provide a reason"
  }

}else {
return{
...updateStatusResponse,
status: "valid",
message: "Reason updated Successfully",
reason : reason
}
}

return updateStatusResponse
}



async function updateDatabaseAndAuditTrail(data){ //This is a service function that takes data from validateStatusChange and updates the request status and audit trail in the database.
console.log("Data sent to service function", data)
  
if (data.status === "invalid"){
  return;

}

if (data.status === "valid"){

  const currentStatus = await db.query (
    `SELECT * FROM requests WHERE id=$1`,
    [data.requestId]

  ) 

  const oldStatus = currentStatus.rows[0].request_status;
  console.log("Old status is ", oldStatus)
    await db.query(
      `UPDATE requests
      SET request_Status = $1
      WHERE id = $2`,
      [data.newMatchStatus,data.requestId] 

    )
      await db.query(
        `INSERT INTO audit_log (request_id, action, status_changed_from, status_changed_to, reason, changed_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id `,
        [
          data.requestId,
          data.requestedAction,
          oldStatus,
          data.newMatchStatus,
          data.reason,
          data.ChangedBy
        ]
      )
     
  
  }

}

app.get('/api/auditTrail/:requestId', async (req,res)=> {

const requestId = req.params.requestId

console.log(requestId, "this is the request id");

  await db.query (
  `SELECT
     audit_log.*,
     users.full_name AS changed_by_name

     FROM audit_log
     LEFT JOIN users
     ON
      audit_log.changed_by = users.auth0_sub
      WHERE audit_log.request_Id = $1

    ORDER BY audit_log.id ASC`,
    [requestId]


  )

  .then (auditLogData => {
    res.json(auditLogData)
  })

})


app.post(`/api/communicationLog/:requestId`, auth, async (req,res) => {
  const communicationLogData = req.body;
  const user = req.auth.sub
  console.log("The users name is...", user)
  const requestId = req.params.requestId;
  console.log("This is the data received from the communication log page", communicationLogData)

 const logData = await db.query (`INSERT INTO communication_log (request_id, date_of_communication, time_of_communication, name_of_contact, conversation_details, action_details, submitted_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id`,
        [
        requestId,
        communicationLogData.Date,
        communicationLogData.Time,
        communicationLogData.Contact_Name,
        communicationLogData.Conversation_Details,
        communicationLogData.Action,
        user
        
      ]

        );

updateAuditLog(user, requestId)
    async function updateAuditLog (user, requestId){
      console.log("THIS IS THE USER", user)
      console.log("THIS IS THE REQUEST ID", requestId)
      await db.query (`INSERT INTO audit_log (request_id, action, status_changed_from, status_changed_to, reason, changed_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          requestId,
          "Communication Log Update",
          "Communication Log Update",
          "Communication Log Update",
          "System update",
          user
    

        ]
      
      );


    }

  res.json({
  Message: "Communication data received by server",
  

})


})
    
app.get(`/api/communicationLogRetrieval/:requestId`, auth, async (req,res) => {

   const communicationLogData = req.body;
  const user = req.auth.sub
  console.log("The users name is...", user)
  const requestId = req.params.requestId;

const response = await db.query(`SELECT
     communication_log.*,
     users.full_name AS submitted_by

     FROM communication_log
     LEFT JOIN users
     ON
      communication_log.submitted_by = users.auth0_sub
      WHERE communication_log.request_Id = $1

    ORDER BY communication_log.id ASC`,
    [requestId]


  )

  res.json({
    response

  })

})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

