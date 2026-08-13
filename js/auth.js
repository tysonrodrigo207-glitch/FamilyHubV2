window.currentUser = null;

/*
=========================
LOGIN
=========================
*/

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

    return true;

  }

  catch (error) {

    console.error(error);

    alert("Unable to connect to the server.");

    return false;

  }

}

/*
=========================
LOGOUT
=========================
*/

async function logout() {

  try {

    await fetch(

      "php/auth/logout.php",

      {

        method: "POST"

      }

    );

  }

  catch (error) {

    console.error(error);

  }

  localStorage.removeItem(
    "familyHubUser"
  );

  window.currentUser = null;

}

/*
=========================
CURRENT USER
=========================
*/

function getCurrentUser() {

  const storedUser =

    localStorage.getItem(
      "familyHubUser"
    );

  if (!storedUser) {

    return null;

  }

  window.currentUser =

    JSON.parse(storedUser);

  return window.currentUser;

}