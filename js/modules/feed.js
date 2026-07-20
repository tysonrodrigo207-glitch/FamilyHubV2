const FeedModule = {

  posts: [

    {
      id: 1,
      author: "Sarah",
      role: "Community Parent",
      time: "2 mins ago",
      content:
        "Excited for the upcoming Family Wellness event this Saturday 🎉",

      media: "",

      likes: 12,

      likedByUser: false,

      comments: [
        {
          user: "Tyson",
          text: "This is going to be amazing 🔥"
        }
      ]
    }

  ],

  selectedMedia: null,

  render(container) {

    container.innerHTML = `

      <div class="feed-layout">

        <!-- MAIN -->

        <div>

          <!-- CREATE POST -->

          <div class="card create-post">

            <div class="create-post-top">

              <div class="avatar">
                T
              </div>

              <textarea
                id="postInput"
                placeholder="Share something with the community..."
              ></textarea>

            </div>

            <!-- MEDIA PREVIEW -->

            <div id="mediaPreview"></div>

            <!-- ACTIONS -->

            <div class="create-post-actions">

              <div class="post-tools">

                <label class="upload-btn">

                  📷 Photo

                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    hidden
                  >

                </label>

                <label class="upload-btn">

                  🎥 Video

                  <input
                    type="file"
                    id="videoUpload"
                    accept="video/*"
                    hidden
                  >

                </label>

                <label class="upload-btn">

                  📎 Resource

                  <input
                    type="file"
                    id="resourceUpload"
                    hidden
                  >

                </label>

              </div>

              <button
                id="publishPost"
                class="primary-btn"
              >
                Post
              </button>

            </div>

          </div>

          <!-- POSTS -->

          <div id="postsContainer">

            ${this.posts.map(post =>
              this.postTemplate(post)
            ).join("")}

          </div>

        </div>

        <!-- RIGHT -->

        <div class="feed-right-panel">

          <div class="card">

            <h3>
              🔥 Trending Topics
            </h3>

            <div class="trend-item">
              # Parenting Support
            </div>

            <div class="trend-item">
              # Family Wellness
            </div>

            <div class="trend-item">
              # Education
            </div>

          </div>

        </div>

      </div>

    `;

    this.attachEvents();
  },

  postTemplate(post) {

    return `

      <div class="card social-post">

        <!-- HEADER -->

        <div class="post-header">

          <div class="post-user">

            <div class="avatar">
              ${post.author.charAt(0)}
            </div>

            <div>

              <h4>${post.author}</h4>

              <span>
                ${post.role} • ${post.time}
              </span>

            </div>

          </div>

        </div>

        ${
          window.currentUser.role === "Admin"
          ||
          window.currentUser.name === post.author

          ? `

          <button
          class="delete-post-btn"
          data-id="${post.id}"
          >

          🗑

          </button>

          `

          : ""
          }

        <!-- CONTENT -->

        <div class="post-content">

          <p>
            ${post.content}
          </p>

        </div>

        <!-- MEDIA -->

        ${
          post.media
            ? `
              <div class="post-image">

                ${
                  post.mediaType === "image"
                    ? `<img src="${post.media}">`

                    : post.mediaType === "video"
                    ? `
                      <video
                        controls
                        playsinline
                        preload="metadata"
                      >

                        <source
                          src="${post.media}"
                          type="video/mp4"
                        >

                      </video>
                    `

                    : `
                      <a
                        class="resource-box"
                        href="${post.media}"
                        download="${post.fileName || 'resource'}"
                      >

                        📎
                        ${post.fileName || 'Download Resource'}

                      </a>
                    `
                }

              </div>
            `
            : ""
        }

        <!-- STATS -->

        <div class="post-stats">

          <span>
            ❤️ ${post.likes} likes
          </span>

          <span>
            💬 ${post.comments.length} comments
          </span>

        </div>

        <!-- ACTIONS -->

        <div class="post-actions">

          <button
            class="action-btn like-btn
            ${post.likedByUser ? "liked" : ""}"
            data-id="${post.id}"
          >
            ❤️
            ${post.likedByUser ? "Liked" : "Like"}
          </button>

          <button
            class="action-btn comment-btn"
            data-id="${post.id}"
            >

            💬 Comment

          </button>

          <button
            class="action-btn share-btn"
            data-id="${post.id}"
            >

            ↗ Share

          </button>

        </div>

        <!-- COMMENTS -->

<div class="comments-section">

  ${post.comments.map(comment => `

    <div class="comment-item">

      <strong>
        ${comment.user}
      </strong>

      <p>
        ${comment.text}
      </p>

    </div>

  `).join("")}

  <div class="comment-input-row">

    <input
      class="comment-input"
      placeholder="Write a comment..."
    >

    <button
      class="primary-btn add-comment-btn"
      data-id="${post.id}"
    >

      Send

    </button>

  </div>

</div>

      </div>

    `;
  },

  attachEvents() {

    /* PUBLISH */

    document
      .getElementById("publishPost")
      ?.addEventListener("click", () => {

        const input =
          document.getElementById("postInput");

        const text = input.value.trim();

        if (!text && !this.selectedMedia) return;

        this.posts.unshift({

          id: Date.now(),

          author: window.currentUser.name,

          authorRole: window.currentUser.role,

          role: window.currentUser.role,

          time: "Just now",

          content: text,

          media:
            this.selectedMedia?.url || "",

          mediaType:
            this.selectedMedia?.type || "",

          fileName:
            this.selectedMedia?.fileName || "",

          likes: 0,

          likedByUser: false,

          comments: []

        });

        this.selectedMedia = null;

        this.render(
          document.getElementById("contentArea")
        );

      });

    /* IMAGE */

    document
      .getElementById("imageUpload")
      ?.addEventListener("change", e => {

        this.handleMedia(
          e.target.files[0],
          "image"
        );

      });

    /* VIDEO */

    document
      .getElementById("videoUpload")
      ?.addEventListener("change", e => {

        this.handleMedia(
          e.target.files[0],
          "video"
        );

      });

    /* RESOURCE */

    document
      .getElementById("resourceUpload")
      ?.addEventListener("change", e => {

        this.handleMedia(
          e.target.files[0],
          "resource"
        );

      });

    /* LIKE SYSTEM */

    document
      .querySelectorAll(".like-btn")
      .forEach(btn => {

        btn.addEventListener("click", () => {

          const id =
            Number(btn.dataset.id);

          const post =
            this.posts.find(
              p => p.id === id
            );

          if (!post) return;

          if (post.likedByUser) {

            post.likes--;
            post.likedByUser = false;

          } else {

            post.likes++;
            post.likedByUser = true;
          }

          this.render(
            document.getElementById("contentArea")
          );

        });

      });

  document
.querySelectorAll(".delete-post-btn")
.forEach(btn => {

btn.addEventListener("click", () => {

const id =
Number(btn.dataset.id);

this.posts =
this.posts.filter(
post => post.id !== id
);

this.render(
document.getElementById(
"contentArea"
)
);

});

});

document
.querySelectorAll(".share-btn")
.forEach(btn => {

btn.addEventListener("click", () => {

navigator.clipboard.writeText(
`familyhub/post/${btn.dataset.id}`
);

alert(
"Post link copied!"
);

});

});

document
.querySelectorAll(".comment-btn")
.forEach(btn => {

btn.addEventListener("click", () => {

const postCard =
btn.closest(
".social-post"
);

const input =
postCard.querySelector(
".comment-input"
);

if(input){

input.focus();

}

});

});

document
.querySelectorAll(".add-comment-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    const id =
      Number(btn.dataset.id);

    const parent =
      btn.closest(".comments-section");

    const input =
      parent.querySelector(
        ".comment-input"
      );

    const text =
      input.value.trim();

    if (!text) return;

    const post =
      this.posts.find(
        p => p.id === id
      );

    if (!post) return;

    post.comments.push({

      user:
        window.currentUser.name,

      text

    });

    this.render(
      document.getElementById(
        "contentArea"
      )
    );

  });

});
},

  handleMedia(file, type) {

  if (!file) return;

  const preview =
    document.getElementById(
      "mediaPreview"
    );

  if (!preview) return;

  /* IMAGE */

  if (type === "image") {

    const imageURL =
      URL.createObjectURL(file);

    this.selectedMedia = {

      url: imageURL,

      type: "image"
    };

    preview.innerHTML = `

      <div class="media-preview-box">

        <img src="${imageURL}">

      </div>

    `;

    return;
  }

  /* VIDEO */

  if (type === "video") {

    const videoURL =
      URL.createObjectURL(file);

    this.selectedMedia = {

      url: videoURL,

      type: "video"
    };

    preview.innerHTML = `

      <div class="media-preview-box">

        <video controls>

          <source src="${videoURL}">

        </video>

      </div>

    `;

    return;
  }

  /* RESOURCE */

  if (type === "resource") {

  const resourceURL =
    URL.createObjectURL(file);

  this.selectedMedia = {

    url: resourceURL,

    type: "resource",

    fileName: file.name
  };

  preview.innerHTML = `

    <a
      class="resource-box"
      href="${resourceURL}"
      download="${file.name}"
    >

      📎 ${file.name}

    </a>

  `;
}

}

};