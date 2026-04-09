let currentDate= new Date();
let currentHour = currentDate.getHours();
let currentMinutes = currentDate.getMinutes();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth()+1;
let currentDay = currentDate.getUTCDate();


let rciRequest = 
    localStorage.getItem("rciRequest");

let formData = 
JSON.parse(rciRequest);

let allRequests = JSON.parse(localStorage.getItem("allRequests")) || [];


let allHospitalNumbers = allRequests.map(function (item){
    return item.HospitalNumber;

});





const state = {
status:""
}

const tableStatus =
document.getElementById("status");


let currentHospitalNumber = formData.HospitalNumber;
console.log(currentHospitalNumber);
console.log(allHospitalNumbers)




incomingRequest();

function incomingRequest(){
    if(rciRequest){
        checkDuplicate();

    }

}


function checkDuplicate(){

if (allHospitalNumbers.includes(currentHospitalNumber)) {
    return false;

}else{

        allRequests.push(formData); //formData is the parsed version of rcirequest
        localStorage.setItem("allRequests", JSON.stringify(allRequests))
        localStorage.setItem("allHospitalNumbers", JSON.stringify(allHospitalNumbers))

}

}
    
//This is a sort function which sorts the objects in the allRequests array according to Date and Time. It states that a = date requested and b = time requested and constructs a date/time variable.
allRequests.sort(function (a,b) {
       
a.DateRequested
a.TimeRequested

b.DateRequested
b.TimeRequested

a.dateTime = `${a.DateRequested} ${a.TimeRequested}`
b.dateTime = `${b.DateRequested} ${b.TimeRequested}`

a.dateTimeObject = new Date(a.dateTime);
b.dateTimeObject = new Date(b.dateTime);

return (a.dateTimeObject) - b.dateTimeObject; 

    });




    

function requestReceivedUpdate(){
 state.status = "Request Received"

}





// This script works by getting the Rcirequest from the original page and parsing the information into an object stored in form data.
//I then created another storage method which stores all current requests or if there are no requests it makes an array.
// After this I created a function which pushes the previous request into the array thereby storing all current requests.
// At the send of the page the storage is set again and is stringified acting like a loop.

const tableData =
document.getElementById("tableData");

let tableDataHTML = ""
allRequests.forEach (function (item) { ///This line states that for each item in the allRequests array add a line in the table
    requestReceivedUpdate();
    tableDataHTML += `<tr> </tr>`;

    tableDataHTML += `<td> ${item.Forename} ${item.Surname} </td> <td> ${item.HospitalName} </td> <td> ${item.TestRequested} </td> <td> ${item.UnitsRequired} <td> ${item.DateRequested}  <br> ${item.TimeRequested} </td> <td> ${state.status} <br> ${item.requestDisplayStamp} </td>` 
});

tableData.innerHTML = tableDataHTML;


