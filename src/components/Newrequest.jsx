
import { useState, useEffect } from 'react';


import {getAuth0Token} from '../auth/auth.js';

import API_URL from '../services/api';



 //This ensures the auth0 client has initialised before page render.

function Newrequest({currentPage, setCurrentPage, userInfo, successfulSubmission, setSuccessfulSubmission, unsuccessfulSubmission, setUnsuccessfulSubmission}){
console.log({currentPage})




// 






{/* Creates a variable called requestFormData and setFormData as an array. We then set all those values to nothing and it obtains the value from the users input by applying a value in JSX e.g. value=request_form_data.forename */}
const [requestFormData, setRequestFormData] = useState({

forename : "",
surname : "",
date_of_birth : "",
hospital_number : "",
nhs_number : "",

patient_stability : "",
bleeding_or_haemolysing : "",
haemoglobin : "",
clinical_details : "",
transfusion_history : "",
transfusion_history_date : "",

abo_group : "",
rhd_group : "",
serological_results : "",
file_upload : "",

test_required : "",
additional_information : "",
sample_transportation : "",
date_of_sample_arrival : "",
time_of_sample_arrival : "",

test_date_required : "",
test_time_required : "",

no_units_required : "",
unit_spqr : [] ,
unit_transportation_method : []



})

const [formErrors, setFormErrors] = useState({});

const [crossmatchInfo, setCrossmatchInfo] = useState(false);

const[backgroundOverlay, setBackgroundOverlay] = useState(false);

const [unstablePatient, setUnstablePatient] = useState(false);

const [adviceButtonChecked, setAdviceButtonChecked] = useState(false);



  const API_URL = import.meta.env.VITE_API_URL;

console.log("API URL:", API_URL);






function formHandler(event){

    const name = event.target.name;
    const value = event.target.value;
    const checkBox = event.target.checked

    if (event.target.type === "checkbox" && name === "unit_transportation_method"){

         setRequestFormData(previous =>({ //React passes the requestFormData as the previous parameter nd updates that object.
        ...previous,
        [name] : value
    }))
    

    }
        
       

   
    if (event.target.type === "checkbox" && name !== "unit_transportation_method") {

    setRequestFormData(previous => {

        let updatedArray;

        if (value === "None" && checkBox) {

            // None has been ticked: remove all other selections
            updatedArray = ["None"];

        

        } else if (value !== "None" && checkBox) {

            // Another option has been ticked: remove None and add this option
            updatedArray = [
                ...previous[name].filter(item => item !== "None"),
                value
            ];

        } else {

            // An option has been unticked: remove it
            updatedArray = previous[name].filter(item => item !== value);

        }
        console.log(updatedArray)
        return {
            ...previous,
            [name]: updatedArray
        };

    });
    
    }else{
         setRequestFormData(previous =>({ //React passes the requestFormData as the previous parameter nd updates that object.
        ...previous,
        [name] : value
    }))

    }
        

    
}

function formValidator(event){ {/*Renameed name and value in my function. This validates the inputs from the frontend on the form */}

let inputName = event.target.name;
let inputValue = event.target.value


    if (inputName === 'haemoglobin' && inputValue < 15){
        renderError(inputName)

    }else if (requestFormData.test_required !== 'Antibody identification and crossmatch' && inputName === 'no_units_required'){ 
        return

    }else if (inputValue.trim() === ""){

        console.log("value is null");
        renderError(inputName)

    }else{

        setFormErrors(previous =>({
            ...previous,
            [inputName] : null
        }));
    }
}

function renderClinicalMessage(event){
    if  (requestFormData.patient_stability === 'Unstable'){
        console.log("Message to be rendered")
        setUnstablePatient(true);
        setBackgroundOverlay(true);
    }
}

function closeAdviceBox(event){
    setUnstablePatient(false);
    setBackgroundOverlay(false)
}



function renderError(nameElement){

    if (nameElement === "haemoglobin") {
        setFormErrors(previous =>({
            ...previous,
            [nameElement] : <p className="validation"> Haemoglobin value Invalid  </p>
        }));

    }else if  (nameElement === "hospital_number" && requestFormData.nhs_number === ''){
           setFormErrors(previous =>({
            ...previous,
            [nameElement] : <p className="validation"> Hospital and/or NHS Number must be provided  </p>
        }));

    }else if (nameElement === "hospital_number" && requestFormData.nhs_number === ''){
           setFormErrors(previous =>({
            ...previous,
            [nameElement] : <p className="validation"> Hospital and/or NHS Number must be provided  </p>
        }));

    }else{
    console.log("These are the current setFormErrors", formErrors) 

    setFormErrors(previous =>({
            ...previous,
            [nameElement] : <p className="validation"> This field is required </p>
        }));

    }

}

useEffect(() => { {/* This is a react state useEffect runs when a state changes in react */}

    if (requestFormData.test_required === "Antibody identification and crossmatch") {
        setCrossmatchInfo(true);
    } else {
        setCrossmatchInfo(false);
    }

}, [requestFormData.test_required]);






async function submitForm(){

    console.log("These are all the form errors currently", formErrors)


        const actualErrors = Object.entries(formErrors)
        .filter(([key, value]) => value !== null);

   
    const token = await getAuth0Token();

    const response = await fetch(`${API_URL}/api/formSubmit`,{ //this function uses the fetch API to send a POST request to the backend server at the specified URL. It sends the formData object as a JSON string in the request body, along with the appropriate headers to indicate that the content type is JSON.
    method:"POST",
    headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`

    },
    body: JSON.stringify(requestFormData)

    });



const serverResponse = await response.json();
console.log(serverResponse)


if (serverResponse.successfulSubmissionState) {
    setSuccessfulSubmission(true);
    setCurrentPage("Successful submission")
}else{
    if (serverResponse.status === 400) {
       

        console.log("These are the mandatory fields", serverResponse.mandatoryFields)
        console.log("These are the completed fields" , serverResponse.completedFields)

        const mandatoryFields = serverResponse.RequiredFields
        const completedFields = serverResponse.CompletedFields

        const remainingFieldsRequired = mandatoryFields.filter(value => !completedFields.includes(value))
        console.log("These are the remaining fieeds", remainingFieldsRequired )

        console.log(remainingFieldsRequired, "These are the remaining fields")

        const errorsOnSubmit = remainingFieldsRequired

        errorsOnSubmit.forEach((item)=>{
            renderError(item)

        })
        
        


    }



}




}



return (
<>


<div id="pageContent" >

<div id="overlay" className= {backgroundOverlay === true ? "overlayActive" : "pageContent"}>

    <div name="modalBox" className={unstablePatient === true ? "modalBoxActive" : "modalBoxInactive"}>

              <p> <strong> Unstable patient </strong> </p>

               <p> 
               You have categoried this patient as unstable. 
               Ensure a backup plan is made immediately! Inform your haematology consultant for further advice and promptly phone the RCI department. 
                </p>

                <p> Please confirm below that you have read the above advice </p>

            Yes I have read the above advice <input name="confirmAdviceReadBox" checked={adviceButtonChecked} onChange={(event) => {setAdviceButtonChecked(event.target.checked); closeAdviceBox(event.target.checked);}} type="checkbox" className="confirmAdviceReadBox" />

</div>

</div>


  

<div id="tableContainer" className="tableContainer">


<div id="sectionHeader" className="sectionHeader">
    <h2> Urgent Test Request </h2>
    <span> <p> Submit a new urgent test request </p> </span>

</div>

    
<div id="formContainer" className="formContainer">

<form className="requestForm">

    <div id="patientDemographics" className="patientDemographics">
    
    <div id="patientDemoHeader" className="subSectionHeader">
        
        <h3> Patient Demographics </h3>

    </div>
    
    <div id ="patientDemoInput">
         
            <div className="formField">
            <label htmlFor="forenameInput"> Forename: </label>
             <input type="text" id="forenameInput" name="forename" value={requestFormData.forename} onChange={formHandler} onBlur={formValidator}/>   

             {formErrors.forename}
            </div>
             

            <div className="formField">
            <label htmlFor="surnameInput"> Surname: </label>
            <input type="text" id="surnameInput" name="surname" value={requestFormData.surname} onChange={formHandler} onBlur={formValidator}/> 
            {formErrors.surname}
            </div>
            
          

            <div className="formField">
            <label htmlFor="dobInput"> Date of Birth: </label>
            <input type="date" max="today" id="dobInput" name="date_of_birth" value={requestFormData.date_of_birth}  onChange={formHandler} onBlur={formValidator}/> 
            {formErrors.date_of_birth}
            
            </div>
            
            
            
            <div className="formField">
            <label htmlFor="hospNoInput"> Hospital Number: </label> 
            <input type="text" pattern="[0-9]*" inputMode="numeric" name="hospital_number" value={requestFormData.hospital_number} onChange={formHandler} onBlur={formValidator}/> 
            {!requestFormData.hospital_number && !requestFormData.nhs_number ? formErrors.hospital_number : null}
            

            <div className="formField">
            <label htmlFor="nhsNomInput"> NHS Number: </label>
            <input type="text" pattern="[0-9]*" inputMode="numeric" name="nhs_number" value={requestFormData.nhs_number} onChange={formHandler} onBlur={formValidator}/>
            {!requestFormData.hospital_number && !requestFormData.nhs_number ? formErrors.hospital_number : null}
        
    </div>
    </div>
    </div>
    </div>

    <div id="clinicalInfo" className="clinicalInfo">

         <div id="clinicalInfoHeader" className="subSectionHeader">
        
        <h3> Clinical Information </h3>

        </div>
        
        <div className="formField">
        <label htmlFor="patientStability"> Is the patient stable or unstable? </label>  

                <select name="patient_stability" value={requestFormData.patient_stability} onChange={formHandler} onBlur={(event) => {formValidator(event); renderClinicalMessage(event);}}> 
                <option value="">Select an option</option>
                <option value="Stable">Stable</option>
                <option value="Unstable">Unstable</option>
                </select>

            {formErrors.patient_stability}

        </div>


                <div className="formField">
                <label htmlFor="bleedinghaemolysis"> Is the patient bleeding or haemolysing? </label>
                 <select id="bleedinghaemolysis" name="bleeding_or_haemolysing" value={requestFormData.bleeding_or_haemolysing} onChange={formHandler} onBlur={formValidator}>   
                <option value="">Select an option</option>
                <option value="Bleeding">Bleeding</option>
                <option value="Haemolysing">Haemolysing</option>
                <option value="Neither">Neither</option>
                </select>
                {formErrors.bleeding_or_haemolysing}
                </div>


                <div className="formField">
                <label htmlFor="currentHbInput"> Patient's current Haemoglobin (g/l): </label>
                <input type="number" name="haemoglobin" value={requestFormData.haemoglobin} onChange={formHandler} onBlur={(event) => {formValidator(event); renderClinicalMessage(event);}} min="5" max="250" step="1" placeholder="Enter Haemoglobin in g/l"/> 
                {formErrors.haemoglobin}

            </div>

                <div className="formField">
                <label htmlFor="clinicalInfoinput"> Clinical Details: </label>
                <input type="text" id="clinicalInfoInput" name="clinical_details" value={requestFormData.clinical_details} onChange={formHandler} onBlur={formValidator} /> 
                {formErrors.clinical_details}
                </div>

                <div className="formField">
                <label htmlFor="recentTxInput"> Has the patient been transfused in the last 3 months? </label>
                <select id="recentTxInput" name="transfusion_history" value={requestFormData.transfusion_history} onChange={formHandler} onBlur={formValidator}>
                <option value="">Select an option</option>          
                <option value="Yes">Yes</option>
                <option value="No">No</option>  
                </select>  
                {formErrors.transfusion_history}
                </div>  
                
            <div id="datetx" className = {requestFormData.transfusion_history === '' ? ("transfusion_history_date_inactive") : requestFormData.transfusion_history === 'No' ?( "transfusion_history_date_inactive") : requestFormData.transfusion_history === 'yes' ? ( "transfusion_history_date_active") : null} name="transfusion_history_date" value={requestFormData.transfusion_history_date} >
                <label htmlFor="transfusion_history_date" className>  Please enter date of last transfusion: </label>
                <input  name="transfusion_history_date" value={requestFormData.transfusion_history_date} type="date" onChange={formHandler} onBlur={formValidator}/> 
                {formErrors.transfusion_history_date}
                {console.log(requestFormData.transfusion_history)}
            </div>
            

    </div>
            
  <div id="hospitalInfo"className="hospitalInfo">

    <div id="hospitalInformationHeader" className="subSectionHeader">
        
        <h3> Hospital Group and Serological Results </h3>  

        </div>
                
        <div className="formField">
       
        </div>

                    <div className="formField">
                    <label htmlFor="aboGroupInput">  ABO Group </label> 
                    <select id="aboGroupInput" name="abo_group" value={requestFormData.abo_group} onChange={formHandler} onBlur={formValidator}> 
                        <option value="">Select an option</option>
                        <option value="O"> O </option>
                        <option value="A">A</option> 
                        <option value="B">B</option> 
                        <option value="AB"> AB </option> 
                        <option value="A2"> A2 </option>
                        <option value="AVariant"> A Variant </option>
                        <option value="BVariant"> B Variant </option>
                        <option value="AvarB"> AVarB</option>
                        <option value="bombay"> Bombay </option>
                        <option value="parabombay"> Parabombay </option>
                        <option value="inconclusive"> Inconclusive </option>
                    </select> 
                    
                {formErrors.abo_group}

                </div>

                    <div className="formField">
                    <label htmlFor="rhdGroup"> RhD type </label>
                        <select id="rhdGroupInput" name="rhd_group" value={requestFormData.rhd_group} onChange={formHandler} onBlur={formValidator}> 
                            <option value=""> Select an option </option>   
                            <option value="RhD Pos"> RhD Positive </option>
                            <option value="RhD Neg"> RhD Negative</option>
                            <option value="Weak D"> Weak D </option>
                            <option value="RhD Variant"> RhD Variant </option>
                            <option value="inconclusive"> Inconclusive </option>
                        </select>

                        {formErrors.rhd_group}

                        
                    </div>

                    <div className="formField">
                    <label htmlFor="serohosp"> Serological results obtained at hospital: </label>
                    <textarea name="serological_results" value={requestFormData.serological_results} onChange={formHandler} type="textbox" onBlur={formValidator}/> 
                    {formErrors.serological_results}

                    </div>

                    <div className="formField">
                        <label htmlFor="panelUpload"> Upload panel results </label>
                     <input type="file" name="file_upload" accept="application/pdf, image/jpeg, image/png" value={requestFormData.file_upload} onChange={formHandler} onBlur={formValidator}/>
                    

                    </div>
                </div>

                

    <div id="testRequest" className="testRequest">

    <div id="testRequestHeader" className="subSectionHeader">
         <h3> Test Request </h3> 
        </div>

            <div className="formField">
           <label htmlFor="testRequestSelect"> Please select test required: </label> 
            <select id="testRequestSelect" name="test_required" value={requestFormData.test_required} onChange={(event) => {
                formHandler(event);

            }} onBlur={formValidator}> 
                <option value="">Select a test</option>
                <option value="Antibody identification with phone call">Antibody identification and phone call</option>
                <option value="Antibody identification and elution with phone call">Elution and phone call</option>
                <option value="Antibody identification and crossmatch">Antibody identification and crossmatch </option>
                </select>   
            {formErrors.test_required}

            
            </div>
                
            <div className="formField">

                <label htmlFor="additionalInformationInput"> Additional Information </label> 
                <input name="additional_information" value={requestFormData.additional_information} onChange={formHandler} type="text" id="additionalInformationInput" onBlur={formValidator} />
                

                </div>


                <div className="formField">
                <label htmlFor="sampleTransportInput"> How will the sample will be transported? </label> 
                <input type="text" id="sampleTransportInput" name="sample_transportation" value={requestFormData.sample_transportation} onChange={formHandler} onBlur={formValidator}/> 
                {formErrors.sample_transportation}
                </div>

                <div className="formField">
                <label htmlFor="arrivalTime"> Please estimate date and time of sample arrival at referral lab: </label>
                <input id ="dateSampleArrival" type="date" name="date_of_sample_arrival" value={requestFormData.date_of_sample_arrival} onChange={formHandler} onBlur={formValidator} />
                {formErrors.date_of_sample_arrival}

                <input id="timeSampleArrival" type="time" name="time_of_sample_arrival" value={requestFormData.time_of_sample_arrival} onChange={formHandler} onBlur={formValidator}/> 
                {formErrors.time_of_sample_arrival}
           
                </div>

                
                <div id="dtrq" className="dtrq" >
                <div className="formField">
                <label id='datetimerq'> Date and time test(s) required for: </label> 
                <input type='date' id="dtrqDate" name="test_date_required" value={requestFormData.test_date_required} onChange={formHandler} onBlur={formValidator}/> 
                {formErrors.test_date_required}

                <input type='time' id="dtrqTime" name="test_time_required" value={requestFormData.test_time_required} onChange={formHandler} onBlur={formValidator}/> 
                {formErrors.test_time_required}

                </div>
                </div>

     </div>

      <div id="crossmatchInfo" name="crossmatch_information" className= {crossmatchInfo === false ? "crossmatchInfo_inactive" : "crossmatchInfo_active"}value={crossmatchInfo}>

                
                
        <div id="crossmatchInformationHeader" className="subSectionHeader">
         <h3> Crossmatch Information </h3> 
        </div>
        
        
        <div id="unitno">
        <div className="formField">
                <label htmlFor="unitNoInput"> How many units are required? </label> 
                <select id="unitNoInput" name="no_units_required" value={requestFormData.no_units_required} onChange={formHandler} onBlur={formValidator}> 
                    <option value=""> Select an option </option>
                    <option value='1'> 1 </option> 
                    <option value='2'> 2 </option> 
                    <option value='3'> 3 </option> 
                    <option value='4'> 4 </option> 
                    <option value='5'> 5 </option>
                    <option value='6'> 6 </option>
                    <option value='7'> 7 </option> 
                    <option value='8'> 8 </option>
                    <option value='9'> 9 </option>
                    <option value='10'> 10 </option>
                    <option value='11'> 11 </option>
                    <option value='12'> 12 </option>
                </select>
                {formErrors.no_units_required}
                
                </div>
                </div>
                

                <div id="spqr"> 

                <h4> Special Requirements </h4>
                
                <div id="spqrInput" className="spqrCheckboxes">  
                    
                    Irradiated <input id="Irradiated" value='Irradiated' type='checkbox' name="unit_spqr" onChange={formHandler} checked = {requestFormData.unit_spqr.includes('Irradiated')} />
                    Washed <input value='Washed' type='checkbox' name="unit_spqr" onChange={formHandler} checked = {requestFormData.unit_spqr.includes('Washed')}/> 
                    CMV Negative <input value='CMVNegative' type='checkbox' name="unit_spqr" onChange={formHandler} checked = {requestFormData.unit_spqr.includes('CMVNegative')}/> 
                    HbS Negative <input value='HbS' type='checkbox' name="unit_spqr" onChange={formHandler} checked = {requestFormData.unit_spqr.includes('HbS')}/>
                    Less than 5 days old <input value="Less than 5 days old" type="checkbox" name="unit_spqr" onChange={formHandler} checked = {requestFormData.unit_spqr.includes('Less than 5 days old')}/>
                    None <input value="None" type="checkbox" name="unit_spqr" onChange={formHandler} checked = {requestFormData.unit_spqr.includes('None')}/>
                </div>
                {formErrors.unit_spqr}
                </div>

                  <h4> Unit Transportation </h4>    

                <div id="unitTransportInput">
                    
                    Routine <input type="checkbox" name="unit_transportation_method" value="Routine" onChange={formHandler} checked = {requestFormData.unit_transportation_method.includes("Routine")}/>
                    AdHoc <input  type="checkbox" name="unit_transportation_method" value="AdHoc" onChange={formHandler} checked = {requestFormData.unit_transportation_method.includes('AdHoc')}/> 
                    Collect <input type="checkbox" name="unit_transportation_method" value="Collect" onChange={formHandler} checked = {requestFormData.unit_transportation_method.includes('Collect')}/>
                    Blue Light <input type="checkbox" name="unit_transportation_method" value="Blue_Light" onChange={formHandler} checked = {requestFormData.unit_transportation_method.includes('Blue_Light')}/>   
                </div>
                {formErrors.unit_transportation_method}
                </div>
</form>

</div> 


</div> 
           
    
     
 <div id="submit" className="submitButton">
           <input type="submit" id="submitButton" value="Submit" onClick={submitForm}/>   
    </div>




</div>
</>
)
}

export default Newrequest;