const DashboardModule = {

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD DATA
  |--------------------------------------------------------------------------
  */

  getData() {

    const currentUser =
      window.currentUser || {};

    const posts =
      window.FeedModule?.posts || [];

    const events =
      window.EventsModule?.events || [];

    const services =
      window.DirectoryModule?.services || [];

    const chats =
      window.MessagesModule?.chats || [];

    const surveys =
      window.SurveysModule?.surveys || [];

    return {

      currentUser,
      posts,
      events,
      services,
      chats,
      surveys,

      totalPosts:
        posts.length,

      totalEvents:
        events.length,

      totalServices:
        services.length,

      totalChats:
        chats.length,

      totalSurveys:
        surveys.length,

      latestPosts:
        posts.slice(0, 3),

      upcomingEvent:
        events[0] || null,

      featuredSurvey:
        surveys[0] || null

    };

  },


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  async render(container) {

    const data =
      this.getData();


    const userName =
      data.currentUser.name ||
      data.currentUser.full_name ||
      "Guest";


    const userRole =
      data.currentUser.role ||
      "Member";


    container.innerHTML = `

      <!-- =====================================================
           HERO
      ====================================================== -->

      <section class="hero-section dashboard-hero">

        <div class="dashboard-hero-content">

          <span class="dashboard-eyebrow">
            🏠 Family Hub
          </span>

          <h1>
            Welcome back, ${userName} 👋🏾
          </h1>

          <p class="desc">
            Your community, services, events and
            conversations — all in one place.
          </p>

          <div class="dashboard-hero-actions">

            <button
              class="primary-btn"
              id="exploreFeedBtn"
            >
              📰 Explore Community
            </button>

            <button
              class="dashboard-secondary-btn"
              id="viewEventsBtn"
            >
              📅 View Events
            </button>

          </div>

        </div>

        <div class="hero-badge dashboard-hero-badge">
          <span>🏡</span>
          <strong>Family Hub</strong>
          <small>
            Connected community
          </small>
        </div>

      </section>


      <!-- =====================================================
           STATISTICS
      ====================================================== -->

      <section class="stats-grid dashboard-stats">

        <div
          class="card stat-card dashboard-stat-card"
          data-page="events"
        >

          <div class="stat-icon">
            📅
          </div>

          <h2>
            ${data.totalEvents}
          </h2>

          <p>
            Upcoming Events
          </p>

        </div>


        <div
          class="card stat-card dashboard-stat-card"
          data-page="messages"
        >

          <div class="stat-icon">
            💬
          </div>

          <h2>
            ${data.totalChats}
          </h2>

          <p>
            Conversations
          </p>

        </div>


        <div
          class="card stat-card dashboard-stat-card"
          data-page="directory"
        >

          <div class="stat-icon">
            📍
          </div>

          <h2>
            ${data.totalServices}
          </h2>

          <p>
            Support Services
          </p>

        </div>


        <div
          class="card stat-card dashboard-stat-card"
          data-page="feed"
        >

          <div class="stat-icon">
            📰
          </div>

          <h2>
            ${data.totalPosts}
          </h2>

          <p>
            Community Posts
          </p>

        </div>

      </section>


      <!-- =====================================================
           DASHBOARD CONTENT
      ====================================================== -->

      <section class="dashboard-grid">


        <!-- =================================================
             LEFT COLUMN
        ================================================== -->

        <div class="dashboard-main">


          <!-- COMMUNITY UPDATES -->

          <div class="card dashboard-section-card">

            <div class="dashboard-section-header">

              <div>

                <h2>
                  📰 Community Updates
                </h2>

                <p class="desc">
                  Latest conversations from Family Hub
                </p>

              </div>

              <button
                class="dashboard-link-btn"
                id="viewFeedBtn"
              >
                View all →
              </button>

            </div>

          </div>


          ${
            data.latestPosts.length > 0

            ?

            data.latestPosts
              .map(post => {

                const author =
                  post.author ||
                  "Family Hub Member";

                const initial =
                  author
                    .charAt(0)
                    .toUpperCase();

                return `

                  <div
                    class="card post-preview dashboard-post-card"
                  >

                    <div class="post-top">

                      <div class="avatar">
                        ${initial}
                      </div>

                      <div>

                        <h4>
                          ${author}
                        </h4>

                        <span>
                          ${post.time || "Recently"}
                        </span>

                      </div>

                    </div>

                    <p class="dashboard-post-content">
                      ${post.content || ""}
                    </p>

                  </div>

                `;

              })
              .join("")

            :

            `

              <div class="card dashboard-empty-card">

                <div class="dashboard-empty-icon">
                  📰
                </div>

                <h3>
                  No community updates yet
                </h3>

                <p class="desc">
                  Be the first to share something
                  with the Family Hub community.
                </p>

                <button
                  class="primary-btn"
                  id="createPostFromDashboard"
                >
                  Create a Post
                </button>

              </div>

            `

          }


          <!-- QUICK ACCESS -->

          <div class="card dashboard-quick-card">

            <div class="dashboard-section-header">

              <div>

                <h2>
                  ⚡ Quick Access
                </h2>

                <p class="desc">
                  Jump straight into Family Hub
                </p>

              </div>

            </div>


            <div class="dashboard-quick-grid">

              <button
                class="dashboard-quick-btn"
                data-page="feed"
              >
                <span>📰</span>
                <strong>Community</strong>
                <small>See latest posts</small>
              </button>


              <button
                class="dashboard-quick-btn"
                data-page="messages"
              >
                <span>💬</span>
                <strong>Messages</strong>
                <small>Open conversations</small>
              </button>


              <button
                class="dashboard-quick-btn"
                data-page="events"
              >
                <span>📅</span>
                <strong>Events</strong>
                <small>See upcoming events</small>
              </button>


              <button
                class="dashboard-quick-btn"
                data-page="directory"
              >
                <span>📍</span>
                <strong>Directory</strong>
                <small>Find services</small>
              </button>

            </div>

          </div>


        </div>


        <!-- =================================================
             RIGHT COLUMN
        ================================================== -->

        <div class="dashboard-sidebar">


          <!-- UPCOMING EVENT -->

          <div class="card dashboard-side-card">

            <div class="dashboard-section-header">

              <div>

                <h3>
                  📅 Upcoming Event
                </h3>

              </div>

              <button
                class="dashboard-icon-link"
                id="dashboardEventsBtn"
              >
                →
              </button>

            </div>


            ${
              data.upcomingEvent

              ?

              `

                <div class="event-box dashboard-event-box">

                  <span class="dashboard-mini-label">
                    NEXT EVENT
                  </span>

                  <strong>
                    ${data.upcomingEvent.title || "Untitled Event"}
                  </strong>

                  <p class="desc">
                    📅
                    ${data.upcomingEvent.date || "Date not available"}
                  </p>

                  <p class="desc">
                    📍
                    ${data.upcomingEvent.location || "Location not available"}
                  </p>

                </div>

              `

              :

              `

                <div class="dashboard-empty-small">

                  <span>
                    📅
                  </span>

                  <p>
                    No upcoming events.
                  </p>

                </div>

              `

            }

          </div>


          <!-- FEATURED SURVEY -->

          <div class="card dashboard-side-card">

            <div class="dashboard-section-header">

              <div>

                <h3>
                  📊 Featured Survey
                </h3>

              </div>

              <button
                class="dashboard-icon-link"
                id="dashboardSurveysBtn"
              >
                →
              </button>

            </div>


            ${
              data.featuredSurvey

              ?

              `

                <div class="dashboard-survey-preview">

                  <strong>
                    ${data.featuredSurvey.title}
                  </strong>

                  <p class="desc">

                    ${
                      data.featuredSurvey.options
                        ?.reduce(
                          (sum, option) =>
                            sum +
                            Number(option.votes || 0),
                          0
                        ) || 0
                    }

                    total votes

                  </p>

                  <button
                    class="dashboard-survey-btn"
                    id="openSurveyBtn"
                  >
                    View Survey →
                  </button>

                </div>

              `

              :

              `

                <div class="dashboard-empty-small">

                  <span>
                    📊
                  </span>

                  <p>
                    No surveys available.
                  </p>

                </div>

              `

            }

          </div>


          <!-- USER -->

          <div class="card dashboard-side-card">

            <div class="dashboard-user-card">

              <div class="avatar dashboard-user-avatar">
                ${userName.charAt(0).toUpperCase()}
              </div>

              <div>

                <h3>
                  ${userName}
                </h3>

                <span class="dashboard-role">
                  ${userRole}
                </span>

              </div>

            </div>

          </div>


          <!-- DASHBOARD MESSAGE -->

          <div class="card dashboard-tip-card">

            <span>
              💡
            </span>

            <div>

              <strong>
                Stay connected
              </strong>

              <p class="desc">
                Check your messages and
                community updates regularly.
              </p>

            </div>

          </div>


        </div>

      </section>

    `;


    this.attachEvents();

  },


  /*
  |--------------------------------------------------------------------------
  | EVENTS
  |--------------------------------------------------------------------------
  */

  attachEvents() {


    /*
    |--------------------------------------------------------------------------
    | FEED
    |--------------------------------------------------------------------------
    */

    document
      .getElementById("exploreFeedBtn")
      ?.addEventListener(
        "click",
        () => {

          renderPage("feed");

        }
      );


    document
      .getElementById("viewFeedBtn")
      ?.addEventListener(
        "click",
        () => {

          renderPage("feed");

        }
      );


    document
      .getElementById("createPostFromDashboard")
      ?.addEventListener(
        "click",
        () => {

          renderPage("feed");

        }
      );


    /*
    |--------------------------------------------------------------------------
    | EVENTS
    |--------------------------------------------------------------------------
    */

    document
      .getElementById("viewEventsBtn")
      ?.addEventListener(
        "click",
        () => {

          renderPage("events");

        }
      );


    document
      .getElementById("dashboardEventsBtn")
      ?.addEventListener(
        "click",
        () => {

          renderPage("events");

        }
      );


    /*
    |--------------------------------------------------------------------------
    | SURVEYS
    |--------------------------------------------------------------------------
    */

    document
      .getElementById("dashboardSurveysBtn")
      ?.addEventListener(
        "click",
        () => {

          renderPage("surveys");

        }
      );


    document
      .getElementById("openSurveyBtn")
      ?.addEventListener(
        "click",
        () => {

          renderPage("surveys");

        }
      );


    /*
    |--------------------------------------------------------------------------
    | STAT CARDS
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".dashboard-stat-card[data-page]"
      )
      .forEach(card => {

        card.addEventListener(
          "click",
          () => {

            renderPage(
              card.dataset.page
            );

          }
        );

      });


    /*
    |--------------------------------------------------------------------------
    | QUICK ACCESS
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".dashboard-quick-btn[data-page]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            renderPage(
              button.dataset.page
            );

          }
        );

      });

  }

};

