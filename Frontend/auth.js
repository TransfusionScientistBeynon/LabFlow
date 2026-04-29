let auth0 = null;

// This function initialised the auth0 client
async function initAuth(){
  auth0 = await createAuth0Client({
    domain: "labdash.uk.auth0.com",
    client_id: "vSibEAAxaZrmYdFKyuhl6L0zLmpd6mjM",
    redirect_uri: window.location.origin,
    audience: "https://labdashapi"

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

  if (!isAuthenticated){
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

