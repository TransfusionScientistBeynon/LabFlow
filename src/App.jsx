import './App.css';

import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import Newrequest from './components/Newrequest';
import Hospitalview from './components/Hospitalview';
import Successfulsubmission from './components/Successfulsubmission';
import Failedsubmission from './components/Failedsubmission';

import {retrieveUserInfo} from './services/userInfoService';
import {protectPage} from './auth/auth';


function App() {


const [userInfo, setUserInfo] = useState(null)

const [currentPage, setCurrentPage] = useState("new");

const [successfulSubmission, setSuccessfulSubmission] = useState (false);

const [unsuccessfulSubmission, setUnsuccessfulSubmission] = useState (false); 

const [authenticationStatus, setAuthenticationStatus] = useState (false);

const [modalBoxState, setModalBoxState] = useState(false);


useEffect(() => {

async function decideIfUserAuthenticated(){

  try{
  const userAuthenticated = await protectPage()

    setAuthenticationStatus(userAuthenticated);


}catch (error){
  console.error("Authentication Failed", error);

}
}

decideIfUserAuthenticated()
}, []);

useEffect(() => {

async function fetchUser(){

 

  try {
    const userInfo = await retrieveUserInfo();
    setUserInfo(userInfo)

     console.log("userInfo")

  } catch (error) {
    (console.error (error) )
  }

}
  fetchUser();
  
}
  
, [] )

useEffect (() => {



},[currentPage]

)



  return (
   <>
<div id="overlay" data-id="" className={authenticationStatus === true  ? "overlayInactive" : "overlayActive"} name="overlay"> </div>

        
        
{/*This is a component I've made which allows us to add the Navigation bar easily and separates the page into key components. */}
<Navbar
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  userInfo = {userInfo}
  
/>
 
{currentPage === 'new' && <Newrequest
   currentPage={currentPage}
   setCurrentPage={setCurrentPage}
   userInfo = {userInfo}
  successfulSubmission = {successfulSubmission}
    setSuccessfulSubmission = {setSuccessfulSubmission}
    unsuccessfulSubmission = {unsuccessfulSubmission}
    setUnsuccessfulSubmission = {setUnsuccessfulSubmission}
/>}




{currentPage === 'myRequests' &&
<Hospitalview 
  currentPage = {currentPage}
  setCurrentPage = {setCurrentPage}
  userInfo = {userInfo}

/>}


{currentPage === 'Successful submission' &&
  <Successfulsubmission
  currentPage = {currentPage}
  setCurrentPage = {setCurrentPage}
  successfulSubmission = {successfulSubmission}
  setSuccessfulSubmission = {setSuccessfulSubmission}/>



}

{currentPage === 'Unsuccessful submission' &&

<Failedsubmission 
currentPage = {currentPage}
setCurrentPage = {setCurrentPage}
unsuccessfulSubmissionSubmission = {unsuccessfulSubmission}
setUnsuccessfulSubmission = {setUnsuccessfulSubmission}/>
}


  

</>
  )
}

export default App;