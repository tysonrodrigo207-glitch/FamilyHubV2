const FeedModule = {
posts: [],
selectedMedia: [],
loaded: false,

getMediaItems(media) {
   if (!media) return [];
   return media
     .split(",")
     .map(item => item.trim())
     .filter(item => item && item !== "null");
},

normalizeMediaType(post) {
   const mediaItems = this.getMediaItems(post.media);

   if (!mediaItems.length) {
     return "";
   }

   if (post.media_type === "image" || post.media_type === "video" || post.media_type === "resource") {
     return post.media_type;
   }

   return mediaItems.length > 1 ? "image" : (mediaItems[0].match(/\.(mp4|mov|webm|ogg|avi|mkv)(\?|$)/i) ? "video" : (mediaItems[0].match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? "image" : "resource"));
},

async loadPosts() {
   const response = await fetch("php/api/feed.php", {
     credentials: "include",
   });

   const result = await response.json();

   if (!result.success) {
     alert(result.message);
     return;
   }

   this.posts = (result.data || []).map(post => ({
     id: Number(post.id),
     author: post.author,
     role: post.role,
     time: post.created_at,
     content: post.content,
     media: post.media,
     mediaType: this.normalizeMediaType(post),
     fileName: post.file_name || this.getMediaItems(post.media).slice(-1)[0]?.split('/').pop() || "",
     likes: Number(post.likes || 0),
     likedByUser: Boolean(post.liked),
     comments: post.comments || [],
     comments_count: Number(post.comments_count || 0),
   }));

   this.render(document.getElementById("contentArea"));
},

render(container) {
   container.innerHTML = `
     <div class="feed-layout">
       <div>
         <div class="card create-post">
           <div class="create-post-top">
             <div class="avatar">T</div>
             <textarea id="postInput" placeholder="Share something with the community..."></textarea>
           </div>

           <div id="mediaPreview"></div>

           <div class="create-post-actions">
             <div class="post-tools">
               <label class="upload-btn">
                 📷 Photo
                 <input type="file" id="imageUpload" accept="image/*" multiple hidden>
               </label>

               <label class="upload-btn">
                 🎥 Video
                 <input type="file" id="videoUpload" accept="video/*" hidden>
               </label>

               <label class="upload-btn">
                 📎 Resource
                 <input type="file" id="resourceUpload" hidden>
               </label>
             </div>

             <button id="publishPost" class="primary-btn">Post</button>
           </div>
         </div>

         <div id="postsContainer">
           ${this.posts.map(post => this.postTemplate(post)).join("")}
         </div>
       </div>

       <div class="feed-right-panel">
         <div class="card">
           <h3>🔥 Trending Topics</h3>
           <div class="trend-item"># Parenting Support</div>
           <div class="trend-item"># Family Wellness</div>
           <div class="trend-item"># Education</div>
         </div>
       </div>
     </div>
   `;

   this.attachEvents();

   if (!this.loaded) {
     this.loaded = true;
     this.loadPosts();
   }
},

postTemplate(post) {
   const mediaItems = this.getMediaItems(post.media);
   const mediaMarkup = (() => {
     if (!mediaItems.length) return "";

     if (post.mediaType === "image") {
       if (mediaItems.length > 1) {
         return `
           <div class="media-gallery">
             ${mediaItems.map(src => `<img src="${src}" alt="Shared family image" loading="lazy">`).join("")}
           </div>
         `;
       }

       return `<div class="post-image"><img src="${mediaItems[0]}" alt="Shared family image" loading="lazy"></div>`;
     }

     if (post.mediaType === "video") {
       return `
         <div class="post-image">
           <video controls preload="metadata" playsinline controlsList="nodownload">
             <source src="${mediaItems[0]}" type="video/mp4">
           </video>
         </div>
       `;
     }

     const fileLabel = post.fileName || mediaItems[0].split("/").pop() || "Download Resource";
     return `<a class="resource-box" href="${mediaItems[0]}" download="${fileLabel}" target="_blank" rel="noreferrer">📎 ${fileLabel}</a>`;
   })();

   const canDelete = Boolean(window.currentUser) && (
     window.currentUser.role === "Admin" ||
     window.currentUser.name === post.author ||
     window.currentUser.username === post.author
   );

   return `
     <div class="card social-post">
       <div class="post-header">
         <div class="post-user">
           <div class="avatar">${post.author.charAt(0)}</div>
           <div>
             <h4>${post.author}</h4>
             <span>${post.role} • ${post.time}</span>
           </div>
         </div>
         ${canDelete ? `<button class="delete-post-btn" data-id="${post.id}">🗑</button>` : ""}
       </div>

       <div class="post-content"><p>${post.content}</p></div>

       ${mediaMarkup ? `<div class="post-media">${mediaMarkup}</div>` : ""}

       <div class="post-stats">
         <span>❤️ ${post.likes} likes</span>
         <span>💬 ${post.comments_count || 0} comments</span>
       </div>

       <div class="post-actions">
         <button class="action-btn like-btn ${post.likedByUser ? "liked" : ""}" data-id="${post.id}">
           ❤️ ${post.likedByUser ? "Liked" : "Like"}
         </button>
         <button class="action-btn comment-btn" data-id="${post.id}">💬 Comment</button>
         <button class="action-btn share-btn" data-id="${post.id}">↗ Share</button>
       </div>

       <div class="comments-section">
         ${post.comments.map(comment => `
           <div class="comment-item">
             <strong>${comment.user}</strong>
             <p>${comment.text}</p>
           </div>
         `).join("")}

         <div class="comment-input-row">
           <input class="comment-input" placeholder="Write a comment...">
           <button class="primary-btn add-comment-btn" data-id="${post.id}">Send</button>
         </div>
       </div>
     </div>
   `;
},

attachEvents() {
   document.getElementById("publishPost")?.addEventListener("click", async () => {
     const text = document.getElementById("postInput")?.value.trim() || "";
     const selectedFiles = Array.isArray(this.selectedMedia) ? this.selectedMedia : [];

     if (!text && selectedFiles.length === 0) {
       return;
     }

     const formData = new FormData();
     formData.append("content", text);

     selectedFiles.forEach(item => {
       formData.append("media[]", item.file);
     });

     const response = await fetch("php/api/create_post.php", {
       method: "POST",
       body: formData,
       credentials: "include",
     });

     const result = await response.json();
     if (!result.success) {
       alert(result.message);
       return;
     }

     await this.loadPosts();
     this.selectedMedia = [];
     const postInput = document.getElementById("postInput");
     if (postInput) postInput.value = "";
     const mediaPreview = document.getElementById("mediaPreview");
     if (mediaPreview) mediaPreview.innerHTML = "";
     const imageInput = document.getElementById("imageUpload");
     if (imageInput) imageInput.value = "";
     const videoInput = document.getElementById("videoUpload");
     if (videoInput) videoInput.value = "";
     const resourceInput = document.getElementById("resourceUpload");
     if (resourceInput) resourceInput.value = "";
   });

   document.getElementById("imageUpload")?.addEventListener("change", event => {
     const files = Array.from(event.target.files || []);
     if (!files.length) return;
     this.handleMedia(files, "image");
     event.target.value = "";
   });

   document.getElementById("videoUpload")?.addEventListener("change", event => {
     const file = event.target.files?.[0];
     if (!file) return;
     this.handleMedia([file], "video");
     event.target.value = "";
   });

   document.getElementById("resourceUpload")?.addEventListener("change", event => {
     const file = event.target.files?.[0];
     if (!file) return;
     this.handleMedia([file], "resource");
     event.target.value = "";
   });

   document.querySelectorAll(".like-btn").forEach(btn => {
     btn.addEventListener("click", async () => {
       const formData = new FormData();
       formData.append("post_id", btn.dataset.id);

       const response = await fetch("php/api/like_post.php", {
         method: "POST",
         body: formData,
         credentials: "include",
       });

       const result = await response.json();
       if (result.success) {
         await this.loadPosts();
       }
     });
   });

   document.querySelectorAll(".delete-post-btn").forEach(btn => {
     btn.addEventListener("click", async () => {
       const id = Number(btn.dataset.id);
       if (!confirm("Delete this post?")) return;

       const formData = new FormData();
       formData.append("id", id);

       const response = await fetch("php/api/delete_post.php", {
         method: "POST",
         body: formData,
         credentials: "include",
       });

       const result = await response.json();
       if (!result.success) {
         alert(result.message);
         return;
       }

       await this.loadPosts();
     });
   });

   document.querySelectorAll(".share-btn").forEach(btn => {
     btn.addEventListener("click", () => {
       navigator.clipboard.writeText(`familyhub/post/${btn.dataset.id}`);
       alert("Post link copied!");
     });
   });

   document.querySelectorAll(".comment-btn").forEach(btn => {
     btn.addEventListener("click", () => {
       const postCard = btn.closest(".social-post");
       const input = postCard?.querySelector(".comment-input");
       input?.focus();
     });
   });

   document.querySelectorAll(".add-comment-btn").forEach(btn => {
     btn.addEventListener("click", async () => {
       const parent = btn.closest(".comments-section");
       const input = parent?.querySelector(".comment-input");
       const text = input?.value.trim();
       if (!text) return;

       const formData = new FormData();
       formData.append("post_id", btn.dataset.id);
       formData.append("comment", text);

       const response = await fetch("php/api/add_comment.php", {
         method: "POST",
         body: formData,
         credentials: "include",
       });

       const result = await response.json();
       if (result.success) {
         await this.loadPosts();
       }
     });
   });
},

handleMedia(files, type) {
   const selectedFiles = Array.isArray(files) ? files : [files];
   if (!selectedFiles.length || !selectedFiles[0]) return;

   const preview = document.getElementById("mediaPreview");
   if (!preview) return;

   if (type === "image") {
     this.selectedMedia = selectedFiles.slice(0, 6).map(file => ({
       file,
       type: "image",
       url: URL.createObjectURL(file),
     }));

     preview.innerHTML = `
       <div class="media-preview-box media-gallery">
         ${this.selectedMedia.map(item => `<img src="${item.url}" alt="Selected upload" loading="lazy">`).join("")}
       </div>
     `;
     return;
   }

   const firstFile = selectedFiles[0];
   this.selectedMedia = [{
     file: firstFile,
     type,
     url: URL.createObjectURL(firstFile),
   }];

   if (type === "video") {
     preview.innerHTML = `
       <div class="media-preview-box">
         <video controls playsinline>
           <source src="${this.selectedMedia[0].url}">
         </video>
       </div>
     `;
     return;
   }

   preview.innerHTML = `
     <a class="resource-box" href="${this.selectedMedia[0].url}" download="${firstFile.name}" target="_blank" rel="noreferrer">
       📎 ${firstFile.name}
     </a>
   `;
},
};