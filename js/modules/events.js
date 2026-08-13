const EventsModule = {

  events: [],

  async render(container) {

    await this.loadEvents();

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
                ${event.event_date}
              </strong>

              <p>
                ${event.title}
              </p>

            </div>

          `).join("")}

        </div>

        <div class="card">

    <div class="calendar-header">

        <button id="prevMonth">◀</button>

        <h2 id="calendarTitle"></h2>

        <button id="nextMonth">▶</button>

    </div>

    <div class="calendar-grid" id="calendarGrid">

    </div>

</div>

        <div class="events-list">

          ${this.events.map(event => `

            <div class="card event-card">

            <div class="event-cover">

    <img
        src="${
            event.image
            ? event.image
            : 'assets/images/default-event.jpeg'
        }"
        alt="Event Cover"
    >

</div>

              <div class="event-header">

                <h3>
                  ${event.title}
                </h3>

                <span class="event-category">
                📅 Event
                </span>

              </div>

              <p class="desc">
               📅 ${event.event_date}

                <br>

                            <div class="event-countdown">

            ⏳ ${this.getCountdown(event.event_date)}

            </div>
              </p>

              <p class="desc">
                📍
                <a
                href="https://www.google.com/maps/search/${encodeURIComponent(event.location)}"
                target="_blank"
                class="event-location-link"
                >
                ${event.location}
                </a>
              </p>

              <p>
                  ${event.description}
                </p>

                <p class="desc">
                 Created by ${event.full_name}
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
                  ✅ Going (${event.going_count})
                </button>

                <button
                  class="action-btn maybe-btn"
                  data-id="${event.id}"
                >
                 🤔 Maybe (${event.maybe_count})
                </button>

                <button
                  class="action-btn notgoing-btn"
                  data-id="${event.id}"
                >
                  ❌ Can't (${event.notgoing_count})
                </button>

              </div>
              <div class="event-attendees">

              ${this.renderAttendees(event.attendees)}

              </div>

            </div>

          `).join("")}

        </div>

      </div>

      <div id="eventModal" class="event-modal hidden">

  <div class="event-modal-box">

    <div id="eventModalContent">

    </div>

  </div>

</div>

    `;

    this.attachEvents();
    this.renderCalendar();

    document
    .getElementById("prevMonth")
    ?.addEventListener("click",()=>{

    this.currentMonth.setMonth(
    this.currentMonth.getMonth()-1
    );

    this.renderCalendar();

    });

    document
    .getElementById("nextMonth")
    ?.addEventListener("click",()=>{

    this.currentMonth.setMonth(
    this.currentMonth.getMonth()+1
    );

    this.renderCalendar();

    });
  },

  async loadEvents(){

    const response = await fetch(

        "php/api/events.php",

        {
            credentials:"include"
        }

    );

    const result = await response.json();

    if(!result.success) return;

    this.events = result.data;

},

currentMonth: new Date(),

renderCalendar(){

const grid =
document.getElementById("calendarGrid");

const title =
document.getElementById("calendarTitle");

if(!grid) return;

grid.innerHTML = "";

const year =
this.currentMonth.getFullYear();

const month =
this.currentMonth.getMonth();

title.textContent =
this.currentMonth.toLocaleString(
"default",
{
month:"long",
year:"numeric"
}
);

const firstDay =
new Date(year,month,1).getDay();

const daysInMonth =
new Date(year,month+1,0).getDate();

const week =
["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

week.forEach(day=>{

grid.innerHTML +=
`<div class="weekday">${day}</div>`;

});

for(let i=0;i<firstDay;i++){

grid.innerHTML +=
`<div class="empty"></div>`;

}

for(let day=1;day<=daysInMonth;day++){

const event =
this.events.find(e=>{

const d =
new Date(e.event_date);

return d.getDate()==day &&
d.getMonth()==month &&
d.getFullYear()==year;

});

grid.innerHTML += `

<div
class="calendar-cell ${event?"has-event":""}"
${event?`data-id="${event.id}"`:""}>

<div class="day-number">

${day}

</div>

${event?

`<small>${event.title}</small>`

:""}

</div>

`;

}

grid
.querySelectorAll(".has-event")
.forEach(cell=>{

cell.onclick=()=>{

const id=cell.dataset.id;

document
.querySelector(
`.calendar-day[data-id="${id}"]`
)?.click();

};

});

},

  attachEvents() {

    document
  .getElementById("createEventBtn")
  ?.addEventListener("click", async () => {

    const title =
      document.getElementById("eventTitle").value.trim();

    const date =
      document.getElementById("eventDate").value;

    const location =
      document.getElementById("eventLocation").value.trim();

    const description =
      document.getElementById("eventDescription").value.trim();

    if(
    !title ||
    !date ||
    !location
    ) return;

    const form = new FormData();

form.append("title",title);

form.append("description",description);

form.append("location",location);

form.append("event_date",date);

form.append("event_time","");

const response = await fetch(

    "php/api/create_event.php",

    {

        method:"POST",

        body:form,

        credentials:"include"

    }

);

const result = await response.json();

if(result.success){

    this.render(
        document.getElementById("contentArea")
    );

}

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

    /*FeedModule.posts.unshift({

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
*/
    this.render(
      document.getElementById("contentArea")
    );

  });

    document
.querySelectorAll(".going-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    this.rsvp(
      btn.dataset.id,
      "going"
    );

  });

});

    document
.querySelectorAll(".maybe-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    this.rsvp(
      btn.dataset.id,
      "maybe"
    );

  });

});

    document
.querySelectorAll(".notgoing-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    this.rsvp(
      btn.dataset.id,
      "not_going"
    );

  });

});

document.querySelectorAll(".delete-event-btn")
.forEach(btn=>{

btn.onclick = async ()=>{

if(!confirm("Delete event?")) return;

const form=new FormData();

form.append("id",btn.dataset.id);

const response=await fetch(
"php/api/delete_event.php",
{
method:"POST",
body:form,
credentials:"include"
}
);

const result=await response.json();

if(result.success){

this.render(
document.getElementById("contentArea")
);

}

};

});

document.querySelectorAll(".edit-event-btn")
.forEach(btn=>{

btn.onclick = async ()=>{

const event=this.events.find(
e=>e.id==btn.dataset.id
);

const title=prompt("Title",event.title);

if(title===null) return;

const description=prompt(
"Description",
event.description
);

const location=prompt(
"Location",
event.location
);

const form=new FormData();

form.append("id",event.id);
form.append("title",title);
form.append("description",description);
form.append("location",location);

const response=await fetch(
"php/api/edit_event.php",
{
method:"POST",
body:form,
credentials:"include"
}
);

const result=await response.json();

if(result.success){

this.render(
document.getElementById("contentArea")
);

}

};

});

document
.querySelectorAll(".calendar-day")
.forEach(day => {

day.addEventListener("click", () => {

const event =
this.events.find(
e => e.id == day.dataset.id
);

document.getElementById("eventModalContent").innerHTML = `

<div class="event-modal-header">

<img
src="${
event.image
?
event.image
:
"assets/images/download.jpeg"
}"
class="event-modal-image">

<div class="event-modal-overlay">

<h2>${event.title}</h2>

<p>📅 ${event.event_date}</p>

</div>

</div>

<div class="event-modal-body">

<div class="event-info">

<div>

📍 <strong>📍
<a
href="https://www.google.com/maps/search/${encodeURIComponent(event.location)}"
target="_blank"
class="event-location-link"
>
${event.location}
</a></strong>

</div>

<div>

⏳ ${this.getCountdown(event.event_date)}

</div>

</div>

<p class="event-description">

${event.description}

</p>

<hr>

<div class="event-stats">

<div>

✅ ${event.going_count}

</div>

<div>

🤔 ${event.maybe_count}

</div>

<div>

❌ ${event.notgoing_count}

</div>

</div>

<button
id="closeEventModal"
class="primary-btn">

Close

</button>

</div>

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
},

  async rsvp(eventId,status){

const form = new FormData();

form.append("event_id",eventId);

form.append("status",status);

const response = await fetch(

"php/api/rsvp_event.php",

{

method:"POST",

body:form,

credentials:"include"

}

);

const result = await response.json();

if(result.success){

await this.render(

document.getElementById("contentArea")

);

}

},

countdown(date){

const now = new Date();

const event = new Date(date);

const diff = event - now;

if(diff <= 0){

return "Event has started";

}

const days = Math.floor(diff / 86400000);

const hours = Math.floor(
(diff % 86400000) / 3600000
);

return `${days} days ${hours} hrs left`;

},

getCountdown(date){

const now=new Date();

const event=new Date(date);

const diff=event-now;

if(diff<=0){

return "Event Started";

}

const days=Math.floor(diff/(1000*60*60*24));

const hours=Math.floor(

(diff%(1000*60*60*24))/

(1000*60*60)

);

return `${days} Days ${hours} Hours Left`;

},

renderAttendees(list){

if(!list){

return "<small>No attendees yet</small>";

}

const people = list.split("|");

return people.slice(0,4).map(name=>`

<div class="attendee-avatar"

title="${name}">

${name.charAt(0)}

</div>

`).join("");

}

};