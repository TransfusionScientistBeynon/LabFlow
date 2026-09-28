let auth0 = null;



// This function initialised the auth0 client
async function initAuth(){ 
  auth0 = await createAuth0Client({
    domain: "labdash.uk.auth0.com",
    client_id: "vSibEAAxaZrmYdFKyuhl6L0zLmpd6mjM",
    redirect_uri: window.location.origin,
    audience: "https://labdashapi",
    cacheLocation: "localstorage"

  });
}


//When the user is redirected back to the application handledirect
//stores the code and state from the URL returned by auth0
//and then replaces the URL with the original app URL.

async function handleRedirect(){
  if (window.location.search.includes("code=") && window.location.search.includes("state=")){
    const result= await auth0.handleRedirectCallback();
    const target = result.appState?.targetUrl || "/";
    window.history.replaceState({}, document.title, target)

  }

}

async function protectPage(){

  //Checks with auth0 if user has been authenticated or not.
  const isAuthenticated = await auth0.isAuthenticated();

    console.log("Is authenticated:", isAuthenticated);
  console.log("Current URL:", window.location.href);

 await getUserInfo();

  if (!isAuthenticated){

      console.log("Not authenticated - redirecting to Auth0");

    //This redirects the user to auth0 if the user isn't authenticated.
    //Once they authenticate auth0 redirects to the page the user was previously on (myapp)
    await auth0.loginWithRedirect({
      appState: {targetUrl: window.location.pathname}

    })

  return;

  }

  const overlay = 
  document.getElementById("overlay");
  overlay.classList.remove("overlayActive")
  overlay.classList.add("overlayInactive")
}




//This is called an immediately invoked Async function expression.
//This function has no name and is used to tell a script to run aynchronous function in a defined order once each script has finished.
(async function () {
await initAuth();
await handleRedirect();
await protectPage();

})();

window.getAuth0Token = async function() {

    return await auth0.getTokenSilently();
};


//This function creates a user variable and uses auth0's getuser function to retrieve the person logging in information.
//The token is also obtained and is used in the authorisation header so that my app knows authorisation is given.
async function getUserInfo(){
  const user = await auth0.getUser();
  const token = await getAuth0Token();

  await fetch ("/api/getUserInfo", {
    method: "POST",
    headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`

  },

  body: JSON.stringify({
  auth0_sub : user.sub,
  full_name: user.name,
  email: user.email,
  workplace: "to be updated",
  job_role: "to be updated",
  authorisation_status: "to be updated"

  })

});

}

