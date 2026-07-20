const DashboardModule = {

  render(container) {

const nextEvent =
  EventsModule?.events?.[0];

    const totalPosts =
      FeedModule?.posts?.length || 0;

    const totalServices =
  DirectoryModule?.services?.length || 0;  

    const totalEvents =
      EventsModule?.events?.length || 0;

    const totalChats =
      MessagesModule?.chats?.length || 0;

    const totalSurveys =
      SurveysModule?.surveys?.length || 0;

    const latestPosts =
      FeedModule?.posts?.slice(0, 2) || [];

    const upcomingEvent =
      EventsModule?.events?.[0];

    container.innerHTML = `

      <!-- HERO -->

      <div class="hero-section">

        <div>

          <h1>
            Welcome back ${
              window.currentUser?.name || "Guest"
            } 👋🏾
          </h1>

          <p class="desc">
            Bringing families, services,
            communication and support
            together in one smart hub.
          </p>

          <button
            class="primary-btn"
            id="exploreFeedBtn"
          >
            Explore Community
          </button>

        </div>

        <div class="hero-badge">
          🏠 Family Hub
        </div>

      </div>

      <!-- STATS -->

      <div class="stats-grid">

        <div class="card stat-card">

          <div class="stat-icon">
            📅
          </div>

          <h2>${totalEvents}</h2>

          <p>Upcoming Events</p>

        </div>

        <div class="card stat-card">

          <div class="stat-icon">
            💬
          </div>

          <h2>${totalChats}</h2>

          <p>Conversations</p>

        </div>

        <div class="card stat-card">

          <div class="stat-icon">
            📍
          </div>

          <h2>${totalServices}</h2>

          <p>Support Services</p>

        </div>

        <div class="card stat-card">

          <div class="stat-icon">
            📰
          </div>

          <h2>${totalPosts}</h2>

          <p>Community Posts</p>

        </div>

      </div>

      <!-- CONTENT GRID -->

      <div class="dashboard-grid">

        <!-- FEED PREVIEW -->

        <div>

          <div class="card">

            <h2>
              Community Updates
            </h2>

            <p class="desc">
              Latest posts from families
            </p>

          </div>

          ${latestPosts.map(post => `

            <div class="card post-preview">

              <div class="post-top">

                <div class="avatar">
                  ${post.author.charAt(0)}
                </div>

                <div>

                  <h4>
                    ${post.author}
                  </h4>

                  <span>
                    ${post.time}
                  </span>

                </div>

              </div>

              <p>
                ${post.content}
              </p>

            </div>

          `).join("")}

        </div>

        <!-- RIGHT PANEL -->

        <div>

          <div class="card">

            <h3>
              📅 Upcoming Event
            </h3>

            ${
              upcomingEvent
              ? `
                <div class="event-box">

                  <strong>
                    ${nextEvent?.title || "No Events"}
                  </strong>

                  <p class="desc">
                    ${nextEvent?.date || ""}
                    </p>

                  <p class="desc">
                    ${upcomingEvent.location}
                  </p>

                </div>
              `
              : `
                <p>
                  No events available.
                </p>
              `
            }

          </div>

          <div class="card">

              <h3>
                📊 Featured Survey
              </h3>

              <p>

                ${
                  SurveysModule.surveys[0]
                  ? SurveysModule.surveys[0].title
                  : "No surveys available"
                }

              </p>

              <p class="desc">

                ${
                  SurveysModule.surveys[0]
                  ? SurveysModule.surveys[0].options.reduce(
                      (sum,opt) =>
                        sum + opt.votes,
                      0
                    )
                  : 0
                }

                votes

              </p>

            </div>

          <div class="card">

            <h3>
              👤 Logged In User
            </h3>

            <p>
              ${
                window.currentUser?.name || "Guest"
              }
            </p>

            <p class="desc">
              ${
                window.currentUser?.role || "Visitor"
              }
            </p>

          </div>

        </div>

        

      </div>

    `;

    this.attachEvents();
  },

  attachEvents() {

    document
      .getElementById("exploreFeedBtn")
      ?.addEventListener("click", () => {

        renderPage("feed");

      });

  }

};