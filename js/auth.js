window.currentUser = null;

function showAuthScreen(mode = "login") {
  const loginModal = document.getElementById("loginModal");
  const appShell = document.getElementById("appShell");
  const loginFormView = document.getElementById("loginFormView");
  const signupFormView = document.getElementById("signupFormView");
  const authTitle = document.getElementById("authTitle");
  const authSubtitle = document.getElementById("authSubtitle");

  if (!loginModal || !appShell) {
    return;
  }

  appShell.classList.add("hidden");
  loginModal.classList.remove("hidden");

  if (mode === "signup") {
    authTitle.textContent = "Create your family account";
    authSubtitle.textContent = "Start your Family Hub journey.";
    loginFormView.classList.add("hidden");
    signupFormView.classList.remove("hidden");
  } else {
    authTitle.textContent = "Welcome back";
    authSubtitle.textContent = "Sign in to continue to Family Hub";
    signupFormView.classList.add("hidden");
    loginFormView.classList.remove("hidden");
  }
}

function hideAuthScreen() {
  const loginModal = document.getElementById("loginModal");
  const appShell = document.getElementById("appShell");

  if (loginModal) {
    loginModal.classList.add("hidden");
  }

  if (appShell) {
    appShell.classList.remove("hidden");
  }
}

async function login(username, password) {
  try {
    const response = await fetch(
      "php/auth/login.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      }
    );

    const result = await response.json();

    if (!result.success) {
      alert(result.message);
      return false;
    }

    window.currentUser = result.user;

    localStorage.setItem(
      "familyHubUser",
      JSON.stringify(result.user)
    );

    hideAuthScreen();
    return true;
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server.");
    return false;
  }
}

async function registerUser(payload) {
  try {
    const response = await fetch(
      "php/auth/register.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!result.success) {
      alert(result.message);
      return false;
    }

    window.currentUser = result.user;

    localStorage.setItem(
      "familyHubUser",
      JSON.stringify(result.user)
    );

    hideAuthScreen();
    return true;
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server.");
    return false;
  }
}

async function logout() {
  try {
    await fetch(
      "php/auth/logout.php",
      {
        method: "POST"
      }
    );
  } catch (error) {
    console.error(error);
  }

  localStorage.removeItem("familyHubUser");
  window.currentUser = null;
  showAuthScreen("login");
}

function getCurrentUser() {
  const storedUser = localStorage.getItem("familyHubUser");

  if (!storedUser) {
    return null;
  }

  try {
    window.currentUser = JSON.parse(storedUser);
    return window.currentUser;
  } catch (error) {
    console.error("Unable to parse user session:", error);
    localStorage.removeItem("familyHubUser");
    return null;
  }
}