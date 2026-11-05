window.currentUser = null;

function showAuthScreen(mode = "login") {
  const loginModal = document.getElementById("loginModal");
  const appShell = document.getElementById("appShell");
  const loginFormView = document.getElementById("loginFormView");
  const signupFormView = document.getElementById("signupFormView");
  const forgotPasswordView = document.getElementById("forgotPasswordView");
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
    forgotPasswordView?.classList.add("hidden");
    signupFormView.classList.remove("hidden");
  } else if (mode === "forgot-password") {
    authTitle.textContent = "Reset your password";
    authSubtitle.textContent = "We will send you a secure reset code for your Family Hub account.";
    loginFormView.classList.add("hidden");
    signupFormView.classList.add("hidden");
    forgotPasswordView?.classList.remove("hidden");
  } else {
    authTitle.textContent = "Welcome back";
    authSubtitle.textContent = "Sign in to continue to Family Hub";
    signupFormView.classList.add("hidden");
    forgotPasswordView?.classList.add("hidden");
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

async function requestPasswordReset(email) {
  try {
    const response = await fetch("php/auth/request_reset.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message);
      return null;
    }

    return result;
  } catch (error) {
    console.error(error);
    alert("Unable to request a password reset right now.");
    return null;
  }
}

async function resetPassword(token, password) {
  try {
    const response = await fetch("php/auth/reset_password.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, password })
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message);
      return false;
    }

    alert("Password updated successfully. You can sign in with your new password.");
    showAuthScreen("login");
    return true;
  } catch (error) {
    console.error(error);
    alert("Unable to reset your password right now.");
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