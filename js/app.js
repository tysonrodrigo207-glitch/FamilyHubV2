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

    /*
    -----------------------
    RESTORE LOGIN
    -----------------------
    */

    const savedUser =
      getCurrentUser();

    if(savedUser){

      window.currentUser =
        savedUser;

      document
        .getElementById("loginBtn")
        .textContent =
          `${savedUser.name} (${savedUser.role})`;

    }

    renderPage("dashboard");

    setInterval(()=>{

    fetch(
        "php/api/update_activity.php",
        {
            credentials:"include"
        }
    );

},30000);

    /*
    -----------------------
    SIDEBAR
    -----------------------
    */

    document
      .querySelectorAll(".nav-btn")
      .forEach(btn=>{

        btn.addEventListener(

          "click",

          ()=>{

            renderPage(
              btn.dataset.page
            );

          }

        );

      });

    /*
    -----------------------
    THEME
    -----------------------
    */

    document
      .getElementById("themeToggle")
      .addEventListener(

        "click",

        ()=>{

          const body =
            document.body;

          body.dataset.theme =

            body.dataset.theme === "light"

            ? "dark"

            : "light";

        }

      );

    /*
    -----------------------
    LOGIN BUTTON
    -----------------------
    */

    document
      .getElementById("loginBtn")
      .addEventListener(

        "click",

        async ()=>{

          /*
          If already logged in
          */

          if(window.currentUser){

            await logout();

            location.reload();

            return;

          }

          document
            .getElementById(
              "loginModal"
            )
            .classList.remove(
              "hidden"
            );

        }

      );

    /*
    -----------------------
    SUBMIT LOGIN
    -----------------------
    */

    document
      .getElementById("submitLogin")
      .addEventListener(

        "click",

        async ()=>{

          const username =

            document
              .getElementById(
                "username"
              )
              .value
              .trim();

          const password =

            document
              .getElementById(
                "password"
              )
              .value
              .trim();

          const success =

            await login(

              username,

              password

            );

          if(!success){

            return;

          }

          document
            .getElementById(
              "loginModal"
            )
            .classList.add(
              "hidden"
            );

          document
            .getElementById(
              "loginBtn"
            )
            .textContent =

            `${window.currentUser.name} (${window.currentUser.role})`;

          renderPage("dashboard");

        }

      );

      NotificationModule.init();
  }

);