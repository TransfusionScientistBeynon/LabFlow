const BASE_URL = 'window.location.origin';

 

async function getUserInfo(){
     const user = await auth0.getUser();
    console.log(user)

}

getUserInfo();




retrieveCommunicationLogFromDatabase();

 async function retrieveCommunicationLogFromDatabase(){

const requestId = new URLSearchParams(window.location.search).get("requestId"); // gets request Id from URL parameter

const token = await window.getAuth0Token();
const communicationLogData = await fetch(`/api/communicationLogRetrieval/${requestId}`,{
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }

});

const response = await communicationLogData.json();

console.log(response.response.rows)

let communicationLogHTML = 

        `<tr>
            <th> Date of Communication </th>
            <th> Time of Communication </th>
            <th> Name of Contact </th>
            <th> Conversation details </th>
            <th> Action </th>
            <th> User </th> 
        </tr> 
        `
;


response.response.rows.forEach(item =>{


let date = new Date(item.date_of_communication).toLocaleString('en-GB');
let formattedDate = date.split(',') [0] //This means split the string by the comma and 0 means the first part of the string. One would be the part of the string after the comma.

    communicationLogHTML += `

    <tr>
    
        <td> ${formattedDate} </td> 
        <td> ${item.time_of_communication} </td>
        <td> ${item.name_of_contact} </td>
        <td> ${item.conversation_details} </td>
        <td> ${item.action_details} </td> 
        <td> ${item.submitted_by} </td>
        

    </tr>
    

    `


})

CommunicationLogTable.innerHTML = communicationLogHTML;



 }

function auditTrailReturn() {
    const requestId = new URLSearchParams(window.location.search).get("requestId");
    window.location.href = `labview.viewRequest.HTML?requestId=${requestId}`
}

console.log("hello")