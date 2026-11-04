const modules = {
  dashboard: DashboardModule,
  feed: FeedModule,
  messages: MessagesModule,
  events: EventsModule,
  directory: DirectoryModule,
  surveys: SurveysModule
};

function renderPage(page) {

  State.currentPage = page;

  document.getElementById("pageTitle").textContent =
    page.charAt(0).toUpperCase() +
    page.slice(1);

  document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {

      btn.classList.remove("active");

      if(btn.dataset.page === page){

        btn.classList.add("active");

      }

    });

  modules[page].render(

    document.getElementById(
      "contentArea"
    )

  );

}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const loginBtn = document.getElementById("loginBtn");
    const showSignupBtn = document.getElementById("showSignupBtn");
    const showLoginBtn = document.getElementById("showLoginBtn");
    const submitLoginBtn = document.getElementById("submitLogin");
    const submitRegisterBtn = document.getElementById("submitRegister");

    const savedUser = getCurrentUser();

    if (savedUser) {
      window.currentUser = savedUser;
      loginBtn.textContent = `${savedUser.name} (${savedUser.role})`;
      hideAuthScreen();
      renderPage("dashboard");
    } else {
      showAuthScreen("login");
    }

    setInterval(() => {
      fetch("php/api/update_activity.php", {
        credentials: "include"
      });
    }, 30000);

    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        renderPage(btn.dataset.page);
      });
    });

    document.getElementById("themeToggle").addEventListener("click", () => {
      const body = document.body;
      body.dataset.theme = body.dataset.theme === "light" ? "dark" : "light";
    });

    loginBtn.addEventListener("click", async () => {
      if (window.currentUser) {
        await logout();
        location.reload();
        return;
      }

      showAuthScreen("login");
    });

    showSignupBtn.addEventListener("click", () => {
      showAuthScreen("signup");
    });

    showLoginBtn.addEventListener("click", () => {
      showAuthScreen("login");
    });

    submitLoginBtn.addEventListener("click", async () => {
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      const success = await login(username, password);

      if (!success) {
        return;
      }

      loginBtn.textContent = `${window.currentUser.name} (${window.currentUser.role})`;
      renderPage("dashboard");
    });

    submitRegisterBtn.addEventListener("click", async () => {
      const fullName = document.getElementById("registerFullName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const username = document.getElementById("registerUsername").value.trim();
      const password = document.getElementById("registerPassword").value.trim();

      const success = await registerUser({
        full_name: fullName,
        email,
        username,
        password,
        role: "Member"
      });

      if (!success) {
        return;
      }

      loginBtn.textContent = `${window.currentUser.name} (${window.currentUser.role})`;
      renderPage("dashboard");
    });

    NotificationModule.init();
  }
);