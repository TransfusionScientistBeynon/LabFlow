 import { useState, useEffect } from 'react';
 import {getAuth0Token} from '../auth/auth.js';
 import {protectPage} from '../auth/auth.js';

 import abidImage from '../assets/Images/abidcall.PNG';
 import xmImage from '../assets/Images/abidxmimprove.png'
 import elutionImage from '../assets/Images/Elution_Icon.png'

 import requestReceived from '../assets/Images/sampleInTransit.PNG'

 import API_URL from '../services/api';


function Hospitalview({currentPage, setCurrentPage, userInfo} ){

const [hospitalRequests, setHospitalRequests] = useState('');
const [tableData, setTableData] = useState ('');
const [fullRequestView, setFullRequestView] = useState (false);
const [searchTerm, setSearchTerm] = useState('')



useEffect(() =>{


loadHospitalRequests();
async function loadHospitalRequests(){

const functionToken = await getAuth0Token();


if (currentPage === 'myRequests'){
    console.log("running")

   const response = await fetch(`${API_URL}/api/loadHospitalRequests`,{ //this function uses the fetch API to send a POST request to the backend server at the specified URL. It sends the formData object as a JSON string in the request body, along with the appropriate headers to indicate that the content type is JSON.
    method:"GET",
    headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${functionToken}`

    }
})

const result = await response.json();

setHospitalRequests(result);



}
}

}, [currentPage] );



useEffect(()=>{


 function renderHospitalRequestsTable() {

console.log("These are the hospital requests", hospitalRequests)


//Only loads hospital requests when the array has info inside it

    if (hospitalRequests) {

  return hospitalRequests.map((item) => (
    <tr key={item.id} className="requestRow" onClick={setFullRequestView}>
      <td>{item.forename} {item.surname}</td>
      <td>{item.hospitalname}</td>
      <td> {item.testrequested === 'Antibody identification with phone call' ? (<img className="testReqImg" src={abidImage}/> ) : item.testrequested === "Antibody identification and crossmatch" ? (<img className="xmImg" src={xmImage}/>) : item.testrequested === "Antibody identification and elution with phone call" ? (<img className="Elution_Image" src={elutionImage}/>) : null} </td>
      <td>{item.unitsrequired || 'N/A' }</td>
      <td>{item.daterequested} {item.timerequested}</td>
      <td>{item.request_status === 'Request Received' ? (<img className="testReqImg" src={requestReceived}/> ) : null } </td>
    </tr>
  ));

  }
console.log(fullRequestView)
}

console.log(renderHospitalRequestsTable(), "this is the table output")

setTableData(renderHospitalRequestsTable())

}, [hospitalRequests]);


useEffect(()=>{

  loadFullRequestView()

  function loadFullRequestView(){
      if (fullRequestView){
          console.log("full request clicked")

      }else{
        return;
      }

  }


},[fullRequestView]
)

async function searchHospitalOutstandingRequests(event){
    
    const functionToken = await getAuth0Token();

    console.log("This is the search term", searchTerm)




    const searchResults = await fetch(`${API_URL}/api/myHospitalsOustandingRequestSearch`,{ //this function uses the fetch API to send a POST request to the backend server at the specified URL. It sends the formData object as a JSON string in the request body, along with the appropriate headers to indicate that the content type is JSON.
    method:"POST",
    headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${functionToken}`

    },
     body: JSON.stringify({searchTerm})

    })

}


return(

<>

  <div id="labView" >

    <div id="tableContainer" className="tableContainer">
    
    <div id="sectionHeader" className="sectionHeader">
    <span id="outstanding_requests_header"> <h2> My Requests </h2> </span>
    <span id="outstanding_requests_para"> <p> View the progress of your hospital's requests </p> </span>
    </div>

    <div id="hospitalSearchBar">
    <input type="search" placeholder="Search your hospital's outstanding requests..." onChange={(event) => { setSearchTerm(event.target.value);}} onBlur={searchHospitalOutstandingRequests} />


    </div>

    <div id="tableDiv" className="labView">
        <table id="requestsTable">
            <thead className = "header"> 
            <tr>
                <th id="nameHeader"> Patient name </th>
                <th id="hospitalHeader"> Hospital </th>
                <th id="investigationHeader"> Investigation required</th>
                <th id="noOfUnits"> No of units required </th>
                <th id="dateAndTimeRequired"> Date/Time Required </th>
                <th id="status"> Status </th>
                
            </tr>
            </thead>

            <tbody id="tableData"> 
                {tableData}
            </tbody>

        </table>

        
        
    </div>

    </div>
  


    </div>

</>
)
    }

export default Hospitalview