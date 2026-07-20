const USERS = [

  {
    id: 1,
    username: "admin",
    password: "admin",
    name: "Tyson",
    role: "Admin"
  },

  {
    id: 2,
    username: "sarah",
    password: "sarah",
    name: "Sarah",
    role: "Member"
  },

  {
    id: 3,
    username: "michael",
    password: "michael",
    name: "Michael",
    role: "Member"
  },

  {
    id: 4,
    username: "lisa",
    password: "lisa",
    name: "Lisa",
    role: "Member"
  },

  {
    id: 5,
    username: "merrick",
    password: "merrick",
    name: "Merrick",
    role: "Moderator"
  }

];

window.currentUser = null;

function login(username, password) {

  const user = USERS.find(

    u =>
      u.username === username &&
      u.password === password

  );

  if (!user) {
    return false;
  }

  localStorage.setItem(
    "familyHubUser",
    JSON.stringify(user)
  );

  window.currentUser = user;

  return true;
}

function logout() {

  localStorage.removeItem(
    "familyHubUser"
  );

  window.currentUser = null;
}

function getCurrentUser() {

  const storedUser =
    localStorage.getItem(
      "familyHubUser"
    );

  if (!storedUser) {
    return null;
  }

  return JSON.parse(
    storedUser
  );
}