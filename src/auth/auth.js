
import { createAuth0Client } from "@auth0/auth0-spa-js"; //Gets functions from the auth0 library.

let auth0 = null;



// This function initialised the auth0 client
export async function initAuth(){ 
  
  auth0 = await createAuth0Client({
    domain: "labdash.uk.auth0.com",
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    
     authorizationParams: {
            redirect_uri: window.location.origin,
            audience: "https://labdashapi",
            scope: "openid profile email"
        },

    cacheLocation: "localstorage"

  });
}


//When the user is redirected back to the application handledirect
//stores the code and state from the URL returned by auth0
//and then replaces the URL with the original app URL.

export async function handleRedirect(){
  if (window.location.search.includes("code=") && window.location.search.includes("state=")){
    const result= await auth0.handleRedirectCallback();
    const target = result.appState?.targetUrl || "/";
    window.history.replaceState({}, document.title, target)

   
    

  }

}

export async function protectPage(){


  //Checks with auth0 if user has been authenticated or not.
  const isAuthenticated = await auth0.isAuthenticated();


 if (isAuthenticated){

  return true;

 }else if (!isAuthenticated) {


      console.log("Not authenticated - redirecting to Auth0");

    //This redirects the user to auth0 if the user isn't authenticated.
    //Once they authenticate auth0 redirects to the page the user was previously on (myapp)
    await auth0.loginWithRedirect({
      appState: {targetUrl: window.location.pathname}

    })

  return false;

  }

 
 // Need to reactivate this redirectUserBasedOnRole() !!!!!!!!

}

 //This function is called to redirect the user to the correct page based on their role.

export async function redirectUserBasedOnRole(){ 

    const functionToken = await getAuth0Token();


await fetch("/api/redirectUserBasedOnRole",{ 
    method:"POST",
    headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${functionToken}`

    },
    


})

.then(res => res.json())
.then (result => {
   console.log(result)

   if (result === "labView"){
    window.location.href = "labView.HTML"

    return;

   }else if (result === "hospitalStaff"){
    window.location.href = "hospitalView.html"
    return;

   }else if (result === "An error has occurred. Please contact system administrator"){
    window.location.href = "error.html"

   }
})

}






//This is called an immediately invoked Async function expression.
//This function has no name and is used to tell a script to run aynchronous function in a defined order once each script has finished.
(async function () {

await initAuth();
await handleRedirect();
await protectPage();
await redirectUserBasedOnRole();


})();

export async function logout() {

    await auth0.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
}


 export async function getAuth0Token() {

    return await auth0.getTokenSilently();

   
};






//This function creates a user variable and uses auth0's getuser function to retrieve the person logging in information.
//The token is also obtained and is used in the authorisation header so that my app knows authorisation is given.
