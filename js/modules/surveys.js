const SurveysModule = {

  surveys: [

    {
      id: 1,

      title:
        "Which new family service would help most?",

      expiry: "2026-12-31",

      votedUsers: [],

      options: [

        {
          text: "Health Support",
          votes: 5
        },

        {
          text: "Education Support",
          votes: 3
        },

        {
          text: "Legal Aid",
          votes: 2
        }

      ],

      createdBy: "Tyson"

    }

  ],

  render(container) {

    const isAdmin =
      window.currentUser &&
      (
        window.currentUser.role === "Admin" ||
        window.currentUser.role === "Moderator"
      );

    container.innerHTML = `

      ${
        isAdmin
        ? `

          <div class="card">

            <h2>
              Create Survey
            </h2>

            <input
              id="surveyTitle"
              placeholder="Survey Question"
            >

            <input
              id="option1"
              placeholder="Option 1"
            >

            <input
              id="option2"
              placeholder="Option 2"
            >

            <input
              id="option3"
              placeholder="Option 3"
            >

            <input
              id="surveyExpiry"
              type="date"
            >

            <button
              id="createSurveyBtn"
              class="primary-btn"
            >
              Create Survey
            </button>

          </div>

        `
        : ""
      }

      <div id="surveyContainer">

        ${this.surveys
          .map(survey =>
            this.surveyTemplate(survey)
          )
          .join("")}

      </div>

    `;

    this.attachEvents();

  },

  surveyTemplate(survey) {

    const totalVotes =
      survey.options.reduce(
        (sum, option) =>
          sum + option.votes,
        0
      );

    const expired =
      survey.expiry &&
      new Date(survey.expiry) <
      new Date();

    return `

      <div class="card survey-card">

        <h3>
          ${survey.title}
        </h3>

        <p class="desc">
          Total Votes:
          ${totalVotes}
        </p>

        <p class="desc">
          Ends:
          ${survey.expiry || "No expiry"}
        </p>

        ${
          expired
          ? `
            <div class="expired-survey">
              ⏰ Survey Closed
            </div>
          `
          : ""
        }

        ${survey.options.map(option => {

          const percentage =
            totalVotes > 0
            ? Math.round(
                (option.votes / totalVotes) * 100
              )
            : 0;

          return `

            <div class="survey-option">

              <button
                class="action-btn vote-btn"
                data-survey="${survey.id}"
                data-option="${option.text}"
                ${
                  expired
                  ? "disabled"
                  : ""
                }
              >

                ${option.text}
                (${option.votes})

                ${
                  totalVotes > 0
                  ? Math.round(
                      (option.votes / totalVotes) * 100
                    )
                  : 0
                }%

              </button>

              <div class="vote-bar">

                <div
                  class="vote-fill"
                  style="width:${percentage}%"
                ></div>

              </div>

              <small>

                ${option.votes} votes
                (${percentage}%)

              </small>

            </div>

          `;

        }).join("")}

        ${
          ["Admin","Moderator"]
          .includes(
            window.currentUser.role
          )

          ? `

            <button
              class="delete-survey-btn"
              data-id="${survey.id}"
            >

              🗑 Delete Survey

            </button>

          `
          : ""
        }

      </div>

    `;
  },

  attachEvents() {

    /*
    CREATE SURVEY
    */

    document
      .getElementById(
        "createSurveyBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          const title =
            document
              .getElementById(
                "surveyTitle"
              )
              .value
              .trim();

          const option1 =
            document
              .getElementById(
                "option1"
              )
              .value
              .trim();

          const option2 =
            document
              .getElementById(
                "option2"
              )
              .value
              .trim();

          const option3 =
            document
              .getElementById(
                "option3"
              )
              .value
              .trim();

          const expiry =
            document
              .getElementById(
                "surveyExpiry"
              )
              .value;

          if (
            !title ||
            !option1 ||
            !option2
          ) {
            return;
          }

          this.surveys.unshift({

            id: Date.now(),

            title,

            expiry,

            createdBy:
              window.currentUser.name,

            votedUsers: [],

            options: [

              {
                text: option1,
                votes: 0
              },

              {
                text: option2,
                votes: 0
              },

              {
                text: option3,
                votes: 0
              }

            ]

          });

          NotificationModule.add(
            `📊 New Survey Created: ${title}`
          );

          /*
          AUTO POST TO FEED
          */

          FeedModule.posts.unshift({

            id: Date.now() + 1,

            author: "Survey System",

            role: "System",

            time: "Just now",

            content:
              `📊 New Survey Created: ${title}`,

            media: "",

            likes: 0,

            likedByUser: false,

            comments: []

          });

          this.render(
            document.getElementById(
              "contentArea"
            )
          );

        }
      );

    /*
    VOTING
    */

    document
      .querySelectorAll(
        ".vote-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            const survey =
              this.surveys.find(
                s =>
                  s.id ===
                  Number(
                    btn.dataset.survey
                  )
              );

            if (!survey) return;

            const expired =
              survey.expiry &&
              new Date(
                survey.expiry
              ) < new Date();

            if (expired) {

              alert(
                "This survey has expired."
              );

              return;
            }

            if (
              survey.votedUsers.includes(
                window.currentUser.name
              )
            ) {

              alert(
                "You already voted."
              );

              return;
            }

            const option =
              survey.options.find(
                o =>
                  o.text ===
                  btn.dataset.option
              );

            if (!option) return;

            option.votes++;

            survey.votedUsers.push(
              window.currentUser.name
            );

            this.render(
              document.getElementById(
                "contentArea"
              )
            );

          }
        );

      });

    /*
    DELETE SURVEY
    */

    document
      .querySelectorAll(
        ".delete-survey-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            const id =
              Number(
                btn.dataset.id
              );

            this.surveys =
              this.surveys.filter(
                survey =>
                  survey.id !== id
              );

            this.render(
              document.getElementById(
                "contentArea"
              )
            );

          }
        );

      });

  }

};