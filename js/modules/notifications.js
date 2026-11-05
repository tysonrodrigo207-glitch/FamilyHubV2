const NotificationModule = {

  /*
  |--------------------------------------------------------------------------
  | NOTIFICATION STATE
  |--------------------------------------------------------------------------
  */

  notifications: [],

  async loadFromServer() {
    try {
      const response = await fetch("php/api/notifications.php", {
        credentials: "include",
      });

      const result = await response.json();

      if (!result.success) {
        this.notifications = [];
        this.updateBadge();
        this.renderPanel();
        return;
      }

      this.notifications = (result.notifications || []).map((notification) => ({
        id: Number(notification.id),
        type: notification.type || "system",
        icon: notification.icon || "🔔",
        text: notification.text || notification.message || "New update",
        time: notification.time || "Just now",
        read: Boolean(notification.read),
        createdAt: Date.now(),
      }));

      this.updateBadge();
      this.renderPanel();
    } catch (error) {
      this.notifications = [];
      this.updateBadge();
      this.renderPanel();
    }
  },


  /*
  |--------------------------------------------------------------------------
  | ADD NOTIFICATION
  |--------------------------------------------------------------------------
  */

  add(
    text,
    type = "system",
    icon = "🔔"
  ) {

    const notification = {

      id: Date.now(),

      type,

      icon,

      text,

      time: "Just now",

      read: false,

      createdAt: Date.now()

    };


    this.notifications.unshift(
      notification
    );


    /*
    |--------------------------------------------------------------------------
    | KEEP NOTIFICATION LIST REASONABLE
    |--------------------------------------------------------------------------
    */

    if (
      this.notifications.length > 50
    ) {

      this.notifications =
        this.notifications.slice(0, 50);

    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE NOTIFICATION UI
    |--------------------------------------------------------------------------
    */

    this.updateBadge();

    this.renderPanel();

  },


  /*
  |--------------------------------------------------------------------------
  | UNREAD COUNT
  |--------------------------------------------------------------------------
  */

  getUnreadCount() {

    return this.notifications.filter(
      notification =>
        !notification.read
    ).length;

  },


  /*
  |--------------------------------------------------------------------------
  | MARK AS READ
  |--------------------------------------------------------------------------
  */

  async markAsRead(id) {

    const notification =
      this.notifications.find(
        item =>
          Number(item.id) === Number(id)
      );


    if (!notification) {

      return;

    }

    const formData = new FormData();
    formData.append("action", "read");
    formData.append("id", id);

    try {
      await fetch("php/api/notifications.php", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    } catch (error) {
      console.warn("Unable to sync notification state.", error);
    }

    notification.read = true;

    this.updateBadge();
    this.renderPanel();

  },


  /*
  |--------------------------------------------------------------------------
  | MARK ALL AS READ
  |--------------------------------------------------------------------------
  */

  async markAllAsRead() {

    const formData = new FormData();
    formData.append("action", "mark_all_read");

    try {
      await fetch("php/api/notifications.php", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    } catch (error) {
      console.warn("Unable to sync all notifications as read.", error);
    }

    this.notifications.forEach(
      notification => {

        notification.read = true;

      }
    );


    this.updateBadge();

    this.renderPanel();

  },


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async remove(id) {

    const formData = new FormData();
    formData.append("action", "delete");
    formData.append("id", id);

    try {
      await fetch("php/api/notifications.php", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    } catch (error) {
      console.warn("Unable to remove notification.", error);
    }

    this.notifications =
      this.notifications.filter(
        notification =>
          Number(notification.id) !==
          Number(id)
      );


    this.updateBadge();

    this.renderPanel();

  },


  /*
  |--------------------------------------------------------------------------
  | INITIALIZE
  |--------------------------------------------------------------------------
  */

  init() {

    this.loadFromServer();
    this.updateBadge();
    this.renderPanel();
    this.attachEvents();

  },


  /*
  |--------------------------------------------------------------------------
  | UPDATE BELL BADGE
  |--------------------------------------------------------------------------
  */

  updateBadge() {

    const badge =
      document.getElementById(
        "notificationBadge"
      );


    if (!badge) {

      return;

    }


    const unread =
      this.getUnreadCount();


    if (unread > 0) {

      badge.textContent =
        unread > 99
          ? "99+"
          : unread;

      badge.classList.remove(
        "hidden"
      );

    } else {

      badge.textContent = "0";

      badge.classList.add(
        "hidden"
      );

    }

  },


  /*
  |--------------------------------------------------------------------------
  | RENDER PANEL
  |--------------------------------------------------------------------------
  */

  renderPanel() {

    const container =
      document.getElementById(
        "notificationList"
      );


    if (!container) {

      return;

    }


    if (
      this.notifications.length === 0
    ) {

      container.innerHTML = `

        <div class="notification-empty">

          <div class="notification-empty-icon">
            🔔
          </div>

          <h4>
            You're all caught up
          </h4>

          <p>
            No notifications yet.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =

      this.notifications
        .map(notification => {

          return `

            <div
              class="
                notification-row
                ${
                  notification.read
                    ? ""
                    : "unread"
                }
              "
              data-notification-id="
                ${notification.id}
              "
            >

              <div class="notification-icon">

                ${notification.icon}

              </div>


              <div
                class="notification-content"
              >

                <p>
                  ${notification.text}
                </p>

                <small>
                  ${notification.time}
                </small>

              </div>


              <div
                class="notification-actions"
              >

                ${
                  !notification.read

                  ?

                  `

                    <button
                      class="notification-action"
                      data-action="read"
                      data-id="${notification.id}"
                      title="Mark as read"
                    >
                      ✓
                    </button>

                  `

                  :

                  ""

                }


                <button
                  class="notification-action delete"
                  data-action="delete"
                  data-id="${notification.id}"
                  title="Delete notification"
                >
                  ×
                </button>

              </div>

            </div>

          `;

        })
        .join("");

  },


  /*
  |--------------------------------------------------------------------------
  | ATTACH EVENTS
  |--------------------------------------------------------------------------
  */

  attachEvents() {


    /*
    |--------------------------------------------------------------------------
    | BELL
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "notificationBtn"
      )
      ?.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          this.togglePanel();

        }
      );


    /*
    |--------------------------------------------------------------------------
    | MARK ALL
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "markAllNotificationsBtn"
      )
      ?.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          this.markAllAsRead();

        }
      );


    /*
    |--------------------------------------------------------------------------
    | INDIVIDUAL ACTIONS
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "notificationList"
      )
      ?.addEventListener(
        "click",
        event => {

          const button =
            event.target.closest(
              "[data-action]"
            );


          if (!button) {

            return;

          }


          const action =
            button.dataset.action;


          const id =
            button.dataset.id;


          if (action === "read") {

            this.markAsRead(id);

          }


          if (action === "delete") {

            this.remove(id);

          }

        }
      );


    /*
    |--------------------------------------------------------------------------
    | CLOSE WHEN CLICKING OUTSIDE
    |--------------------------------------------------------------------------
    */

    document.addEventListener(
      "click",
      event => {

        const panel =
          document.getElementById(
            "notificationPanel"
          );

        const button =
          document.getElementById(
            "notificationBtn"
          );


        if (!panel || !button) {

          return;

        }


        if (
          !panel.contains(event.target) &&
          !button.contains(event.target)
        ) {

          panel.classList.add(
            "hidden"
          );

        }

      }
    );

  },


  /*
  |--------------------------------------------------------------------------
  | TOGGLE PANEL
  |--------------------------------------------------------------------------
  */

  togglePanel() {

    const panel =
      document.getElementById(
        "notificationPanel"
      );


    if (!panel) {

      return;

    }


    panel.classList.toggle(
      "hidden"
    );


    this.renderPanel();

  }

};

