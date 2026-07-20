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

  document.getElementById("pageTitle")
    .textContent =
      page.charAt(0).toUpperCase() +
      page.slice(1);

  document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {
      btn.classList.remove("active");

      if (btn.dataset.page === page) {
        btn.classList.add("active");
      }
    });

  modules[page].render(
    document.getElementById("contentArea")
  );
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const savedUser =
        getCurrentUser();

      if(savedUser){

        window.currentUser =
          savedUser;

        document.getElementById(
          "loginBtn"
        ).textContent =
          `${savedUser.name} (${savedUser.role})`;

      }

    renderPage("dashboard");

    document
      .querySelectorAll(".nav-btn")
      .forEach(btn => {

        btn.addEventListener("click", () => {
          renderPage(btn.dataset.page);
        });

      });

    document
      .getElementById("themeToggle")
      .addEventListener("click", () => {

        const body = document.body;

        const newTheme =
          body.dataset.theme === "light"
            ? "dark"
            : "light";

        body.dataset.theme = newTheme;
      });

    document
      .getElementById("loginBtn")
      .addEventListener("click", () => {

        document
          .getElementById("loginModal")
          .classList.remove("hidden");

      });

    document
      .getElementById("submitLogin")
      .addEventListener("click", () => {

        const username =
          document.getElementById("username").value;

        const password =
          document.getElementById("password").value;

        const success =
          login(username, password);

        if (!success) {
          alert("Invalid login");
          return;
        }

        document
          .getElementById("loginModal")
          .classList.add("hidden");

        document.getElementById(
          "loginBtn"
        ).textContent = username;

      });

      document.getElementById(
          "loginBtn"
        ).textContent =
          `${window.currentUser.name} (${window.currentUser.role})`;

  }
);