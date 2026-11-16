 import { useState, useEffect } from 'react';
 import {getAuth0Token} from '../auth/auth.js';
 import {logout} from '../auth/auth.js';
 import {protectPage} from '../auth/auth.js';
 
 import rciLogo from '../assets/Images/labDashLogo7.png';
 import workPlaceIcon from '../assets/Images/WorkplaceIcon.png';
 import roleIcon from '../assets/Images/RoleIcon.png';
 import signOutIcon from '../assets/Images/SignOutIcon.png';

 


function Navbar({currentPage, setCurrentPage, userInfo} ){


  const [profileMenu, setProfileMenu] = useState(false);
  const [profilePicture, setProfilePicture] = useState(false);
 


  //This retrieves the userInfo. If the loginStatus changes then the page runs retrieveUserInfo again. 




return(
<>
 <nav>
      <div id ="headerBar" className="headerBar"> 
      <img id="appLogo" alt="LabDash" src={rciLogo} className="headerLogo"/> 
    
      <div id="navBar" className="navBar">

      <div id="headerButtons" className="headerButtons">
      <button id="newRequest" className={currentPage === "new" ? "navButtonActive" : "navButtonInactive"} value={"new"} onClick={()=>{
       setCurrentPage('new')
      }}> New Request

    </button>

  
        

      <button id="myRequests" className={currentPage === "myRequests" ? "navButtonActive" : "navButtonInactive"} onClick={()=>{
        setCurrentPage('myRequests')

      }} value={"myRequests"}>
        My Requests
      </button> 
      </div>

      <div id="profilePictureContainer" className="profilePictureContainer">
      <a> <img id="profilePicture" src={userInfo ? userInfo.picture : null} alt="Profile Picture" className="profilePicture" onClick= {() => setProfileMenu(!profileMenu)} />  </a>

    </div>
    </div>

    </div>



    <div id="profileInfoShort" className={profileMenu === true ? "profileInfoShort" : "profileInfoShortInactive"} > 

       <div id="nameSignIn" className="nameSignIn">
            <span> <img src={userInfo ? userInfo.picture : null} alt="Profile Picture"/>  </span>
            <span> <strong> {userInfo ? userInfo.name: null} </strong> </span>
            <span> <p> Signed in </p> </span>
            </div>

            <div id="workplace" className="workplace">
            <h4> WORKPLACE </h4>
            <span> <img src={workPlaceIcon} alt="Workplace Icon"/>  {userInfo ? userInfo.workplaceName : ""}  </span>
            </div>

            <div id="role" className="role">
            <h4> ROLE </h4>
            <span> <img src={roleIcon} alt="Role Icon"/>  {userInfo ? userInfo.role : ""} </span>
            </div>
            
            <div className="signOutBorder"> </div>

            <div id="signOut" className="signOut" onClick={() => {
        logout();
        setLoginStatus(false);
    }}>
            <span> <img src={signOutIcon} alt="Sign Out Icon"/>  </span>
            <span> <strong> Sign out </strong> </span>
            </div>


    </div>
  </nav>
</>
)
    }

export default Navbar;