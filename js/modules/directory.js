const DirectoryModule = {

    currentTab: "members",

    members: [],

    services: [],

    favourites: [],


    /* =====================================================
       MAIN RENDER
    ===================================================== */

    async render(container) {

        const isAdmin =
            window.currentUser &&
            (
                window.currentUser.role === "Admin" ||
                window.currentUser.role === "Moderator"
            );


        container.innerHTML = `

            <div class="directory-layout">

                <!-- DIRECTORY TABS -->
                <div class="directory-tabs">

                    <button
                        id="membersTab"
                        class="directory-tab ${
                            this.currentTab === "members"
                                ? "active"
                                : ""
                        }"
                    >
                        👥 Members
                         
                    </button>


                    <button
                        id="servicesTab"
                        class="directory-tab ${
                            this.currentTab === "services"
                                ? "active"
                                : ""
                        }"
                    >
                        🏢 Community Services
                    </button>

                </div>


                <!-- DIRECTORY CONTENT -->
                <div id="directoryContent"></div>


                <!-- SERVICE DETAILS MODAL -->
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


                <!-- MEMBER PROFILE MODAL -->
                <div
                    id="memberModal"
                    class="modal hidden"
                >

                    <div class="modal-box">

                        <div id="memberModalContent"></div>

                        <button
                            id="closeMemberModal"
                            class="primary-btn"
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

        `;


        this.attachEvents();

        await this.renderContent();

    },


    /* =====================================================
       RENDER CONTENT
    ===================================================== */

    async renderContent() {

        const container =
            document.getElementById("directoryContent");

        if (!container) return;


        if (this.currentTab === "members") {

            await this.renderMembers(container);

        } else {

            await this.renderServices(container);

        }


        /*
        Keep active tab correct
        */

        document
            .querySelectorAll(".directory-tab")
            .forEach(tab => {

                tab.classList.remove("active");

            });


        if (this.currentTab === "members") {

            document
                .getElementById("membersTab")
                ?.classList.add("active");

        } else {

            document
                .getElementById("servicesTab")
                ?.classList.add("active");

        }

    },


    /* =====================================================
       LOAD MEMBERS
    ===================================================== */

    async loadMembers() {

        try {

            const response = await fetch(
                "php/api/directory_members.php",
                {
                    credentials: "include"
                }
            );


            const result = await response.json();


            if (result.success) {

                this.members = result.data;

            } else {

                this.members = [];

            }

        } catch (error) {

            console.error(
                "Failed to load members:",
                error
            );

            this.members = [];

        }

    },


    /* =====================================================
       LOAD SERVICES
    ===================================================== */

    async loadServices() {

        try {

            const response = await fetch(
                "php/api/services.php",
                {
                    credentials: "include"
                }
            );


            const result = await response.json();


            if (result.success) {

                this.services = result.data;

            } else {

                this.services = [];

            }

        } catch (error) {

            console.error(
                "Failed to load services:",
                error
            );

            this.services = [];

        }

    },

    async loadFavourites() {

    try {

        const response = await fetch(
            "php/api/get_favourites.php",
            {
                credentials: "include"
            }
        );


        const result =
            await response.json();


        if (result.success) {

            this.favourites = result.data;

        } else {

            this.favourites = [];

        }

    } catch (error) {

        console.error(
            "Failed to load favourites:",
            error
        );

        this.favourites = [];

    }

},


    /* =====================================================
       MEMBER TEMPLATE
    ===================================================== */

    memberTemplate(member) {

        return `

            <div class="member-card">

                <img
                    class="member-avatar"
                    src="${
                        member.profile_picture &&
                        member.profile_picture !== ""
                            ? member.profile_picture
                            : "assets/images/default-avatar.jpg"
                    }"
                    onerror="
                        this.onerror=null;
                        this.src='assets/images/default-avatar.jpg';
                    "
                >


                <div class="member-info">

                    <h3>
                        ${member.full_name || "Unknown Member"}
                    </h3>


                    <span class="member-role">
                        ${member.role || "Member"}
                    </span>


                    <p class="member-bio">
                        ${
                            member.bio ||
                            "Family Hub Member"
                        }
                    </p>


                    <p class="member-email">
                        📧 ${member.email || "Email unavailable"}
                    </p>


                    <button
                        class="primary-btn view-profile-btn"
                        data-id="${member.id}"
                    >
                        View Profile
                    </button>

                </div>

            </div>

        `;

    },


    /* =====================================================
       RENDER MEMBERS
    ===================================================== */

    async renderMembers(container) {

    await this.loadMembers();

    container.innerHTML = `

        <div class="card">

            <input
                id="memberSearch"
                placeholder="Search members..."
            >

        </div>


        <div
            id="membersContainer"
            class="services-grid"
        >

            ${this.members.map(member => `

                <div class="member-card">

                    <img
                        class="member-avatar"
                        src="${
                            member.profile_picture &&
                            member.profile_picture !== ""
                                ? member.profile_picture
                                : "assets/images/default-avatar.jpg"
                        }"
                        onerror="
                            this.onerror=null;
                            this.src='assets/images/default-avatar.jpg';
                        "
                    >


                    <div class="member-info">

                        <h3>
                            ${member.full_name}
                        </h3>


                        <span class="member-role">
                            ${member.role || "Member"}
                        </span>


                        <p class="member-bio">
                            ${member.bio || "Family Hub Member"}
                        </p>


                        <p class="member-email">
                            📧 ${member.email || "Email not provided"}
                        </p>


                        <button
                            class="primary-btn view-profile-btn"
                            data-id="${member.id}"
                        >
                            View Profile
                        </button>

                    </div>

                </div>

            `).join("")}

        </div>

    `;


    /*
    |--------------------------------------------------------------------------
    | MEMBER SEARCH
    |--------------------------------------------------------------------------
    */

    document
        .getElementById("memberSearch")
        ?.addEventListener("input", (e) => {

            const search =
                e.target.value.toLowerCase();


            document
                .querySelectorAll(".member-card")
                .forEach(card => {

                    const text =
                        card.innerText.toLowerCase();


                    card.style.display =
                        text.includes(search)
                            ? ""
                            : "none";

                });

        });


    /*
    |--------------------------------------------------------------------------
    | VIEW MEMBER PROFILE
    |--------------------------------------------------------------------------
    */

    document
        .querySelectorAll(".view-profile-btn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const member =
                    this.members.find(
                        m =>
                            Number(m.id) ===
                            Number(btn.dataset.id)
                    );


                if (!member) return;


                document
                    .getElementById("serviceModalContent")
                    .innerHTML = `

                        <div class="profile-modal">

                            <div class="profile-modal-header">

                                <img
                                    class="member-avatar profile-modal-avatar"
                                    src="${
                                        member.profile_picture &&
                                        member.profile_picture !== ""
                                            ? member.profile_picture
                                            : "assets/images/default-avatar.jpg"
                                    }"
                                    onerror="
                                        this.onerror=null;
                                        this.src='assets/images/default-avatar.jpg';
                                    "
                                >


                                <div>

                                    <h2>
                                        ${member.full_name}
                                    </h2>

                                    <span class="member-role">
                                        ${member.role || "Member"}
                                    </span>

                                </div>

                            </div>


                            <div class="profile-modal-details">

                                <p>
                                    <strong>📧 Email</strong><br>
                                    ${
                                        member.email
                                            ? `
                                                <a href="mailto:${member.email}">
                                                    ${member.email}
                                                </a>
                                              `
                                            : "Not provided"
                                    }
                                </p>


                                <p>
                                    <strong>🎓 Course</strong><br>
                                    ${member.course || "Not provided"}
                                </p>


                                <p>
                                    <strong>📚 Year of Study</strong><br>
                                    ${member.year_of_study || "Not provided"}
                                </p>


                                <p>
                                    <strong>🛠 Skills</strong><br>
                                    ${member.skills || "Not provided"}
                                </p>


                                <p>
                                    <strong>👤 About</strong><br>
                                    ${
                                        member.bio ||
                                        "This member has not added a bio yet."
                                    }
                                </p>

                            </div>

                        </div>

                    `;


                document
                    .getElementById("serviceModal")
                    .classList.remove("hidden");

            });

        });

},


    /* =====================================================
       SERVICE TEMPLATE
    ===================================================== */

    serviceTemplate(service) {

        const isAdmin =
            window.currentUser &&
            (
                window.currentUser.role === "Admin" ||
                window.currentUser.role === "Moderator"
            );


        return `

            <div class="card service-card">

                <h3>
                    ${service.name}
                </h3>


                <p class="desc">
                    ${service.category || "Community Service"}
                </p>


                <p class="desc">
                    Added by ${
                        service.full_name ||
                        "Family Hub"
                    }
                </p>


                <p>
                    ⭐ ${service.rating || "0.0"}
                </p>


                ${
                    service.phone
                        ? `
                            <p>
                                📞
                                <a href="tel:${service.phone}">
                                    ${service.phone}
                                </a>
                            </p>
                        `
                        : ""
                }


                ${
                    service.location
                        ? `
                            <p>
                                📍

                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ${service.location}
                                </a>

                            </p>
                        `
                        : ""
                }


                <p>
                    ${
                        service.description ||
                        "No description provided."
                    }
                </p>


                <div class="service-actions">

                    <button
                        class="primary-btn view-service-btn"
                        data-id="${service.id}"
                    >
                        View Details
                    </button>


                    <button
                      class="action-btn favourite-btn ${
                          this.favourites.some(
                              favourite =>
                                  Number(favourite.id) === Number(service.id)
                          )
                              ? "saved-favourite"
                              : ""
                      }"
                      data-id="${service.id}"
                    >
                      ${
                          this.favourites.some(
                              favourite =>
                                  Number(favourite.id) === Number(service.id)
                          )
                              ? "❤️ Saved"
                              : "❤️ Favourite"
                      }
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

            </div>

        `;

    },


    /* =====================================================
       RENDER SERVICES
    ===================================================== */

    async renderServices(container){

    await this.loadServices();

    await this.loadFavourites();


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
                                Add Community Service
                            </h2>


                            <input
                                id="serviceName"
                                placeholder="Service name"
                            >


                            <input
                                id="serviceCategory"
                                placeholder="Category"
                            >


                            <input
                                id="servicePhone"
                                placeholder="Phone"
                            >


                            <input
                                id="serviceEmail"
                                placeholder="Email"
                            >


                            <input
                                id="serviceWebsite"
                                placeholder="Website"
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
                                id="saveServiceBtn"
                                class="primary-btn"
                            >
                                Create Service
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

            </div>


            <div
                id="servicesContainer"
                class="services-grid"
            >

                ${
                    this.services.length
                        ? this.services
                            .map(service =>
                                this.serviceTemplate(service)
                            )
                            .join("")
                        : `
                            <div class="card">
                                <p>
                                    No community services available.
                                </p>
                            </div>
                        `
                }

            </div>

        `;


        /*
        CREATE SERVICE
        */

        document
            .getElementById("saveServiceBtn")
            ?.addEventListener(
                "click",
                async () => {

                    const form =
                        new FormData();


                    form.append(
                        "name",
                        document
                            .getElementById(
                                "serviceName"
                            )
                            .value
                    );


                    form.append(
                        "category",
                        document
                            .getElementById(
                                "serviceCategory"
                            )
                            .value
                    );


                    form.append(
                        "phone",
                        document
                            .getElementById(
                                "servicePhone"
                            )
                            .value
                    );


                    form.append(
                        "email",
                        document
                            .getElementById(
                                "serviceEmail"
                            )
                            .value
                    );


                    form.append(
                        "website",
                        document
                            .getElementById(
                                "serviceWebsite"
                            )
                            .value
                    );


                    form.append(
                        "location",
                        document
                            .getElementById(
                                "serviceLocation"
                            )
                            .value
                    );


                    form.append(
                        "description",
                        document
                            .getElementById(
                                "serviceDescription"
                            )
                            .value
                    );


                    try {

                        const response =
                            await fetch(
                                "php/api/create_service.php",
                                {
                                    method: "POST",
                                    body: form,
                                    credentials: "include"
                                }
                            );


                        const result =
                            await response.json();


                        if (result.success) {

                            await this.renderServices(
                                container
                            );

                        } else {

                            alert(
                                result.message ||
                                "Unable to create service."
                            );

                        }

                    } catch (error) {

                        console.error(
                            "Create service error:",
                            error
                        );

                        alert(
                            "Something went wrong while creating the service."
                        );

                    }

                }
            );


        /*
        SEARCH SERVICES
        */

        document
            .getElementById("directorySearch")
            ?.addEventListener(
                "input",
                e => {

                    const search =
                        e.target.value
                            .toLowerCase()
                            .trim();


                    const filtered =
                        this.services.filter(
                            service =>

                                (
                                    service.name ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                (
                                    service.category ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(search)

                                ||

                                (
                                    service.location ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(search)

                        );


                    document
                        .getElementById(
                            "servicesContainer"
                        )
                        .innerHTML =

                        filtered
                            .map(service =>
                                this.serviceTemplate(service)
                            )
                            .join("");


                    this.attachServiceButtons();

                }
            );


        this.attachServiceButtons();

    },


    /* =====================================================
       DIRECTORY TABS
    ===================================================== */

    attachEvents() {


        /*
        MEMBERS TAB
        */

        document
            .getElementById("membersTab")
            ?.addEventListener(
                "click",
                async () => {

                    this.currentTab =
                        "members";

                    await this.renderContent();

                }
            );


        /*
        SERVICES TAB
        */

        document
            .getElementById("servicesTab")
            ?.addEventListener(
                "click",
                async () => {

                    this.currentTab =
                        "services";

                    await this.renderContent();

                }
            );


        /*
        SERVICE MODAL CLOSE
        */

        document
            .getElementById("closeServiceModal")
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


        /*
        MEMBER MODAL CLOSE
        */

        document
            .getElementById("closeMemberModal")
            ?.addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            "memberModal"
                        )
                        .classList.add(
                            "hidden"
                        );

                }
            );


        /*
        CLOSE SERVICE MODAL
        WHEN CLICKING BACKDROP
        */

        document
            .getElementById("serviceModal")
            ?.addEventListener(
                "click",
                e => {

                    if (
                        e.target.id ===
                        "serviceModal"
                    ) {

                        e.currentTarget
                            .classList
                            .add("hidden");

                    }

                }
            );


        /*
        CLOSE MEMBER MODAL
        WHEN CLICKING BACKDROP
        */

        document
            .getElementById("memberModal")
            ?.addEventListener(
                "click",
                e => {

                    if (
                        e.target.id ===
                        "memberModal"
                    ) {

                        e.currentTarget
                            .classList
                            .add("hidden");

                    }

                }
            );

    },


    /* =====================================================
       SERVICE BUTTONS
    ===================================================== */

    attachServiceButtons() {


        /*
        VIEW DETAILS
        */

        document
            .querySelectorAll(".view-service-btn")
            .forEach(btn => {

                btn.onclick = () => {

                    const service =
                        this.services.find(
                            s =>
                                Number(s.id) ===
                                Number(btn.dataset.id)
                        );


                    if (!service) return;


                    document
                        .getElementById(
                            "serviceModalContent"
                        )
                        .innerHTML = `

                            <h2>
                                ${service.name}
                            </h2>


                            <p>
                                <strong>Category:</strong><br>
                                ${
                                    service.category ||
                                    "Not provided"
                                }
                            </p>


                            <p>
                                <strong>Phone:</strong><br>

                                ${
                                    service.phone
                                        ? `
                                            <a href="tel:${service.phone}">
                                                ${service.phone}
                                            </a>
                                        `
                                        : "Not provided"
                                }

                            </p>


                            <p>
                                <strong>Email:</strong><br>

                                ${
                                    service.email
                                        ? `
                                            <a href="mailto:${service.email}">
                                                ${service.email}
                                            </a>
                                        `
                                        : "Not provided"
                                }

                            </p>


                            <p>
                                <strong>Website:</strong><br>

                                ${
                                    service.website
                                        ? `
                                            <a
                                                href="${service.website}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Visit Website
                                            </a>
                                        `
                                        : "Not provided"
                                }

                            </p>


                            <p>
                                <strong>Location:</strong><br>
                                ${
                                    service.location ||
                                    "Not provided"
                                }
                            </p>


                            <p>
                                <strong>Rating:</strong><br>
                                ⭐ ${
                                    service.rating ||
                                    "0.0"
                                }
                            </p>


                            <p>
                                <strong>Description:</strong><br>
                                ${
                                    service.description ||
                                    "No description provided."
                                }
                            </p>

                        `;


                    document
                        .getElementById(
                            "serviceModal"
                        )
                        .classList.remove(
                            "hidden"
                        );

                };

            });


        /*
        FAVOURITE
        */

        // Favourite
document
    .querySelectorAll(".favourite-btn")
    .forEach(btn => {

        btn.onclick = async () => {

            const serviceId =
                Number(btn.dataset.id);


            const form = new FormData();

            form.append(
                "service_id",
                serviceId
            );


            try {

                const response = await fetch(
                    "php/api/toggle_favourite.php",
                    {
                        method: "POST",
                        body: form,
                        credentials: "include"
                    }
                );


                const result =
                    await response.json();


                if (!result.success) {

                    alert(
                        result.message ||
                        "Unable to update favourite."
                    );

                    return;

                }


                if (result.favourited) {

                    btn.innerHTML = "❤️ Saved";

                    btn.classList.add(
                        "saved-favourite"
                    );

                } else {

                    btn.innerHTML = "❤️ Favourite";

                    btn.classList.remove(
                        "saved-favourite"
                    );

                }

            } catch (error) {

                console.error(
                    "Favourite error:",
                    error
                );

                alert(
                    "Something went wrong while updating your favourite."
                );

            }

        };

    });


        /*
        DELETE
        */

        this.attachDeleteButtons();

    },


    /* =====================================================
       DELETE SERVICES
    ===================================================== */

    attachDeleteButtons() {

        document
            .querySelectorAll(
                ".delete-service-btn"
            )
            .forEach(btn => {

                btn.onclick =
                    async () => {

                        if (
                            !confirm(
                                "Delete this service?"
                            )
                        ) {

                            return;

                        }


                        const form =
                            new FormData();


                        form.append(
                            "id",
                            btn.dataset.id
                        );


                        try {

                            const response =
                                await fetch(
                                    "php/api/delete_service.php",
                                    {
                                        method: "POST",
                                        body: form,
                                        credentials: "include"
                                    }
                                );


                            const result =
                                await response.json();


                            if (
                                result.success
                            ) {

                                await this.renderContent();

                            } else {

                                alert(
                                    result.message ||
                                    "Unable to delete service."
                                );

                            }

                        } catch (error) {

                            console.error(
                                "Delete service error:",
                                error
                            );

                            alert(
                                "Something went wrong while deleting the service."
                            );

                        }

                    };

            });

    }

};

