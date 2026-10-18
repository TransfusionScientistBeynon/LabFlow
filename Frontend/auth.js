let auth0 = null;



// This function initialised the auth0 client
async function initAuth(){ 
  auth0 = await createAuth0Client({
    domain: "labdash.uk.auth0.com",
    client_id: "vSibEAAxaZrmYdFKyuhl6L0zLmpd6mjM",
    redirect_uri: window.location.origin,
    audience: "https://labdashapi",
    scope: "openid profile email",
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

    console.log("This is the target", target)
    console.log("This is the title",document.title )
    

  }

}

async function protectPage(){


  //Checks with auth0 if user has been authenticated or not.
  const isAuthenticated = await auth0.isAuthenticated();


    console.log("Is authenticated:", isAuthenticated);
  console.log("Current URL:", window.location.href);


 

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

  redirectUserBasedOnRole()

}

async function redirectUserBasedOnRole(){ 

    const functionToken = await window.getAuth0Token();


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


async function getUserInfo(){
//This Function sends a token to the server, which obtains the users login details upon login
  const token = await getAuth0Token();
  console.log(token)

  await fetch ("/api/getUserInfo", {
    method: "POST",
    headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,

  },


  })

}



//This is called an immediately invoked Async function expression.
//This function has no name and is used to tell a script to run aynchronous function in a defined order once each script has finished.
(async function () {

await initAuth();
await handleRedirect();
await protectPage();
await getUserInfo();


})();

window.getAuth0Token = async function() {

    return await auth0.getTokenSilently();
};


//This function creates a user variable and uses auth0's getuser function to retrieve the person logging in information.
//The token is also obtained and is used in the authorisation header so that my app knows authorisation is given.
