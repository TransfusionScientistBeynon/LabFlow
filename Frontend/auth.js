

/**
 * Initialise Auth0 client
 */
window.auth0 = null;
window.authReady = false;

window.initAuth = async function () {
  window.auth0 = await createAuth0Client({
    domain: "labdash.uk.auth0.com",
    client_id: "vSibEAAxaZrmYdFKyuhl6L0zLmpd6mjM",
    redirect_uri: window.location.origin,
    audience: "https://labdashapi"
  });

  window.authReady = true;
  console.log("Auth0 ready");

 // await window.handleRedirectCallback();
  //await window.checkAuthStatus();
  console.log("hello")
};


/**
 * Handle redirect after login
 */

/*
window.handleRedirectCallback = async function () {
  if (window.location.search.includes("code=")) {
    try {
      await window.auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
    } catch (err) {
      console.error("Redirect callback error:", err);
    }
  }
};

/**
 * Login
 */

window.login = async function () {
  if (!window.authReady) {
    console.log("Auth0 still loading");
    return;
  }

  await window.auth0.loginWithRedirect({
    authorizationParams: {
      audience: "https://labdashapi",
      redirect_uri: window.location.origin
    }
  });
};

/**
 * Logout
 */
/*
window.logout = async function () {
  if (!window.auth0) return;

  window.auth0.logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  });
};

/**
 * Check login state
 */
/*
window.checkAuthStatus = async function () {
  if (!window.auth0) return;

  const isAuthenticated = await window.auth0.isAuthenticated();
  console.log("Authenticated:", isAuthenticated);

  if (isAuthenticated) {
    const user = await window.auth0.getUser();
    console.log("User:", user);
  }
};

/**
 * Init
 */
window.initAuth();