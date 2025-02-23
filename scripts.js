document.addEventListener("DOMContentLoaded", () => {
  const postList = document.getElementById("posts");
  const newPostButton = document.getElementById("new-post");
  const postEditor = document.getElementById("post-editor");
  const postForm = document.getElementById("post-form");
  const postAuthor = document.getElementById("author");
  const postTitle = document.getElementById("title");
  const postDescription = document.getElementById("description");
  const postContent = document.getElementById("content");
  const postTags = document.getElementById("tags");
  const postImageFile = document.getElementById("image-file");
  const profileLink = document.getElementById("profile");
  const profileSection = document.getElementById("profile-section");
  const profileEditor = document.getElementById("profile-editor");
  const profileForm = document.getElementById("profile-form");
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const editProfileButton = document.getElementById("edit-profile");
  const userNameDisplay = document.getElementById("user-name");
  const userEmailDisplay = document.getElementById("user-email");
  const loginSection = document.getElementById("login-section");
  const signupSection = document.getElementById("signup-section");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const signupName = document.getElementById("signup-name");
  const signupEmail = document.getElementById("signup-email");
  const signupPassword = document.getElementById("signup-password");
  const showSignupLink = document.getElementById("show-signup");
  const showLoginLink = document.getElementById("show-login");
  const loginLink = document.getElementById("login");
  const logoutLink = document.getElementById("logout");
  const homeLink = document.getElementById("home");
  const loginShowPassword = document.getElementById("login-show-password");
  const signupShowPassword = document.getElementById("signup-show-password");

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
  let editingPostId = null;

  if (loggedInUser) {
    updateUIForLoggedInUser();
  } else {
    updateUIForLoggedOutUser();
  }

  showSignupLink.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    signupSection.classList.remove("hidden");
  });

  showLoginLink.addEventListener("click", () => {
    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();

    if (users.find((user) => user.email === email)) {
      alert("User already exists!");
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful! Please log in.");
    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      loggedInUser = user;
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      alert("Login successful!");
      updateUIForLoggedInUser();
    } else {
      alert("Invalid email or password!");
    }
  });

  logoutLink.addEventListener("click", (event) => {
    event.preventDefault();
    const confirmation = confirm("Are you sure you want to log out?");
    if (confirmation) {
      loggedInUser = null;
      localStorage.removeItem("loggedInUser");
      alert("Logged out successfully!");
      updateUIForLoggedOutUser();
    }
  });

  newPostButton.addEventListener("click", () => {
    postEditor.classList.remove("hidden");
    newPostButton.classList.add("hidden");
    postList.classList.add("hidden");
    postForm.reset();
    editingPostId = null;
  });

  postForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const author = postAuthor.value.trim();
    const title = postTitle.value.trim();
    const description = postDescription.value.trim();
    const content = postContent.value.trim();
    const tags = postTags.value
      .trim()
      .split(",")
      .map((tag) => tag.trim());
    const imageFile = postImageFile.files[0];

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imageUrl = e.target.result;
        savePost(author, title, description, content, tags, imageUrl);
      };
      reader.readAsDataURL(imageFile);
    } else {
      savePost(author, title, description, content, tags, "");
    }
  });

  function savePost(author, title, description, content, tags, imageUrl) {
    if (editingPostId !== null) {
      const post = posts.find((p) => p.id === editingPostId);
      post.author = author;
      post.title = title;
      post.description = description;
      post.content = content;
      post.tags = tags;
      post.imageUrl = imageUrl;
    } else {
      const postId = Date.now();
      posts.push({
        id: postId,
        author,
        title,
        description,
        content,
        tags,
        imageUrl,
        comments: [],
      });
    }

    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
    postEditor.classList.add("hidden");
    newPostButton.classList.remove("hidden");
    postList.classList.remove("hidden");
  }

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loggedInUser.name = profileName.value.trim();
    loggedInUser.email = profileEmail.value.trim();
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    updateProfileDisplay();
    profileEditor.classList.add("hidden");
  });

  editProfileButton.addEventListener("click", () => {
    profileEditor.classList.toggle("hidden");
    profileName.value = loggedInUser.name;
    profileEmail.value = loggedInUser.email;
  });

  profileLink.addEventListener("click", () => {
    profileSection.classList.remove("hidden");
    postList.classList.add("hidden");
    postEditor.classList.add("hidden");
  });

  homeLink.addEventListener("click", () => {
    postList.classList.remove("hidden");
    profileSection.classList.add("hidden");
    postEditor.classList.add("hidden");
  });

  function renderPosts() {
    postList.innerHTML = "";
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p><strong>Author:</strong> ${post.author}</p>
                    <p>${post.description}</p>
                    <p>${post.content}</p>
                    ${
                      post.imageUrl
                        ? `<img src="${post.imageUrl}" alt="Post Image" class="post-image" onerror="this.onerror=null;this.src='default.jpg';">`
                        : ""
                    }
                    <p><strong>Tags:</strong> ${post.tags.join(", ")}</p>
                    <button onclick="editPost(${post.id})">Edit</button>
                    <button onclick="deletePost(${post.id})">Delete</button>
                    <div class="comments">
                        <h4>Comments</h4>
                        <input type="text" placeholder="Add a comment" id="comment-input-${
                          post.id
                        }">
                        <button onclick="addComment(${
                          post.id
                        })">Comment</button>
                        <div class="comment-list">
                            ${post.comments
                              .map((comment) => `<p>${comment}</p>`)
                              .join("")}
                        </div>
                    </div>
                `;
      postList.appendChild(postElement);
    });
  }

  window.editPost = (postId) => {
    const post = posts.find((p) => p.id === postId);
    postAuthor.value = post.author;
    postTitle.value = post.title;
    postDescription.value = post.description;
    postContent.value = post.content;
    postTags.value = post.tags.join(", ");
    postEditor.classList.remove("hidden");
    newPostButton.classList.add("hidden");
    postList.classList.add("hidden");
    editingPostId = postId;
  };

  window.deletePost = (postId) => {
    posts = posts.filter((p) => p.id !== postId);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
  };

  window.addComment = (postId) => {
    const post = posts.find((p) => p.id === postId);
    const commentInput = document.getElementById(`comment-input-${post.id}`);
    const comment = commentInput.value.trim();
    if (comment) {
      post.comments.push(comment);
      commentInput.value = "";
    }
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
  };

  function updateUIForLoggedInUser() {
    userNameDisplay.textContent = loggedInUser.name;
    userEmailDisplay.textContent = loggedInUser.email;
    profileLink.classList.remove("hidden");
    logoutLink.classList.remove("hidden");
    newPostButton.classList.remove("hidden");
    postList.classList.remove("hidden");
    loginLink.classList.add("hidden");
    loginSection.classList.add("hidden");
    signupSection.classList.add("hidden");
    renderPosts();
  }

  function updateUIForLoggedOutUser() {
    profileLink.classList.add("hidden");
    logoutLink.classList.add("hidden");
    newPostButton.classList.add("hidden");
    postList.classList.add("hidden");
    loginLink.classList.remove("hidden");
    loginSection.classList.remove("hidden");
    signupSection.classList.add("hidden");
    profileSection.classList.add("hidden");
  }

  loginShowPassword.addEventListener("change", () => {
    if (loginShowPassword.checked) {
      loginPassword.type = "text";
    } else {
      loginPassword.type = "password";
    }
  });

  signupShowPassword.addEventListener("change", () => {
    if (signupShowPassword.checked) {
      signupPassword.type = "text";
    } else {
      signupPassword.type = "password";
    }
  });
});
