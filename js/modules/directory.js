const DirectoryModule = {

  services: [

    {
      id: 1,
      name: "Community Health Centre",
      category: "Health",
      phone: "+256 700 000001",
      location: "Kampala",
      description:
        "Health consultations, counselling and family wellness support.",
        rating: 4.8
    },

    {
      id: 2,
      name: "Family Legal Aid",
      category: "Legal Aid",
      phone: "+256 700 000002",
      location: "Kampala",
      description:
        "Legal support and guidance for families.",
        rating: 4.5
    },

    {
      id: 3,
      name: "Hope Education Services",
      category: "Education",
      phone: "+256 700 000003",
      location: "Mukono",
      description:
        "Educational support, mentorship and school guidance.",
        rating: 4.7
    }

  ],

  favourites: [],

  render(container) {

    const isAdmin =
      window.currentUser &&
      (
        window.currentUser.role === "Admin" ||
        window.currentUser.role === "Moderator"
      );

    container.innerHTML = `

      <div class="directory-layout">

        ${
          isAdmin
          ? `

          <div class="card">

            <h2>
              Add Service
            </h2>

            <input
              id="serviceName"
              placeholder="Service Name"
            >

            <input
              id="serviceCategory"
              placeholder="Category"
            >

            <input
              id="servicePhone"
              placeholder="Phone Number"
            >

            <input
              id="serviceLocation"
              placeholder="Location"
            >

            <textarea
              id="serviceDescription"
              placeholder="Description"
            ></textarea>

            <button
              id="addServiceBtn"
              class="primary-btn"
            >

              Add Service

            </button>

          </div>

          `
          : ""
        }

        <div class="card">

  <input
    id="directorySearch"
    placeholder="Search services..."
  >

  <div class="directory-filters">

    <button
      class="filter-btn active-filter"
      data-category="All"
    >
      All
    </button>

    <button
      class="filter-btn"
      data-category="Health"
    >
      Health
    </button>

    <button
      class="filter-btn"
      data-category="Education"
    >
      Education
    </button>

    <button
      class="filter-btn"
      data-category="Legal Aid"
    >
      Legal Aid
    </button>

  </div>

</div>

        <div
          id="servicesContainer"
          class="services-grid"
        >

          ${this.services.map(service =>

            this.serviceTemplate(service)

          ).join("")}

        </div>

        <div class="card">

  <h2>
    🏆 Top Rated Services
  </h2>

  ${[...this.services]

    .sort(
      (a,b)=>
      b.rating-a.rating
    )

    .slice(0,3)

    .map(service => `

      <div class="service-card">

        <strong>
          ${service.name}
        </strong>

        <p>
          ⭐ ${service.rating}
        </p>

      </div>

    `)

    .join("")}

</div>

        <div class="card">

  <h2>
    🚨 Emergency Contacts
  </h2>

  <div class="service-card">

    <h3>Police</h3>

    <p>999</p>

  </div>

  <div class="service-card">

    <h3>Ambulance</h3>

    <p>911</p>

  </div>

  <div class="service-card">

    <h3>Family Support Hotline</h3>

    <p>0800-123-456</p>

  </div>

</div>

      </div>

    <div
  id="serviceModal"
  class="modal hidden"
>

  <div class="modal-box">

    <div id="serviceModalContent"></div>

    <button
      id="closeServiceModal"
      class="primary-btn"
    >
      Close
    </button>

  </div>

</div>
    
      `;

    this.attachEvents();
  },

  serviceTemplate(service) {

    const isAdmin =
      window.currentUser &&
      (
        window.currentUser.role === "Admin" ||
        window.currentUser.role === "Moderator"
      );

    return `

      <div
        class="card service-card"
      >

        <h3>
          ${service.name}
        </h3>

        <p class="desc">
          ${service.category}
        </p>

        <p>
          ⭐ ${service.rating}
        </p>

        <p>

  📞

  <a href="tel:${service.phone}">
    ${service.phone}
  </a>

</p>

        <p>

  📍

  <a
    href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}"
    target="_blank"
  >
    ${service.location}
  </a>

</p>

        <p>
          ${service.description}
        </p>

        <button
  class="primary-btn view-service-btn"
  data-id="${service.id}"
>
  View Details
</button>

<button
  class="action-btn favourite-btn"
  data-id="${service.id}"
>
  ❤️ Favourite
</button>


        ${
          isAdmin
          ? `

          <button
            class="delete-service-btn"
            data-id="${service.id}"
          >

            🗑 Delete

          </button>

          `
          : ""
        }

      </div>

    `;
  },

  attachEvents() {

    document
      .getElementById("directorySearch")
      ?.addEventListener("input", e => {

        const search =
          e.target.value.toLowerCase();

        const filtered =
          this.services.filter(service =>

            service.name
            .toLowerCase()
            .includes(search)

            ||

            service.category
            .toLowerCase()
            .includes(search)

            ||

            service.location
            .toLowerCase()
            .includes(search)

          );

        document.getElementById(
          "servicesContainer"
        ).innerHTML =

          filtered.map(service =>

            this.serviceTemplate(service)

          ).join("");

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
              Number(btn.dataset.id)
          );

        if(!service) return;

        document.getElementById(
          "serviceModalContent"
        ).innerHTML = `

          <h2>
            ${service.name}
          </h2>

          <p>
            <strong>Category:</strong>
            ${service.category}
          </p>

          <p>
            <strong>Rating:</strong>
            ⭐ ${service.rating}
          </p>

          <p>
            <strong>Phone:</strong>
            ${service.phone}
          </p>

          <p>
            <strong>Location:</strong>
            ${service.location}
          </p>

          <p>
            ${service.description}
          </p>

        `;

        document
          .getElementById(
            "serviceModal"
          )
          .classList.remove(
            "hidden"
          );

      }
    );

  });

document
  .getElementById(
    "closeServiceModal"
  )
  ?.addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "serviceModal"
        )
        .classList.add(
          "hidden"
        );

    }
  );

        this.attachDeleteButtons();

      });

    document
      .getElementById("addServiceBtn")
      ?.addEventListener("click", () => {

        const name =
          document.getElementById(
            "serviceName"
          ).value.trim();

        const category =
          document.getElementById(
            "serviceCategory"
          ).value.trim();

        const phone =
          document.getElementById(
            "servicePhone"
          ).value.trim();

        const location =
          document.getElementById(
            "serviceLocation"
          ).value.trim();

        const description =
          document.getElementById(
            "serviceDescription"
          ).value.trim();

        if(
          !name ||
          !category ||
          !phone ||
          !location
        ){
          return;
        }

        this.services.unshift({

          id: Date.now(),

          name,

          category,

          phone,

          location,

          description

        });

        NotificationModule.add(
          `📍 New Service Added: ${name}`
        );

        this.render(
          document.getElementById(
            "contentArea"
          )
        );

      });

    this.attachDeleteButtons();

  },

  attachDeleteButtons() {

    document
      .querySelectorAll(
        ".delete-service-btn"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            const id =
              Number(
                btn.dataset.id
              );

            this.services =
              this.services.filter(

                service =>
                  service.id !== id

              );

            this.render(
              document.getElementById(
                "contentArea"
              )
            );

          }
        );

      });

      document
  .querySelectorAll(".favourite-btn")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        const id =
          Number(btn.dataset.id);

        const service =
          this.services.find(
            s => s.id === id
          );

        if(!service) return;

        const exists =
          this.favourites.find(
            s => s.id === id
          );

        if(exists){

          alert(
            "Already in favourites ❤️"
          );

          return;
        }

        this.favourites.push(service);

        alert(
          `${service.name} added to favourites ❤️`
        );

      }
    );

  });

  }


};