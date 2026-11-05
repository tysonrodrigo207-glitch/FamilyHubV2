function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const modules = {
  dashboard: DashboardModule,
  feed: FeedModule,
  messages: MessagesModule,
  events: EventsModule,
  directory: DirectoryModule,
  surveys: SurveysModule,
  profile: {
    render(container) {
      const user = window.currentUser || getCurrentUser() || {
        name: "Family Member",
        username: "familymember",
        role: "Member",
        email: "",
        bio: ""
      };

      const avatar = (user.profile_picture && user.profile_picture !== "")
        ? user.profile_picture
        : "assets/images/default-avatar.jpg";

      const safeName = escapeHtml(user.name || user.full_name || user.username || "Family Member");
      const safeUsername = escapeHtml(user.username || "Not set");
      const safeEmail = escapeHtml(user.email || "Not set");
      const safeBio = escapeHtml(user.bio || "This family member has not added a bio yet.");
      const safeRole = escapeHtml(user.role || "Member");

      container.innerHTML = `
        <div class="card profile-shell">
          <div class="profile-summary">
            <img
              class="member-avatar profile-page-avatar"
              src="${avatar}"
              alt="${safeName}"
              onerror="this.onerror=null;this.src='assets/images/default-avatar.jpg';"
            >
            <div>
              <h2>${safeName}</h2>
              <p class="desc">${safeRole} • Family Hub member</p>
            </div>
          </div>

          <div class="profile-grid">
            <div class="profile-card">
              <strong>Username</strong>
              <p>${safeUsername}</p>
            </div>
            <div class="profile-card">
              <strong>Email</strong>
              <p>${safeEmail}</p>
            </div>
            <div class="profile-card">
              <strong>Access</strong>
              <p>${safeRole}</p>
            </div>
          </div>

          <div class="profile-details-card">
            <h3>About</h3>
            <p>${safeBio}</p>
          </div>

          <form id="profileForm" class="profile-edit-form" enctype="multipart/form-data">
            <h3>Profile settings</h3>
            <label>
              <span>Full name</span>
              <input type="text" name="full_name" value="${safeName}" required>
            </label>
            <label>
              <span>Bio</span>
              <textarea name="bio" rows="4" placeholder="Tell the family a little about yourself">${safeBio}</textarea>
            </label>
            <label>
              <span>Profile image</span>
              <input type="file" name="profile_image" accept="image/*">
            </label>
            <div class="profile-form-actions">
              <button type="submit" class="primary-btn">Save profile</button>
            </div>
          </form>
        </div>
      `;

      const form = document.getElementById("profileForm");
      form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector("button[type='submit']");
        const formData = new FormData(form);

        submitButton.disabled = true;
        submitButton.textContent = "Saving...";

        try {
          const response = await fetch("php/api/update_profile.php", {
            method: "POST",
            body: formData,
            credentials: "include"
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to update profile.");
          }

          window.currentUser = result.user;
          localStorage.setItem("familyHubUser", JSON.stringify(result.user));
          renderPage("profile");
        } catch (error) {
          alert(error.message || "Unable to update profile.");
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Save profile";
          }
        }
      });
    }
  }
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
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const sidebar = document.querySelector(".sidebar");

    function toggleSidebar(forceOpen) {
      if (!sidebar) return;

      const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !sidebar.classList.contains("open");
      sidebar.classList.toggle("open", shouldOpen);

      if (sidebarBackdrop) {
        sidebarBackdrop.classList.toggle("hidden", !shouldOpen);
      }
    }

    const savedUser = getCurrentUser();

    if (savedUser) {
      window.currentUser = savedUser;
      loginBtn.textContent = `${savedUser.name} (${savedUser.role})`;
      hideAuthScreen();
      renderPage("dashboard");
    } else {
      showAuthScreen("login");
    }

    if (window.innerWidth <= 900) {
      toggleSidebar(false);
    }

    setInterval(() => {
      fetch("php/api/update_activity.php", {
        credentials: "include"
      });
    }, 30000);

    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        renderPage(btn.dataset.page);
        if (window.innerWidth <= 900) {
          toggleSidebar(false);
        }
      });
    });

    sidebarToggle?.addEventListener("click", () => toggleSidebar());
    sidebarBackdrop?.addEventListener("click", () => toggleSidebar(false));

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
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        toggleSidebar(true);
      } else {
        toggleSidebar(false);
      }
    });
  }
);