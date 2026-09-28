const BASE_URL = 'window.location.origin';



async function getUserInfo(){
     const user = await auth0.getUser();
    console.log(user)

}

getUserInfo();


const auditTrailData = document.getElementById("auditTrailData");


retrieveAuditTrailFromDatabase();

 async function retrieveAuditTrailFromDatabase(){

const requestId = new URLSearchParams(window.location.search).get("requestId"); // gets request Id from URL parameter


const response = await fetch(`/api/auditTrail/${requestId}`,{
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }

});

const auditLog = await response.json();
console.log("AUDIT LOG RECEIVED:", auditLog);
console.log("NUMBER OF ROWS:", auditLog.rows.length);
console.log("ROWS:", auditLog.rows);

let auditTrailHtml = 

        `<tr>
            <th> Status Changed From </th>
            <th> Status Changed To </th>
            <th> Reason For Change </th>
            <th> Date/Time Of Change </th>
            <th> User </th> 
        </tr> 
        `
;


auditLog.rows.forEach(item =>{

console.log(item.changed_at);

let formattedDate = new Date(item.changed_at).toLocaleString('en-GB');

    auditTrailHtml += `

    <tr>
    
        <td> ${item.status_changed_from} </td> 
        <td> ${item.status_changed_to} </td>
        <td> ${item.reason} </td>
        <td> ${formattedDate} </td>
        <td> ${item.changed_by} </td>

    </tr>
    

    `


})

auditTrailTable.innerHTML = auditTrailHtml;



 }

