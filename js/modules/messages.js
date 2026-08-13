const MessagesModule = {

    users: [],

    messages: [],

    conversations: [],
    selectedConversation: null,

    selectedUser: null,

    online(lastSeen){

    if(!lastSeen) return false;

    return (
        Date.now() - new Date(lastSeen).getTime()
    ) < 120000;

},

    async render(container){

      if(this.refreshTimer){

    clearInterval(this.refreshTimer);

}

container.innerHTML=`

<div class="messages-page">

    <div class="messages-sidebar">

        <div class="messages-title">

            💬 Messages

        </div>

        <div class="messages-search">

            <input
            id="messageSearch"
            placeholder="Search..."
            >

        </div>

        <div class="messages-section">

        </div>

        <div class="messages-section">

            <div class="section-title">

                DIRECT MESSAGES

            </div>
                        <div class="section-title">
                MEMBERS
            </div>

            <div id="usersList"></div>

            <div id="conversationList" class="conversation-list"></div>

        </div>

    </div>

    <div class="messages-chat">

        <div class="chat-header">

            <div>

                <h3 id="chatTitle">

                    🌍 Community

                </h3>

                <small id="typingStatus">

                    Family Hub Messaging

                </small>

            </div>

            <div class="chat-actions">

                🔍

                📌

                ☎️

            </div>

        </div>

        <div
        id="conversation"
        class="conversation">

        </div>

        <div class="chat-send">

            <div class="chat-send-tools">

              <div class="emoji-wrapper">

                <button
                id="emojiBtn"
                class="chat-tool-btn">

                😊

                </button>

                <div
                id="emojiPicker"
                class="emoji-picker hidden">

                😀 😂 🤣 😍 🥰 😎 🤔 😢 😭 😡 👍 👎 👏 🙌 ❤️ 💔 🎉 🎂 🔥 💯 🚀 🌍

                </div>

                </div>

              <label class="chat-tool-btn">

                  📎

                  <input
                  id="chatFile"
                  type="file"
                  hidden>

                  </label>

              <button class="chat-tool-btn">🖼️</button>

              <button class="chat-tool-btn">🎥</button>

            </div>

            <input
            id="messageInput"
            placeholder="Type a message..."
            >

            <button
            id="sendMessage"
            class="primary-btn">

                Send

            </button>

        </div>

    </div>

</div>

`;
const reactionMenu = document.createElement("div");

reactionMenu.id = "reactionMenu";

reactionMenu.className = "reaction-menu hidden";

reactionMenu.innerHTML = `
<span>👍</span>
<span>❤️</span>
<span>😂</span>
<span>😮</span>
<span>😢</span>
<span>🔥</span>
`;

document.body.appendChild(reactionMenu);

this.reactionMenu = reactionMenu;

this.reactionMenu
.querySelectorAll("span")
.forEach(item=>{

item.onclick=()=>{

this.reactToMessage(

this.reactionMenu.dataset.message,

item.textContent

);

this.reactionMenu.classList.add("hidden");

};

});

document.onclick=(e)=>{

if(!e.target.closest(".react-btn") &&
   !e.target.closest("#reactionMenu")){

this.reactionMenu.classList.add("hidden");

}

};

const filePicker =
document.getElementById("chatFile");

filePicker.onchange = ()=>{

if(!filePicker.files.length) return;

document.getElementById("messageInput").value =
"📎 " + filePicker.files[0].name;

};

this.selectedConversation=1;

await this.loadConversations();
await this.loadUsers();

if(this.selectedConversation){
    await this.loadMessages();
}

const emojiPicker =
document.getElementById("emojiPicker");

emojiPicker.innerHTML = emojiPicker.textContent
.trim()
.split(" ")
.map(e=>`<span>${e}</span>`)
.join("");

document
.getElementById("emojiBtn")
.onclick=()=>{

emojiPicker.classList.toggle("hidden");

};

emojiPicker.querySelectorAll("span")
.forEach(emoji=>{

emoji.onclick=()=>{

const input =
document.getElementById("messageInput");

input.value += emoji.textContent;

input.focus();

};

});

document.addEventListener("click",e=>{

if(!e.target.closest(".emoji-wrapper")){

emojiPicker.classList.add("hidden");

}

});

document
.getElementById("messageSearch")
.oninput = (e)=>{

this.searchMessages(
e.target.value
);

};

this.refreshTimer = setInterval(async()=>{

    await this.loadConversations();

    await this.loadUsers();

    if(this.selectedConversation){

        await this.loadMessages();
        await this.checkTyping();

    }

},5000);

},

    async loadUsers(){

        const response=await fetch(

            "php/api/users.php",

            {

                credentials:"include"

            }

        );

        const result=await response.json();

        if(!result.success){

            return;

        }

        this.users=result.data;

        const list = document.getElementById("usersList");

list.innerHTML = this.users
.filter(user => user.id != window.currentUser.id)
.map(user => `

<div class="chat-user member-user" data-id="${user.id}">

    <div class="chat-user-avatar">
        ${user.full_name.charAt(0)}
        <span class="${
          this.online(user.last_seen)
          ?
          'online-dot'
          :
          'offline-dot'
          }"></span>
    </div>

    <div>
        <strong>${user.full_name}</strong>
        <small>${user.role}</small>
    </div>

</div>

`).join("");

       document.querySelectorAll("#usersList .member-user")
.forEach(item=>{

    item.onclick = async ()=>{

        const form = new FormData();
        form.append("user_id", item.dataset.id);

        const response = await fetch(
            "php/api/create_direct.php",
            {
                method:"POST",
                body:form,
                credentials:"include"
            }
        );

        const result = await response.json();

        if(result.success){

            this.selectedConversation =
                result.conversation_id;

            await this.loadConversations();
            await this.loadMessages();

        }

    };

});

    },

    async loadMessages(){
        await fetch(
            "php/api/mark_delivered.php",
            {
                method:"POST",
                credentials:"include",
                body:new URLSearchParams({
                    conversation_id: this.selectedConversation
                })
            }
        );

        const response=await fetch(
            "php/api/messages.php?conversation="+this.selectedConversation,

            {
                credentials:"include"
            }

        );

        const result=await response.json();

        if(!result.success) return;

        this.messages = result.data || [];

        this.showConversation();

        await fetch(
          "php/api/mark_read.php",
          {
          method:"POST",
          credentials:"include",
          body:new URLSearchParams({
          conversation_id:this.selectedConversation
          })
          }
          );

    },

showConversation() {

    const conversation = document.getElementById("conversation");

    if (this.messages.length === 0) {

        conversation.innerHTML = `
            <div class="empty-chat">
                💬
                <h3>No messages yet</h3>
                <p>Start the conversation.</p>
            </div>
        `;
        return;
    }

    conversation.innerHTML = this.messages.map(message => {

        const mine =
            Number(message.sender_id) === Number(window.currentUser.id);

            console.log({
            sender: message.sender_id,
            current: window.currentUser.id,
            mine: mine,
            name: message.full_name
            });

        return `

       <div
        class="message-row ${mine ? "me" : "other"}"
        data-id="${message.id}">

            ${!mine ? `
                <div class="message-avatar">
                    ${message.full_name.charAt(0)}
                </div>
            ` : ""}

            <div class="message-bubble">

                ${!mine ? `
                    <div class="message-author">
                        ${message.full_name}
                    </div>
                ` : ""}

                <div class="message-text">

                    ${message.message_type==="image" ? `

                    <img
                    src="${message.media_url}"
                    class="chat-image"
                    loading="lazy"
                    onclick="window.open('${message.media_url}')">

                    ${message.message ? `

                    <div class="media-caption">

                    ${message.message}

                    </div>

                    ` : ""}

                    ` : ""}

                    ${message.message_type==="video" ? `

                    <video
                    class="chat-video"
                    controls
                    preload="metadata">

                    <source
                    src="${message.media_url}"
                    type="video/mp4">

                    </video>

                    ${message.message ? `

                    <div class="media-caption">

                    ${message.message}

                    </div>

                    ` : ""}

                    ` : ""}

                    ${message.message_type==="file" ? `

                    <a
                    href="${message.media_url}"
                    target="_blank"
                    class="chat-file">

                    📄 ${message.message}

                    </a>

                    ` : ""}

                    ${message.message_type==="text"
                    ?
                    this.highlightSearch(
                    message.message
                    )
                    :
                    ""}

                    </div>

                <div class="message-time">
                    ${mine ? `

                <span class="message-status ${
                message.seen==1 ? "seen" : ""
                }">

                ${
                message.seen==1
                ?
                "✔✔"
                :
                message.delivered==1
                ?
                "✔✔"
                :
                "✔"
                }

                </span>

                ` : ""}
                </div>

                ${new Date(message.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                </div>
                <div class="message-actions">

    <button
        class="message-action react-btn"
        data-id="${message.id}">
        😀
    </button>

    ${mine ? `

    <button
        class="message-action edit-message"
        data-id="${message.id}"
        data-text="${message.message}">
        ✏️
    </button>

    <button
        class="message-action delete-message"
        data-id="${message.id}">
        🗑️
    </button>

    ` : ""}

</div>

            </div>

        </div>

        `;

    }).join("");

    document.getElementById("sendMessage").onclick =
    () => this.sendMessage();

    const input = document.getElementById("messageInput");

    let typingTimer;

input.oninput = ()=>{

clearTimeout(typingTimer);

this.sendTyping(true);

typingTimer = setTimeout(()=>{

this.sendTyping(false);

},1500);

};

input.onkeydown=e=>{

if(e.key==="Enter"){

e.preventDefault();

this.sendMessage();

}

};

    conversation.scrollTop = conversation.scrollHeight;

        console.log(document.querySelectorAll(".edit-message"));

        document.querySelectorAll(".edit-message")
    .forEach(button=>{

    button.onclick = ()=>{

        console.log("Edit clicked");

        const id = button.dataset.id;

        const oldText = button.dataset.text;

        const updated = prompt(
            "Edit your message",
            oldText
        );

        if(
            updated===null ||
            updated.trim()===""
        ){
            return;
        }

        this.editMessage(
            id,
            updated
        );

    };

});

    document.querySelectorAll(".delete-message")
    .forEach(button=>{

        button.onclick = ()=>{

            if(!confirm(
                "Delete this message?"
            )) return;

            this.deleteMessage(
                button.dataset.id
            );

        };

    });

    document.querySelectorAll(".react-btn")
.forEach(button=>{

button.onclick=(e)=>{

e.stopPropagation();

const menu=this.reactionMenu;

menu.classList.remove("hidden");

menu.dataset.message=button.dataset.id;

const rect=button.getBoundingClientRect();

menu.style.left=rect.left+"px";

menu.style.top=(rect.top-55)+"px";

};

});
        console.log("Reaction buttons found:",
        document.querySelectorAll(".react-btn").length);
},

async sendMessage(){

    const input =
        document.getElementById("messageInput");

    const fileInput =
        document.getElementById("chatFile");

    const text = input.value.trim();

    const file = fileInput.files[0];

    if(!text && !file){
        return;
    }

    const formData = new FormData();

    formData.append(
        "conversation_id",
        this.selectedConversation
    );

    formData.append("message", text);

    if(file){
        formData.append("file", file);
    }

    const response = await fetch(
        "php/api/send_message.php",
        {
            method:"POST",
            body:formData,
            credentials:"include"
        }
    );

    const result = await response.json();

    if(result.success){

    input.value = "";

    fileInput.value = "";

    await this.loadMessages();

    

    }

},

async sendTyping(status){

const form = new FormData();

form.append(
"conversation_id",
this.selectedConversation
);

form.append(
"typing",
status ? 1 : 0
);

await fetch(

"php/api/typing.php",

{

method:"POST",

body:form,

credentials:"include"

}

);

},

async checkTyping(){

const response = await fetch(

"php/api/typing_status.php?conversation="+
this.selectedConversation,

{

credentials:"include"

}

);

const result = await response.json();

const label =
document.getElementById("typingStatus");

if(

result.success &&

result.data.length

){

label.textContent =

result.data[0].full_name +

" is typing...";

}else{

label.textContent =

"Family Hub Messaging";

}

},

    async loadConversations(){

    const response = await fetch(
        "php/api/conversations.php",
        {
            credentials:"include"
        }
    );

    const result = await response.json();

    if(!result.success) return;

    this.conversations = result.data;

    this.renderConversationList();

    if(this.conversations.length){

    if(!this.selectedConversation){

    this.selectedConversation =
        this.conversations[0].id;

}

    this.renderConversationList();

    this.loadMessages();

}

},

renderConversationList(){
  const list = document.getElementById("conversationList");

    list.innerHTML = this.conversations.map(conversation=>`

<div class="chat-user ${
this.selectedConversation===conversation.id
?
"active"
:
""
}" data-id="${conversation.id}">

<div class="chat-user-avatar">

${
conversation.type==="group"
?
"🌍"
:
(conversation.name || "?").charAt(0)
}

</div>

<div class="chat-user-info">

<strong>

${conversation.name}

</strong>

<small>

${conversation.last_message || "Start chatting..."}

</small>

${conversation.unread_count > 0 ? `

<div class="unread-badge">

${conversation.unread_count}

</div>

` : ""}

</div>

</div>

`).join("");

   document.querySelectorAll("#conversationList .chat-user")

    .forEach(item=>{

        item.onclick = () => {

    this.selectedConversation =
        parseInt(item.dataset.id);

    const conv = this.conversations.find(
        c => c.id == item.dataset.id
    );

    document.getElementById("chatTitle").textContent =
        conv.name;

    this.renderConversationList();

    this.loadMessages();

};

    });

},

async editMessage(id,message){

    const form = new FormData();

    form.append("id",id);

    form.append("message",message);

    const response = await fetch(

        "php/api/edit_message.php",

        {

            method:"POST",

            body:form,

            credentials:"include"

        }

    );

    const result = await response.json();

    if(result.success){

        await this.loadMessages();
        await this.loadConversations();
            }

},

async deleteMessage(id){

    const form = new FormData();

    form.append(
        "message_id",
        id
    );

    const response = await fetch(

        "php/api/delete_message.php",

        {
            method:"POST",
            body:form,
            credentials:"include"
        }

    );

    const result = await response.json();

    if(result.success){

        await this.loadMessages();
        await this.loadConversations();

    }

},

async reactToMessage(id,reaction){
    console.log("STEP 4 - reactToMessage()");

console.log("Sending reaction:", id, reaction);

const form=new FormData();

form.append("message_id",id);
form.append("reaction",reaction);

const response=await fetch(
"php/api/react_message.php",
{
method:"POST",
body:form,
credentials:"include"
}
);

const result=await response.json();

console.log(result);

if(result.success){

await this.loadMessages();

}

},

searchMessages(query){

query = query.toLowerCase();

document
.querySelectorAll(".message-row")
.forEach(row=>{

const text = row
.innerText
.toLowerCase();

row.style.display =
text.includes(query)
?
"flex"
:
"none";

});

},

highlightSearch(text){

const search =
document
.getElementById("messageSearch")
?.value
.trim();

if(!search) return text;

const regex =
new RegExp(
`(${search})`,
"gi"
);

return text.replace(
regex,
"<mark>$1</mark>"
);

}

}
