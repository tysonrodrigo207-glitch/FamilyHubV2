const MessagesModule = {

  activeChatId: 1,

  chats: [

    {
      id: 1,
      type: "direct",
      name: "Sarah",
      unread: 0,

      participants: [
        "Tyson",
        "Sarah"
      ],

      messages: [

        {
          sender: "Sarah",
          text: "Hey Tyson 👋🏾",
          time: "09:20"
        },

        {
          sender: "Tyson",
          text: "Hello Sarah 😎",
          time: "09:21"
        }

      ]
    },

    {
      id: 2,
      type: "group",

      name: "Community Support",

      unread: 0,

      participants: [
        "Tyson",
        "Sarah",
        "John"
      ],

      messages: [

        {
          sender: "Sarah",
          text: "Welcome everyone 🎉",
          time: "08:15"
        }

      ]
    },

{
  id: 999,

  type: "announcement",

  name: "📢 Announcements",

  unread: 2,

  participants: [],

  messages: [

    {
      sender: "System",
      text: "Welcome to Family Hub.",
      time: "08:00"
    }

  ]
},

  ],

  render(container) {

  const activeChat =
    this.chats.find(
      c => c.id === this.activeChatId
    );

  container.innerHTML = `

    <div class="messages-layout">

      <div class="messages-sidebar">

        <div class="messages-header">

          <h2>Messages</h2>

          <button
            id="newChatBtn"
            class="primary-btn"
          >
            +
          </button>

        </div>

        <div class="chat-list">

          ${this.chats.map(chat => `

            <div
              class="chat-item
              ${chat.id === this.activeChatId ? "active-chat" : ""}"
              data-id="${chat.id}"
            >

              <div>

                <div class="chat-title-row">

                  <strong>
                    ${chat.name}
                  </strong>

                  ${
                    chat.unread > 0
                    ? `
                      <span class="unread-badge">
                        ${chat.unread}
                      </span>
                    `
                    : ""
                  }

                </div>

                <p>

                  ${
                    chat.type === "group"
                    ? "Group Chat"

                    : chat.type === "announcement"
                    ? "Announcement Channel"

                    : "Direct Chat"
                  }

                </p>

              </div>

            </div>

          `).join("")}

        </div>

      </div>

      <div class="chat-panel">

        <div class="chat-topbar">

          <div>

            <h3>
              ${activeChat.name}
            </h3>

            <span>
              ${activeChat.type}
            </span>

          </div>

          ${
            activeChat.type === "group"
            && ["Admin","Moderator"]
            .includes(window.currentUser.role)

            ? `

              <div class="group-controls">

                <button
                  id="renameGroupBtn"
                  class="secondary-btn"
                >

                  Rename

                </button>

                <button
                  id="deleteGroupBtn"
                  class="secondary-btn danger-btn"
                >

                  Delete

                </button>

              </div>

            `

            : ""
          }

        </div>

        ${
          activeChat.type === "group"

          ? `

            <div class="participants-panel">

              <strong>
                Participants
              </strong>

              <ul>

                ${activeChat.participants
                  .map(person => `

                    <li>

                      ${person}

                    </li>

                  `)
                  .join("")}

              </ul>

              ${
                ["Admin","Moderator"]
                .includes(window.currentUser.role)

                ? `

                  <button
                    id="addParticipantBtn"
                    class="primary-btn"
                  >

                    Add Participant

                  </button>

                `

                : ""
              }

            </div>

          `

          : ""
        }

        <div
          class="chat-messages"
          id="chatMessages"
        >

          ${activeChat.messages.map(message => `

            <div
              class="message-bubble
              ${message.sender === window.currentUser.name
              ? "my-message"
              : ""}"
            >

              <strong>
                ${message.sender}
              </strong>

              <p>
                ${message.text}
              </p>

              <small>
                ${message.time}
              </small>

            </div>

          `).join("")}

        </div>

        <div class="chat-input-area">

          <input
            id="messageInput"
            placeholder="Type a message..."
          >

          <button
            id="sendMessageBtn"
            class="primary-btn"
          >

            Send

          </button>

        </div>

      </div>

    </div>

  `;

  this.attachEvents();
},

  attachEvents() {

  document
    .querySelectorAll(".chat-item")
    .forEach(item => {

      item.addEventListener("click", () => {

        this.activeChatId =
          Number(item.dataset.id);

        const chat =
          this.chats.find(
            c => c.id === this.activeChatId
          );

        if(chat){
          chat.unread = 0;
        }

        this.render(
          document.getElementById(
            "contentArea"
          )
        );

      });

    });

  document
    .getElementById("sendMessageBtn")
    ?.addEventListener("click", () => {

      const input =
        document.getElementById(
          "messageInput"
        );

      const text =
        input.value.trim();

      if(!text) return;

      const chat =
        this.chats.find(
          c => c.id === this.activeChatId
        );

      if(!chat) return;

      if(
        chat.type === "announcement"
        &&
        !["Admin","Moderator"]
        .includes(
          window.currentUser.role
        )
      ){

        alert(
          "Only Admins and Moderators can post announcements."
        );

        return;
      }

      chat.messages.push({

        sender:
          window.currentUser.name,

        text,

        time:
          new Date()
          .toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
          })

      });

      this.render(
        document.getElementById(
          "contentArea"
        )
      );

    });

  document
    .getElementById("newChatBtn")
    ?.addEventListener("click", () => {

      const type =
        prompt(
          "Create 'direct' or 'group'?"
        );

      if(
        type !== "direct"
        &&
        type !== "group"
      ){

        return;
      }

      const chatName =
        prompt(
          "Enter chat name:"
        );

      if(!chatName) return;

      this.chats.push({

        id: Date.now(),

        type,

        unread: 0,

        name: chatName,

        participants: [
          window.currentUser.name
        ],

        messages: []

      });

      this.render(
        document.getElementById(
          "contentArea"
        )
      );

    });

  document
    .getElementById("renameGroupBtn")
    ?.addEventListener("click", () => {

      const chat =
        this.chats.find(
          c => c.id === this.activeChatId
        );

      const newName =
        prompt(
          "New group name:",
          chat.name
        );

      if(!newName) return;

      chat.name = newName;

      this.render(
        document.getElementById(
          "contentArea"
        )
      );

    });

  document
    .getElementById("deleteGroupBtn")
    ?.addEventListener("click", () => {

      this.chats =
        this.chats.filter(
          c => c.id !== this.activeChatId
        );

      this.activeChatId =
        this.chats[0].id;

      this.render(
        document.getElementById(
          "contentArea"
        )
      );

    });

  document
    .getElementById("addParticipantBtn")
    ?.addEventListener("click", () => {

      const chat =
        this.chats.find(
          c => c.id === this.activeChatId
        );

      const name =
        prompt(
          "Participant name:"
        );

      if(!name) return;

      chat.participants.push(name);

      this.render(
        document.getElementById(
          "contentArea"
        )
      );

    });

}

};