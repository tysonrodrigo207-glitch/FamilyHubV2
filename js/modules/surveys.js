const SurveysModule = {

  surveys: [],

  /*
  |--------------------------------------------------------------------------
  | LOAD SURVEYS
  |--------------------------------------------------------------------------
  */

  async loadSurveys() {

    try {

      const response = await fetch(
        "php/api/surveys.php?action=list",
        {
          credentials: "include"
        }
      );

      const result = await response.json();

      if (!result.success) {

        console.error(
          result.message || "Failed to load surveys."
        );

        this.surveys = [];

        return;

      }

      this.surveys = result.data || [];

    } catch (error) {

      console.error(
        "Survey loading error:",
        error
      );

      this.surveys = [];

    }

  },


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  async render(container) {

    await this.loadSurveys();

    const isAdmin =
      window.currentUser &&
      (
        window.currentUser.role === "Admin" ||
        window.currentUser.role === "Moderator"
      );


    container.innerHTML = `

  <div class="survey-page-header">

    <div>

      <h1 class="survey-page-title">
        Surveys
      </h1>

      <p class="survey-page-description">
        Share questions, gather opinions, and see what the Family Hub community thinks.
      </p>

    </div>

    <div class="survey-page-stat">

      📊

      ${this.surveys.length}

      ${
        this.surveys.length === 1
          ? "survey"
          : "surveys"
      }

    </div>

  </div>


  ${
    isAdmin
      ? `

        <div class="card survey-create-card">

          <div class="survey-create-header">

            <div class="survey-create-icon">
              📊
            </div>

            <div>

              <h2 class="survey-create-title">
                Create a survey
              </h2>

              <p class="survey-create-description">
                Ask the Family Hub community a question and collect their opinions.
              </p>

            </div>

          </div>


          <div class="survey-form-group">

            <label for="surveyTitle">
              Survey question
            </label>

            <input
              id="surveyTitle"
              placeholder="e.g. Which device do you use most often?"
            >

          </div>


          <div class="survey-options-label">

            <label>
              Answer options
            </label>

            <span>
              At least 2 options required
            </span>

          </div>


          <div class="survey-options-grid">

            <div class="survey-form-group">

              <input
                id="option1"
                placeholder="Option 1"
              >

            </div>


            <div class="survey-form-group">

              <input
                id="option2"
                placeholder="Option 2"
              >

            </div>


            <div class="survey-form-group">

              <input
                id="option3"
                placeholder="Option 3 (optional)"
              >

            </div>


            <div class="survey-form-group">

              <input
                id="option4"
                placeholder="Option 4 (optional)"
              >

            </div>

          </div>


          <div class="survey-form-group">

            <label for="surveyExpiry">
              Survey expiry
            </label>

            <input
              id="surveyExpiry"
              type="date"
            >

          </div>


          <div class="survey-create-footer">

            <span class="survey-create-hint">
              💡 Members can vote once per survey.
            </span>

            <button
              id="createSurveyBtn"
              class="primary-btn"
            >
              Create Survey
            </button>

          </div>

        </div>

      `
      : ""
  }


  <div class="card survey-search-card">

    <div class="survey-search-wrapper">

      <span class="survey-search-icon">
        🔍
      </span>

      <input
        id="surveySearch"
        placeholder="Search surveys..."
      >

    </div>

  </div>


  <div id="surveyContainer">

    ${
      this.surveys.length > 0

        ? this.surveys
            .map(survey =>
              this.surveyTemplate(survey)
            )
            .join("")

        : `

          <div class="card survey-empty">

            <div class="survey-empty-icon">
              📊
            </div>

            <h3>
              No surveys yet
            </h3>

            <p>
              ${
                isAdmin
                  ? "Create the first survey and start gathering opinions."
                  : "There are currently no surveys available."
              }
            </p>

          </div>

        `
    }

  </div>

`;

    this.attachEvents();

  },


  /*
  |--------------------------------------------------------------------------
  | SURVEY TEMPLATE
  |--------------------------------------------------------------------------
  */

  surveyTemplate(survey) {

  const totalVotes =
    survey.options.reduce(
      (sum, option) =>
        sum + Number(option.votes || 0),
      0
    );


  const expired =
    survey.expiry &&
    new Date(
      survey.expiry + "T23:59:59"
    ) < new Date();


  const isAdmin =
    window.currentUser &&
    (
      window.currentUser.role === "Admin" ||
      window.currentUser.role === "Moderator"
    );


  return `

    <div
      class="card survey-card"
      data-survey-title="${(
        survey.title || ""
      ).toLowerCase()}"
    >

      <div class="survey-card-header">

        <div>

          <h3 class="survey-card-title">
            ${survey.title}
          </h3>

          <div class="survey-meta">

            <span class="survey-meta-item">
              👤
              <span>
                Created by
                <strong>
                  ${survey.createdBy || "Unknown"}
                </strong>
              </span>
            </span>

            <span class="survey-meta-item">
              🗳
              <span>
                <strong>
                  ${totalVotes}
                </strong>
                ${totalVotes === 1 ? "vote" : "votes"}
              </span>
            </span>

            <span class="survey-meta-item">
              📅
              <span>
                ${
                  survey.expiry
                    ? `Ends ${survey.expiry}`
                    : "No expiry"
                }
              </span>
            </span>

          </div>

        </div>


        <span
          class="survey-status ${
            expired ? "closed" : ""
          }"
        >

          ${
            expired
              ? "Closed"
              : "Active"
          }

        </span>

      </div>


      ${
        expired
          ? `

            <div class="expired-survey">

              ⏰
              This survey is now closed.

            </div>

          `
          : ""
      }


      ${
        survey.hasVoted && !expired
          ? `

            <div class="survey-voted-message">

              <span>✓</span>

              You have already voted in this survey.

            </div>

          `
          : ""
      }


      <div class="survey-options">

        ${
          survey.options
            .map(option => {

              const votes =
                Number(
                  option.votes || 0
                );


              const percentage =
                totalVotes > 0
                  ? Math.round(
                      (
                        votes /
                        totalVotes
                      ) * 100
                    )
                  : 0;


              return `

                <div class="survey-option">

                  <button

                    class="vote-btn"

                    data-survey="${survey.id}"

                    data-option="${option.id}"

                    ${
                      expired ||
                      survey.hasVoted
                        ? "disabled"
                        : ""
                    }

                  >

                    ${option.text}

                    <span>
                      ${votes}
                    </span>

                  </button>


                  <div class="vote-bar">

                    <div
                      class="vote-fill"
                      style="width:${percentage}%"
                    ></div>

                  </div>


                  <small>

                    ${percentage}%

                  </small>

                </div>

              `;

            })
            .join("")
        }

      </div>


      ${
        isAdmin
          ? `

            <button

              class="delete-survey-btn"

              data-id="${survey.id}"

            >

              🗑 Delete survey

            </button>

          `
          : ""
      }

    </div>

  `;

},


  /*
  |--------------------------------------------------------------------------
  | CREATE SURVEY
  |--------------------------------------------------------------------------
  */

  async createSurvey() {

    const title =
      document
        .getElementById("surveyTitle")
        .value
        .trim();


    const expiry =
      document
        .getElementById("surveyExpiry")
        .value;


    const optionInputs = [
      "option1",
      "option2",
      "option3",
      "option4"
    ];


    const options =
      optionInputs
        .map(id => {

          return document
            .getElementById(id)
            ?.value
            .trim();

        })
        .filter(Boolean);


    if (!title) {

      alert(
        "Please enter a survey question."
      );

      return;

    }


    if (options.length < 2) {

      alert(
        "Please provide at least two options."
      );

      return;

    }


    try {

      const response = await fetch(

        "php/api/surveys.php?action=create",

        {

          method: "POST",

          credentials: "include",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            title,

            expiry,

            options

          })

        }

      );


      const result =
        await response.json();


      if (!result.success) {

        alert(
          result.message ||
          "Could not create survey."
        );

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | NOTIFICATION
      |--------------------------------------------------------------------------
      */

      if (
        typeof NotificationModule !==
        "undefined"
      ) {

        NotificationModule.add(
          `New survey created: ${title}`,
          "survey",
          "📊"
        );

      }


      /*
      |--------------------------------------------------------------------------
      | FEED POST
      |--------------------------------------------------------------------------
      */

      if (
        typeof FeedModule !==
        "undefined"
      ) {

        FeedModule.posts =
          FeedModule.posts || [];


        FeedModule.posts.unshift({

          id:
            Date.now(),

          author:
            "Survey System",

          role:
            "System",

          time:
            "Just now",

          content:
            `📊 New Survey Created: ${title}`,

          media:
            "",

          likes:
            0,

          likedByUser:
            false,

          comments:
            []

        });

      }


      /*
      |--------------------------------------------------------------------------
      | REFRESH
      |--------------------------------------------------------------------------
      */

      await this.render(
        document.getElementById(
          "contentArea"
        )
      );


    } catch (error) {

      console.error(
        "Create survey error:",
        error
      );

      alert(
        "Something went wrong while creating the survey."
      );

    }

  },


  /*
  |--------------------------------------------------------------------------
  | VOTE
  |--------------------------------------------------------------------------
  */

  async voteSurvey(
    surveyId,
    optionId
  ) {

    try {

      const response = await fetch(

        "php/api/surveys.php?action=vote",

        {

          method: "POST",

          credentials: "include",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            survey_id:
              Number(surveyId),

            option_id:
              Number(optionId)

          })

        }

      );


      const result =
        await response.json();


      if (!result.success) {

        alert(
          result.message ||
          "Unable to record your vote."
        );

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | REFRESH RESULTS
      |--------------------------------------------------------------------------
      */

      await this.render(
        document.getElementById(
          "contentArea"
        )
      );


    } catch (error) {

      console.error(
        "Voting error:",
        error
      );

      alert(
        "Something went wrong while voting."
      );

    }

  },


  /*
  |--------------------------------------------------------------------------
  | DELETE SURVEY
  |--------------------------------------------------------------------------
  */

  async deleteSurvey(
    surveyId
  ) {

    if (
      !confirm(
        "Are you sure you want to delete this survey?"
      )
    ) {

      return;

    }


    try {

      const response = await fetch(

        "php/api/surveys.php?action=delete",

        {

          method: "POST",

          credentials: "include",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            id:
              Number(surveyId)

          })

        }

      );


      const result =
        await response.json();


      if (!result.success) {

        alert(
          result.message ||
          "Unable to delete survey."
        );

        return;

      }


      await this.render(
        document.getElementById(
          "contentArea"
        )
      );


    } catch (error) {

      console.error(
        "Delete survey error:",
        error
      );

      alert(
        "Something went wrong while deleting the survey."
      );

    }

  },


  /*
  |--------------------------------------------------------------------------
  | EVENTS
  |--------------------------------------------------------------------------
  */

  attachEvents() {


    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "createSurveyBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          this.createSurvey();

        }
      );


    /*
    |--------------------------------------------------------------------------
    | VOTING
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".vote-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            this.voteSurvey(

              btn.dataset.survey,

              btn.dataset.option

            );

          }
        );

      });


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".delete-survey-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            this.deleteSurvey(
              btn.dataset.id
            );

          }
        );

      });


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    document
      .getElementById(
        "surveySearch"
      )
      ?.addEventListener(
        "input",
        event => {

          const search =
            event.target.value
              .toLowerCase()
              .trim();


          document
            .querySelectorAll(
              ".survey-card"
            )
            .forEach(card => {

              const title =
                card.dataset
                  .surveyTitle || "";


              card.style.display =
                title.includes(search)
                ? ""
                : "none";

            });

        }
      );

  }

};