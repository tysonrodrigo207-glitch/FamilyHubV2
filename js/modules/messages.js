const MessagesModule = {
 users: [],
 messages: [],
 conversations: [],
 selectedConversation: null,
 reactionMenu: null,
 refreshTimer: null,

 online(lastSeen) {
   if (!lastSeen) return false;
   return Date.now() - new Date(lastSeen).getTime() < 120000;
 },

 isMobile() {
   return window.innerWidth <= 760;
 },

 updateMobileLayout() {
   const page = document.querySelector(".messages-page");
   if (!page) return;

   const mobile = this.isMobile();
   page.classList.toggle("chat-open", mobile && !!this.selectedConversation);

   const backButton = document.getElementById("mobileChatBack");
   if (backButton) {
     backButton.classList.toggle("hidden", !(mobile && !!this.selectedConversation));
   }
 },

 async render(container) {
   if (!container) return;

   if (this.refreshTimer) {
     clearInterval(this.refreshTimer);
   }

   container.innerHTML = `
     <div class="messages-page">
       <div class="messages-sidebar">
         <div class="messages-header-row">
           <div class="messages-title">💬 Messages</div>
           <button id="newGroupBtn" class="secondary-btn" type="button">+ Group</button>
         </div>
         <div class="messages-search">
           <input id="messageSearch" placeholder="Search..." />
         </div>
         <div class="messages-section">
           <div class="section-title">DIRECT MESSAGES</div>
           <div id="conversationList" class="conversation-list"></div>
           <div class="section-title">MEMBERS</div>
           <div id="usersList"></div>
         </div>
       </div>

       <div class="messages-chat">
         <div class="chat-header">
           <div class="chat-header-main">
             <button id="mobileChatBack" class="mobile-chat-back hidden" type="button">← Chats</button>
             <div>
               <h3 id="chatTitle">🌍 Community</h3>
               <small id="typingStatus">Family Hub Messaging</small>
             </div>
           </div>
           <div class="chat-actions">🔍 📌 ☎️</div>
         </div>

         <div id="conversation" class="conversation"></div>

         <div class="chat-send">
           <div class="chat-send-tools">
             <div class="emoji-wrapper">
               <button id="emojiBtn" class="chat-tool-btn">😊</button>
               <div id="emojiPicker" class="emoji-picker hidden">
                 😀 😂 🤣 😍 🥰 😎 🤔 😢 😭 😡 👍 👎 👏 🙌 ❤️ 💔 🎉 🎂 🔥 💯 🚀 🌍
               </div>
             </div>

             <label class="chat-tool-btn">
               📎
               <input id="chatFile" type="file" hidden />
             </label>

             <button class="chat-tool-btn" type="button">🖼️</button>
             <button class="chat-tool-btn" type="button">🎥</button>
           </div>

           <input id="messageInput" placeholder="Type a message..." />
           <button id="sendMessage" class="primary-btn" type="button">Send</button>
         </div>
       </div>
     </div>
   `;

   let reactionMenu = document.getElementById("reactionMenu");
   if (!reactionMenu) {
     reactionMenu = document.createElement("div");
     reactionMenu.id = "reactionMenu";
     reactionMenu.className = "reaction-menu hidden";
     reactionMenu.innerHTML = "<span>👍</span><span>❤️</span><span>😂</span><span>😮</span><span>😢</span><span>🔥</span>";
     document.body.appendChild(reactionMenu);
   }
   this.reactionMenu = reactionMenu;

   reactionMenu.querySelectorAll("span").forEach(item => {
     item.onclick = () => {
       if (this.reactionMenu) {
         this.reactToMessage(this.reactionMenu.dataset.message, item.textContent);
         this.reactionMenu.classList.add("hidden");
       }
     };
   });

   document.removeEventListener("click", this._messagesOutsideClickHandler);
   this._messagesOutsideClickHandler = (event) => {
     if (!event.target.closest(".react-btn") && !event.target.closest("#reactionMenu")) {
       if (this.reactionMenu) this.reactionMenu.classList.add("hidden");
     }
     if (!event.target.closest(".emoji-wrapper")) {
       const picker = document.getElementById("emojiPicker");
       if (picker) picker.classList.add("hidden");
     }
   };
   document.addEventListener("click", this._messagesOutsideClickHandler);

   const filePicker = document.getElementById("chatFile");
   if (filePicker) {
     filePicker.onchange = () => {
       if (!filePicker.files.length) return;
       const input = document.getElementById("messageInput");
       if (input) input.value = "📎 " + filePicker.files[0].name;
     };
   }

   const emojiPicker = document.getElementById("emojiPicker");
   if (emojiPicker) {
     const emojiItems = emojiPicker.textContent.trim().split(/\s+/).filter(Boolean);
     emojiPicker.innerHTML = emojiItems.map((emoji) => `<span>${emoji}</span>`).join("");
     emojiPicker.querySelectorAll("span").forEach((emoji) => {
       emoji.onclick = () => {
         const input = document.getElementById("messageInput");
         if (input) {
           input.value += emoji.textContent;
           input.focus();
         }
       };
     });
   }

   const emojiButton = document.getElementById("emojiBtn");
   if (emojiButton && emojiPicker) {
     emojiButton.onclick = () => emojiPicker.classList.toggle("hidden");
   }

   const mobileBack = document.getElementById("mobileChatBack");
   if (mobileBack) {
     mobileBack.onclick = () => {
       this.selectedConversation = null;
       this.renderConversationList();
       const chatTitle = document.getElementById("chatTitle");
       if (chatTitle) chatTitle.textContent = "🌍 Community";
       const conversation = document.getElementById("conversation");
       if (conversation) {
         conversation.innerHTML = `
           <div class="empty-chat">
             <h3>Select a conversation</h3>
             <p>Choose a chat from the list to start messaging.</p>
           </div>
         `;
       }
       this.updateMobileLayout();
     };
   }

   const newGroupBtn = document.getElementById("newGroupBtn");
   if (newGroupBtn) {
     newGroupBtn.onclick = async () => {
       const currentUser = window.currentUser || {};
       if (!currentUser.role || String(currentUser.role).toLowerCase() !== "admin") {
         alert("Only the family admin can create group chats.");
         return;
       }

       const groupName = prompt("Group name", "Family Updates");
       if (!groupName || !groupName.trim()) return;

       const selectedMembers = Array.from(document.querySelectorAll("#usersList .member-user.selected"))
         .map((item) => item.dataset.id)
         .filter(Boolean);

       if (!selectedMembers.length) {
         alert("Select at least one member to add to the group.");
         return;
       }

       const form = new FormData();
       form.append("name", groupName.trim());
       form.append("members", JSON.stringify(selectedMembers));

       const response = await fetch("php/api/create_group.php", {
         method: "POST",
         body: form,
         credentials: "include",
       });

       const result = await response.json();
       if (!result.success) {
         alert(result.message || "Unable to create the group.");
         return;
       }

       this.selectedConversation = Number(result.conversation_id);
       await this.loadConversations();
       await this.loadMessages();
       this.updateMobileLayout();
     };
   }

   const messageSearch = document.getElementById("messageSearch");
   if (messageSearch) {
     messageSearch.oninput = (event) => this.searchMessages(event.target.value);
   }

   this.selectedConversation = null;
   await this.loadConversations();
   await this.loadUsers();

   if (this.selectedConversation) {
     await this.loadMessages();
   }

   this.updateMobileLayout();

   this.refreshTimer = setInterval(async () => {
     await this.loadConversations();
     await this.loadUsers();
     if (this.selectedConversation) {
       await this.loadMessages();
       await this.checkTyping();
     }
   }, 5000);

   window.addEventListener("resize", () => this.updateMobileLayout());
 },

 async loadUsers() {
   const response = await fetch("php/api/users.php", { credentials: "include" });
   const result = await response.json();

   if (!result.success) return;

   this.users = Array.isArray(result.data) ? result.data : [];

   const list = document.getElementById("usersList");
   if (!list) return;

   list.innerHTML = this.users
     .filter((user) => Number(user.id) !== Number(window.currentUser?.id))
     .map((user) => {
       const displayName = user.full_name || user.username || "Family Member";
       return `
         <div class="chat-user member-user" data-id="${user.id}">
           <div class="chat-user-avatar">
             ${(displayName || "F").charAt(0).toUpperCase()}
             <span class="${this.online(user.last_seen) ? "online-dot" : "offline-dot"}"></span>
           </div>
           <div class="chat-user-info">
             <strong>${displayName}</strong>
             <small>${user.role || "Member"}</small>
           </div>
         </div>
       `;
     }).join("");

   document.querySelectorAll("#usersList .member-user").forEach((item) => {
     item.onclick = async (event) => {
       const currentUser = window.currentUser || {};
       const isAdmin = String(currentUser.role || "").toLowerCase() === "admin";

       if (isAdmin && event.ctrlKey) {
         item.classList.toggle("selected");
         return;
       }

       const form = new FormData();
       form.append("user_id", item.dataset.id);

       const response = await fetch("php/api/create_direct.php", {
         method: "POST",
         body: form,
         credentials: "include",
       });

       const result = await response.json();
       if (result.success) {
         this.selectedConversation = Number(result.conversation_id);
         await this.loadConversations();
         await this.loadMessages();
         this.updateMobileLayout();
       }
     };
   });
 },

 async loadMessages() {
   if (!this.selectedConversation) return;

   await fetch("php/api/mark_delivered.php", {
     method: "POST",
     credentials: "include",
     body: new URLSearchParams({ conversation_id: this.selectedConversation }),
   });

   const response = await fetch("php/api/messages.php?conversation=" + this.selectedConversation, {
     credentials: "include",
   });

   const result = await response.json();
   if (!result.success) return;

   this.messages = Array.isArray(result.data) ? result.data : [];
   this.showConversation();

   await fetch("php/api/mark_read.php", {
     method: "POST",
     credentials: "include",
     body: new URLSearchParams({ conversation_id: this.selectedConversation }),
   });
 },

 showConversation() {
   const conversation = document.getElementById("conversation");
   if (!conversation) return;

   if (!this.messages.length) {
     conversation.innerHTML = `
       <div class="empty-chat">
         <h3>No messages yet</h3>
         <p>Start the conversation.</p>
       </div>
     `;
     return;
   }

   conversation.innerHTML = this.messages.map((message) => {
     const mine = Number(message.sender_id) === Number(window.currentUser?.id);
     const messageText = message.message_type === "text" ? this.highlightSearch(message.message || "") : "";

     return `
       <div class="message-row ${mine ? "me" : "other"}" data-id="${message.id}">
         ${!mine ? `<div class="message-avatar">${(message.full_name || "F").charAt(0).toUpperCase()}</div>` : ""}
         <div class="message-bubble">
           ${!mine ? `<div class="message-author">${message.full_name || "Family Member"}</div>` : ""}

           <div class="message-text">
             ${message.message_type === "image" ? `
               <img src="${message.media_url || ""}" class="chat-image" loading="lazy" onclick="window.open('${message.media_url || ""}')" />
               ${message.message ? `<div class="media-caption">${message.message}</div>` : ""}
             ` : ""}

             ${message.message_type === "video" ? `
               <video class="chat-video" controls preload="metadata">
                 <source src="${message.media_url || ""}" type="video/mp4" />
               </video>
               ${message.message ? `<div class="media-caption">${message.message}</div>` : ""}
             ` : ""}

             ${message.message_type === "file" ? `
               <a href="${message.media_url || "#"}" target="_blank" class="chat-file">📄 ${message.message || "Attachment"}</a>
             ` : ""}

             ${message.message_type === "text" ? messageText : ""}
           </div>

           <div class="message-time">
             ${mine ? `<span class="message-status ${message.seen == 1 ? "seen" : ""}">${message.seen == 1 ? "✔✔" : (message.delivered == 1 ? "✔✔" : "✔")}</span>` : ""}
             ${new Date(message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
           </div>

           <div class="message-actions">
             <button class="message-action react-btn" data-id="${message.id}" type="button">😀</button>
             ${mine ? `
               <button class="message-action edit-message" data-id="${message.id}" data-text="${message.message || ""}" type="button">✏️</button>
               <button class="message-action delete-message" data-id="${message.id}" type="button">🗑️</button>
             ` : ""}
           </div>
         </div>
       </div>
     `;
   }).join("");

   const sendButton = document.getElementById("sendMessage");
   if (sendButton) {
     sendButton.onclick = () => this.sendMessage();
   }

   const input = document.getElementById("messageInput");
   if (input) {
     let typingTimer;
     input.oninput = () => {
       clearTimeout(typingTimer);
       this.sendTyping(true);
       typingTimer = setTimeout(() => this.sendTyping(false), 1500);
     };

     input.onkeydown = (event) => {
       if (event.key === "Enter") {
         event.preventDefault();
         this.sendMessage();
       }
     };
   }

   conversation.scrollTop = conversation.scrollHeight;

   document.querySelectorAll(".edit-message").forEach((button) => {
     button.onclick = () => {
       const id = button.dataset.id;
       const oldText = button.dataset.text || "";
       const updated = prompt("Edit your message", oldText);
       if (updated === null || updated.trim() === "") return;
       this.editMessage(id, updated);
     };
   });

   document.querySelectorAll(".delete-message").forEach((button) => {
     button.onclick = () => {
       if (!confirm("Delete this message?")) return;
       this.deleteMessage(button.dataset.id);
     };
   });

   document.querySelectorAll(".react-btn").forEach((button) => {
     button.onclick = (event) => {
       event.stopPropagation();
       this.reactionMenu.classList.remove("hidden");
       this.reactionMenu.dataset.message = button.dataset.id;

       const rect = button.getBoundingClientRect();
       this.reactionMenu.style.left = rect.left + "px";
       this.reactionMenu.style.top = (rect.top - 55) + "px";
     };
   });
 },

 async sendMessage() {
   const input = document.getElementById("messageInput");
   const fileInput = document.getElementById("chatFile");

   if (!input || !this.selectedConversation) return;

   const text = input.value.trim();
   const file = fileInput && fileInput.files ? fileInput.files[0] : null;

   if (!text && !file) return;

   const formData = new FormData();
   formData.append("conversation_id", this.selectedConversation);
   formData.append("message", text);

   if (file) {
     formData.append("file", file);
   }

   const response = await fetch("php/api/send_message.php", {
     method: "POST",
     body: formData,
     credentials: "include",
   });

   const result = await response.json();
   if (result.success) {
     input.value = "";
     if (fileInput) fileInput.value = "";
     await this.loadMessages();
     await this.loadConversations();
   }
 },

 async sendTyping(status) {
   if (!this.selectedConversation) return;
   const form = new FormData();
   form.append("conversation_id", this.selectedConversation);
   form.append("typing", status ? 1 : 0);

   await fetch("php/api/typing.php", {
     method: "POST",
     body: form,
     credentials: "include",
   });
 },

 async checkTyping() {
   if (!this.selectedConversation) return;
   const response = await fetch("php/api/typing_status.php?conversation=" + this.selectedConversation, {
     credentials: "include",
   });

   const result = await response.json();
   const label = document.getElementById("typingStatus");
   if (!label) return;

   if (result.success && Array.isArray(result.data) && result.data.length) {
     label.textContent = result.data[0].full_name + " is typing...";
   } else {
     label.textContent = "Family Hub Messaging";
   }
 },

 async loadConversations() {
   const response = await fetch("php/api/conversations.php", { credentials: "include" });
   const result = await response.json();
   if (!result.success) return;

   this.conversations = Array.isArray(result.data) ? result.data : [];

   if (this.conversations.length && (!this.selectedConversation || !this.conversations.some((conversation) => Number(conversation.id) === Number(this.selectedConversation)))) {
     this.selectedConversation = Number(this.conversations[0].id);
   }

   this.renderConversationList();
   if (this.conversations.length && this.selectedConversation) {
     await this.loadMessages();
   }
 },

 renderConversationList() {
   const list = document.getElementById("conversationList");
   if (!list) return;

   if (!this.conversations.length) {
     list.innerHTML = '<div class="empty-chat"><p>No conversations yet.</p></div>';
     return;
   }

   list.innerHTML = this.conversations.map((conversation) => {
     const conversationName = conversation.name || "Family Chat";
     const activeClass = Number(this.selectedConversation) === Number(conversation.id) ? "active" : "";
     const avatar = conversation.type === "group" ? "🌍" : (conversationName || "F").charAt(0).toUpperCase();

     return `
       <div class="chat-user ${activeClass}" data-id="${conversation.id}">
         <div class="chat-user-avatar">${avatar}</div>
         <div class="chat-user-info">
           <strong>${conversationName}</strong>
           <small>${conversation.last_message || "Start chatting..."}</small>
           ${conversation.unread_count > 0 ? `<div class="unread-badge">${conversation.unread_count}</div>` : ""}
         </div>
       </div>
     `;
   }).join("");

   document.querySelectorAll("#conversationList .chat-user").forEach((item) => {
     item.onclick = () => {
       this.selectedConversation = Number(item.dataset.id);
       const conv = this.conversations.find((c) => Number(c.id) === Number(item.dataset.id));
       const chatTitle = document.getElementById("chatTitle");
       if (chatTitle && conv) chatTitle.textContent = conv.name || "Family Chat";

       this.renderConversationList();
       this.loadMessages();
       this.updateMobileLayout();
     };
   });
 },

 async editMessage(id, message) {
   const form = new FormData();
   form.append("id", id);
   form.append("message", message);

   const response = await fetch("php/api/edit_message.php", {
     method: "POST",
     body: form,
     credentials: "include",
   });

   const result = await response.json();
   if (result.success) {
     await this.loadMessages();
     await this.loadConversations();
   }
 },

 async deleteMessage(id) {
   const form = new FormData();
   form.append("message_id", id);

   const response = await fetch("php/api/delete_message.php", {
     method: "POST",
     body: form,
     credentials: "include",
   });

   const result = await response.json();
   if (result.success) {
     await this.loadMessages();
     await this.loadConversations();
   }
 },

 async reactToMessage(id, reaction) {
   if (!id) return;
   const form = new FormData();
   form.append("message_id", id);
   form.append("reaction", reaction);

   const response = await fetch("php/api/react_message.php", {
     method: "POST",
     body: form,
     credentials: "include",
   });

   const result = await response.json();
   if (result.success) {
     await this.loadMessages();
   }
 },

 searchMessages(query) {
   query = (query || "").toLowerCase();
   document.querySelectorAll(".message-row").forEach((row) => {
     const text = (row.innerText || "").toLowerCase();
     row.style.display = text.includes(query) ? "flex" : "none";
   });
 },

 highlightSearch(text) {
   const search = document.getElementById("messageSearch")?.value.trim();
   if (!search) return text;
   const regex = new RegExp(`(${search})`, "gi");
   return (text || "").replace(regex, "<mark>$1</mark>");
 },
};