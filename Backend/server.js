// server.js
const express = require('express');
const path = require('path');

const app = express();
const cors = require('cors'); // means app will use CORS

// This allows us to accept JSON from the frontend and use CORS
app.use(cors());
app.use(express.json()); // This allows us to parse JSON bodies in incoming requests
app.use(express.static(path.join(__dirname, '../Frontend')));


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
  .catch(console.error);



//In memory storage that will act as a temporary database for the form data. This is just for demonstration purposes and should be replaced with a proper database in a production application.
let allRequests = [];

//Variable used to assign form data with request State for audit trail.
const requestState = {
    requestReceived: "Request Received",
    requestSampleReceived : "Sample received in laboratory",
    requestInProgress : "Sample in progress",
    requestComplete : "Complete"


}

const orderOfStateTransition = [
  requestState.requestSampleReceived, 
  requestState.SampleReceived,
  requestState.requestInProgress,
  requestState.requestComplete

]




//First route to handle form submission from the frontend. It receives the form data, stores it in the in-memory array.
//Also checks for duplicate requests using the checkDuplicateRequest function and if a duplicate is found it returns a 400 status code with an error message. If no duplicate is found it stores the form data and returns a success message.


app.post('/api/formSubmit', async (req, res) => {
    const pageData = req.body; // Get the form data from the request body
  

  const duplicateRequest = checkDuplicateRequest(pageData, allRequests);

  if (duplicateRequest){
    console.log("duplicate is: ", duplicateRequest);
    res.status(400).json({ 
    message: "Duplicate request detected. Form data not stored.",
    duplicate: duplicateRequest
  });
  }

try {
    pageData.TransfusionDate = pageData.TransfusionDate || null; 
    pageData.DateOfSampleArrival = pageData.DateOfSampleArrival || null;
    pageData.TimeOfSampleArrival = pageData.TimeOfSampleArrival || null;
    pageData.UnitsRequired = pageData.UnitsRequired || null;

    allRequests.push(pageData);// Store the form data in the in-memory array
    console.log("duplicate is: ", duplicateRequest);

      const patientDemoData = await db.query(
      `INSERT INTO patients (forename, surname, date_of_birth, hospital_number, NHS_number)
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id`,
        [
        pageData.Forename,
        pageData.Surname,
        pageData.DateOfBirth,
        pageData.HospitalNumber,
        pageData.NHSNumber
      ]

        );
   const patientId = patientDemoData.rows[0].id;

   const requestData = await db.query(
  `INSERT INTO requests (
  patients_id,
  PatientStability,
  BleedingOrHaemolysing,
  Hb,
  ClinicalDetails,
  PatientTransfusedInLastThreeMonths,
  TransfusionDate, 
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

  Requester,
  request_status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
  RETURNING id`,
  [
    patientId,
    pageData.PatientStability,
    pageData.BleedingOrHaemolysing,
    pageData.Hb,
    pageData.ClinicalDetails,
    pageData.PatientTransfusedInLastThreeMonths,
    pageData.TransfusionDate,
    pageData.HospitalName,
    pageData.LaboratoryContactNumber,
    pageData.ABOGroup,
    pageData.RhDGroup,
    pageData.SerologicalResults,
    pageData.TestRequested,
    pageData.AdditionalInfo,
    pageData.DateRequested,
    pageData.TimeRequested,
    pageData.SampleTransportMethod,
    pageData.DateOfSampleArrival,
    pageData.TimeOfSampleArrival,
    pageData.UnitsRequired,
    pageData.SpecialRequirements,

   
    pageData.requester || "Unknown Requester",
    requestState.requestReceived,
    
   
    
  ]
  
   );
      

    return res.status(200).json({ 
      message: "Successfully submitted and sent to database",
      Data_Submitted: patientDemoData.rows[0] && requestData.rows[0],
      duplicateRequest: duplicateRequest,
  
      
    });
    
  }

  catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });

  }
});


function checkDuplicateRequest(pageData, allRequests){

    const duplicateRequest = allRequests.some(item =>  //This some loop looks for a condition if all the key values of the form data match an existing request in the allRequests array. If a match is found it returns true and if not it returns false. This is used to prevent duplicate requests from being stored in the in-memory array.
    pageData.forename === item.forename && 
    pageData.surname === item.surname &&
    pageData.dateOfBirth === item.dateOfBirth && 
    pageData.testRequested === item.testRequested &&
    pageData.DateRequested === item.DateRequested &&
    pageData.TimeRequested === item.TimeRequested &&
    pageData.hospitalNumber === item.hospitalNumber &&
    pageData.NHSNumber === item.NHSNumber
    
     
    
    );
   return duplicateRequest;
}

//First route to retrieve the stored form data. It sends the entire array of form data back to the frontend as a JSON response.
app.get('/api/getformData', async (req, res) => {
  
  try {
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
      ORDER BY requests.created_at DESC`
      
    );

    // The join statement in the SQL query combines data from the requests and patients tables based on the patients_id foreign key. This allows us to retrieve both the request data and the associated patient demographics in a single query. The results are ordered by the created_at timestamp in descending order, so the most recent requests will be returned first.

    res.json(requests.rows);
    
  }catch (err){
    console.error(err);
    res.status(500).json({Message: "Unable to retrieve all requests from database"})

  }
 //res.json(allRequests); 

});

app.get('/api/getformData/:requestId', (req, res) => {

    const requestId = req.params.requestId; // Get the request ID from the URL parameters
    formSubmissionHandler(requestId, allRequests)
    
    const match = formSubmissionHandler(requestId, allRequests)
    res.json({match}); // Send the matched form data back to the frontend as a JSON response});
});

function formSubmissionHandler (requestId, allRequests){ // This function takes the request ID and the array of all requests as parameters. It uses the find method to search through the allRequests array for an item that has a requestId that matches the requestId parameter. If a match is found, it returns the matched item. If no match is found, it returns undefined.
  const match = allRequests.find(item => item.requestId === requestId);
  return match;
}



// A route to update the status of a request. 
app.post('/api/validateStatusChange', (req, res) => {

  const buttonClicked = req.body;
  const match = locateMatchingRequest(buttonClicked);


  let updateStatusResponse = {
    status:"",
    message:"",
    requestId: match.id,
    newMatchStatus: ""
  }

  locateMatchingRequest(buttonClicked);
  
  validateStatusChange(buttonClicked,updateStatusResponse, match);



  console.log (updateStatusResponse,"Server response to validate status change")

console.log(match.status)
  res.json(updateStatusResponse);
});

function locateMatchingRequest(buttonClicked){
      const matchingRequest = allRequests.find (function (item){
        return item.requestId === buttonClicked.id;
    });
return matchingRequest;
  }

  function validateStatusChange(buttonClicked, updateStatusResponse, match ){
  console.log(match.status, "before logic run")

    if (buttonClicked.action === 'statusChangeToRequestReceived' &&
      (
      match.status === requestState.requestReceived ||
      match.status === requestState.requestSampleReceived ||
      match.status === requestState.requestInProgress ||
      match.status === requestState.requestComplete
    )
   ){ updateStatusResponse.status = "invalid"
       updateStatusResponse.message = "Invalid request. Please provide reason"
       return updateStatusResponse

  }else if (buttonClicked.action === 'statusChangeTosampleReceived' && 

      (
      match.status === requestState.requestSampleReceived ||
      match.status === requestState.requestInProgress ||
      match.status === requestState.requestComplete
    )
    ){
        
        updateStatusResponse.status = "invalid"
        updateStatusResponse.message = "Invalid request. Please provide reason"
      return updateStatusResponse

    }else if (buttonClicked.action === 'statusChangeTosampleReceived') {
      
    match.status = requestState.requestSampleReceived;
    updateStatusResponse.status = "valid";
    updateStatusResponse.message = "Valid request. Transition accepted";
    updateStatusResponse.newMatchStatus = match.status

    
    return updateStatusResponse

    }else if (buttonClicked.action === 'statusChangeTosampleReceived') {
      
      updateStatusResponse.status = "valid"
      updateStatusResponse.message = "Valid request. Transition accepted" 
      match.status = requestState.requestSampleReceived
      return updateStatusResponse

    }else if  (buttonClicked.action === 'statusChangeToSampleInProgress' &&
      (
      match.status === requestState.requestInProgress ||
      match.status === requestState.requestComplete
    )
  ){
     updateStatusResponse.status = "invalid"
    updateStatusResponse.message = "Invalid request. Please provide reason"
    return updateStatusResponse


  }else if (buttonClicked.action === 'statusChangeToSampleInProgress'){

      match.status = requestState.requestInProgress
      
      updateStatusResponse.status = "valid"
      updateStatusResponse.message = "Valid request. Transition accepted" 
      updateStatusResponse.newMatchStatus = match.status
      return updateStatusResponse

  }else if  (buttonClicked.action === 'statusChangeToRequestComplete' &&
  (
      match.status === requestState.requestComplete
    )

  ){
    updateStatusResponse.status = "invalid"
        updateStatusResponse.message = "Invalid request. Please provide reason"
        return updateStatusResponse

  }else if (buttonClicked.action === 'statusChangeToRequestComplete'){
      match.status = requestState.requestComplete;
      updateStatusResponse.status = "valid"
      updateStatusResponse.message = "Valid request. Transition accepted" 
      updateStatusResponse.newMatchStatus = match.status
      
      
      return updateStatusResponse

  }
return updateStatusResponse
}    

app.post('/api/validateModalReason', (req, res) => {
  const reason = req.body.reason
  const requestId = req.body.modalBoxRequestId
  
  const currentRequest = allRequests.find

  
if (!reason || reason === ""){

  res.status(400).json({
    message: "Invalid reason in modal box",
    status: "invalid"


  })
  
}else{

  res.status(200).json({
    message: "Valid reason received in modal box",
    status: "valid"
  })

  updateAuditTrail(requestId,reason)
}



});

function updateAuditTrail(requestId, reason){
  const match = allRequests.find(item => item.requestId === requestId);

  const previousState = {
    PreviousStatus : match.status,
    ChangedBy: "USER NAME WILL BE UPDATED LATER"
  } 

  match.auditTrail.push ({
            previousState : JSON.stringify(previousState),
            newStatus: requestState.requestSampleReceived,
            reason: reason,
            ChangedBy: "USER NAME WILL BE UPDATED LATER "
  })



}

 



// Another route example
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is some data from the backend!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});