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


let formattedDate = new Date(item.changed_at).toLocaleString('en-GB');

    communicationLogHTML += `

    <tr>
    
        <td> ${item.date_of_communication} </td> 
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