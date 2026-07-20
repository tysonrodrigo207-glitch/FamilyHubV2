const EventsModule = {

  events: [

    {
  id: 1,
  title: "Family Wellness Day",
  category: "Health",
  date: "2026-04-15",
  location: "Community Hall",
  description:
    "Join families for wellness activities, health talks and support sessions.",

  createdBy: "Tyson",

  responses: {
    Tyson: "going",
    Sarah: "maybe"
  }
},

{
  id: 2,
  title: "Parenting Workshop",
  category: "Education",
  date: "2026-04-20",
  location: "Family Centre",
  description:
    "Learn practical parenting skills and connect with other families.",

  createdBy: "Sarah",

  responses: {
    Sarah: "going"
  }
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

      <div class="events-layout">

        ${
          isAdmin
          ? `

            <div class="card">

              <h2>Create Event</h2>

              <input
                id="eventTitle"
                placeholder="Event Title"
              >

              <input
                id="eventCategory"
                placeholder="Category"
              >

              <input
                id="eventDate"
                type="date"
              >

              <input
                id="eventLocation"
                placeholder="Location"
              >

              <textarea
                id="eventDescription"
                placeholder="Description"
              ></textarea>

              <button
                id="createEventBtn"
                class="primary-btn"
              >
                Create Event
              </button>

            </div>

          `
          : ""
        }

        <div class="card">

          <h2>
            📅 Event Calendar
          </h2>

          ${this.events.map(event => `

            <div class="mini-event">

              <strong>
                ${event.date}
              </strong>

              <p>
                ${event.title}
              </p>

            </div>

          `).join("")}

        </div>

        <div class="card">

  <h2>
    Event Calendar
  </h2>

  <div class="event-calendar">

    ${this.events.map(event => `

      <div
        class="calendar-day"
        data-id="${event.id}"
      >

        <strong>
          ${new Date(event.date)
            .getDate()}
        </strong>

        <span>
          ${event.title}
        </span>

      </div>

    `).join("")}

  </div>

</div>

        <div class="events-list">

          ${this.events.map(event => `

            <div class="card event-card">

              <div class="event-header">

                <h3>
                  ${event.title}
                </h3>

                <span class="event-category">
                  ${event.category}
                </span>

              </div>

              <p class="desc">
                📅 ${event.date}
              </p>

              <p class="desc">
                📍 ${event.location}
              </p>

              <p>
                  ${event.description}
                </p>

                <p class="desc">
                  Created by ${event.createdBy}
                </p>

                ${
                  isAdmin
                  ? `
                    <div class="group-controls">

                      <button
                        class="primary-btn edit-event-btn"
                        data-id="${event.id}"
                      >
                        ✏ Edit
                      </button>

                      <button
                        class="primary-btn danger-btn delete-event-btn"
                        data-id="${event.id}"
                      >
                        🗑 Delete
                      </button>

                    </div>
                  `
                  : ""
                }

              <div class="event-rsvp">

                <button
                  class="action-btn going-btn"
                  data-id="${event.id}"
                >
                  ✅ Going (${
                    Object.values(
                      event.responses || {}
                    ).filter(
                      r => r === "going"
                    ).length
                  })
                </button>

                <button
                  class="action-btn maybe-btn"
                  data-id="${event.id}"
                >
                  🤔 Maybe (${
                    Object.values(
                      event.responses || {}
                    ).filter(
                      r => r === "maybe"
                    ).length
                  })
                </button>

                <button
                  class="action-btn notgoing-btn"
                  data-id="${event.id}"
                >
                  ❌ Can't (${
                    Object.values(
                      event.responses || {}
                    ).filter(
                      r => r === "notGoing"
                    ).length
                  })
                </button>

              </div>

            </div>

          `).join("")}

        </div>

      </div>

      <div
  id="eventModal"
  class="modal hidden"
>

  <div class="modal-box">

    <div id="eventModalContent">

    </div>

  </div>

</div>

    `;

    this.attachEvents();
  },

  attachEvents() {

    document
  .getElementById("createEventBtn")
  ?.addEventListener("click", () => {

    const title =
      document.getElementById("eventTitle").value.trim();

    const category =
      document.getElementById("eventCategory").value.trim();

    const date =
      document.getElementById("eventDate").value;

    const location =
      document.getElementById("eventLocation").value.trim();

    const description =
      document.getElementById("eventDescription").value.trim();

    if(
      !title ||
      !category ||
      !date ||
      !location
    ) return;

    this.events.unshift({

      /*const announcement =
MessagesModule.chats.find(
c => c.id === 999
);

if(announcement){

announcement.messages.push({

sender:"System",

text:
`📅 New Event: ${title} on ${date}`,

time:
new Date()
.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})

});

announcement.unread++;

}*/

      id: Date.now(),

      title,

      category,

      date,

      location,

      description,

      createdBy:
        window.currentUser.name,

      responses: {}

    });

    const announcement =
MessagesModule.chats.find(
c => c.id === 999
);

if(announcement){

announcement.messages.push({

sender:"System",

text:
`📅 New Event: ${title} on ${date}`,

time:
new Date()
.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})

});

announcement.unread++;

}

    FeedModule.posts.unshift({

  id: Date.now() + 1,

  author: "Family Hub",

  role: "System",

  time: "Just now",

  content:
    `📅 New Event Created: ${title}
     on ${date} at ${location}`,

  likes: 0,

  likedByUser: false,

  comments: []

});

    this.render(
      document.getElementById("contentArea")
    );

  });

    const setResponse = (
  eventId,
  response
) => {

  const event =
    this.events.find(
      e => e.id == eventId
    );

  if(!event) return;

  event.responses[
    window.currentUser.name
  ] = response;

  this.render(
    document.getElementById(
      "contentArea"
    )
  );

};

    document
.querySelectorAll(".going-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    setResponse(
      btn.dataset.id,
      "going"
    );

  });

});

    document
.querySelectorAll(".maybe-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    setResponse(
      btn.dataset.id,
      "maybe"
    );

  });

});

    document
.querySelectorAll(".notgoing-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    setResponse(
      btn.dataset.id,
      "notGoing"
    );

  });

});

document
.querySelectorAll(".delete-event-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    const id =
      Number(btn.dataset.id);

    this.events =
      this.events.filter(
        event => event.id !== id
      );

    this.render(
      document.getElementById(
        "contentArea"
      )
    );

  });

});

document
.querySelectorAll(".edit-event-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    const event =
      this.events.find(
        e => e.id == btn.dataset.id
      );

    if(!event) return;

    const title =
      prompt(
        "Edit title:",
        event.title
      );

    if(!title) return;

    event.title = title;

    this.render(
      document.getElementById(
        "contentArea"
      )
    );

  });

});

document
.querySelectorAll(".calendar-day")
.forEach(day => {

day.addEventListener("click", () => {

const event =
this.events.find(
e => e.id == day.dataset.id
);

document
.getElementById(
"eventModalContent"
)
.innerHTML = `

<h2>
${event.title}
</h2>

<p>
📅 ${event.date}
</p>

<p>
📍 ${event.location}
</p>

<p>
${event.description}
</p>

<hr>

<p>
✅ Going:
${event.going}
</p>

<p>
🤔 Maybe:
${event.maybe}
</p>

<p>
❌ Can't:
${event.notGoing}
</p>

<button
id="closeEventModal"
class="primary-btn"
>

Close

</button>

`;

document
.getElementById(
"eventModal"
)
.classList.remove(
"hidden"
);

document
.getElementById(
"closeEventModal"
)
.addEventListener(
"click",
() => {

document
.getElementById(
"eventModal"
)
.classList.add(
"hidden"
);

});

});

});

document
  .querySelectorAll(
    ".view-service-btn"
  )
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        const service =
          this.services.find(

            s =>
              s.id ===
              Number(
                btn.dataset.id
              )

          );

        if(!service) return;

        alert(

`SERVICE DETAILS

Name: ${service.name}

Category: ${service.category}

Phone: ${service.phone}

Location: ${service.location}

Description:
${service.description}`

        );

      }

    );

  });

document
  .querySelectorAll(
    ".filter-btn"
  )
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".filter-btn"
          )
          .forEach(b =>
            b.classList.remove(
              "active-filter"
            )
          );

        btn.classList.add(
          "active-filter"
        );

        const category =
          btn.dataset.category;

        const filtered =
          category === "All"
          ? this.services
          : this.services.filter(

              service =>
                service.category === category

            );

        document.getElementById(
          "servicesContainer"
        ).innerHTML =

          filtered.map(service =>

            this.serviceTemplate(service)

          ).join("");

        this.attachDeleteButtons();

      }

    );

  });

  }

};