console.log("Test");

const apiUrl = "http://localhost:1337/api";

// Apply color theme from Strapi
async function colorTheme() {
  try {
    const response = await axios.get(`${apiUrl}/color-theme`);
    if (response.data.data) {
      const data = response.data.data.attributes;

      if (data.darkMode) {
        document.body.style.backgroundColor = "#333";
        document.body.style.color = "#fff";
      } else if (data.lightMode) {
        document.body.style.backgroundColor = "#fff";
        document.body.style.color = "#000";
      } else if (data.colorMode) {
        document.body.style.backgroundColor = "#76e0f5";
        document.body.style.color = "#333";
      }
    } else {
      console.error("No theme data found");
    }
  } catch (error) {
    console.error("Error fetching theme from Strapi:", error);
  }
}

colorTheme();

// Get books from API
let getBooksData = async (url) => {
  try {
    let response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching books data:", error);
    return null;
  }
};

// Load books and display on the page
let loadBooks = async () => {
  let booksData = await getBooksData(`${apiUrl}/books?populate=*`);
  if (booksData) {
    document.querySelector("#bookList").innerHTML = "";
    booksData.data.forEach((book) => {
      const coverUrl = book.attributes.cover?.data?.length
        ? `http://localhost:1337${book.attributes.cover.data[0].attributes.url}`
        : "http://localhost:1337/uploads/default_cover.jpg";

      document.querySelector("#bookList").innerHTML += `<li>
                        <h3>${book.attributes.title}</h3>
                        <p>Author: ${book.attributes.author}</p>
                        <p>Price: ${book.attributes.price} kr</p>
                        <p>Pages: ${book.attributes.pages}</p>
                        <p>Published: ${book.attributes.published_date}</p>
                        <div class="cover-container">
                        <img src="http://localhost:1337${book.attributes.cover.data[0].attributes.url}" alt="${book.attributes.title} cover">
                            </div>
                            <button class="add-to-list-btn" data-id="${book.id}">Add to my List</button>
                        </li>`;
    });

    document.querySelectorAll(".add-to-list-btn").forEach((button) => {
      button.addEventListener("click", addBookToReadingList);
    });
  } else {
    document.querySelector(
      "#bookList"
    ).innerHTML = `<li>Error loading books.</li>`;
  }
};

loadBooks();

// Inlogning
const loginUser = document.querySelector("#loginUser");
const loginPassword = document.querySelector("#loginPassword");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const myListBtn = document.querySelector("#myListBtn");
const openLoginBtn = document.querySelector("#openLoginBtn");
const openRegisterBtn = document.querySelector("#openRegisterBtn");
const closeLoginBtn = document.querySelector("#closeLoginBtn");
const backToAllBooksBtn = document.querySelector("#backToAllBooksBtn");

// Registration
const registerUsername = document.querySelector("#registerUsername");
const registerUserEmail = document.querySelector("#registerUserEmail");
const registerPassword = document.querySelector("#registerPassword");
const registerBtn = document.querySelector("#registerBtn");
const closeRegistrBtn = document.querySelector("#closeRegistrBtn");

closeLoginBtn.addEventListener("click", () => {
  document.querySelector("#inlogning-container").style.display = "none";
});
closeRegistrBtn.addEventListener("click", () => {
  document.querySelector("#inlogning-container").style.display = "none";
});
openLoginBtn.addEventListener("click", () => {
  document.querySelector("#inlogning-container").style.display = "block";
  document.querySelector("#login-section").style.display = "block";
  document.querySelector("#register-section").style.display = "none";
});

openRegisterBtn.addEventListener("click", () => {
  document.querySelector("#inlogning-container").style.display = "block";
  document.querySelector("#login-section").style.display = "none";
  document.querySelector("#register-section").style.display = "block";
});

let register = async () => {
  console.log("You are registered!");

  let response = await axios.post(`${apiUrl}/auth/local/register`, {
    username: registerUsername.value,
    email: registerUserEmail.value,
    password: registerPassword.value,
  });

  alert("Now, you can log in!");
  console.log(response);

  document.querySelector("#inlogning-container").style.display = "none";
  document.querySelector("#register-section").style.display = "none";
};

// Login axios
let login = async () => {
  let identifier = document.querySelector("#loginUser").value;
  let password = document.querySelector("#loginPassword").value;

  let response = await axios.post(`${apiUrl}/auth/local`, {
    identifier: identifier,
    password: password,
  });

  console.log(response.data);
  sessionStorage.setItem("token", response.data.jwt);
  sessionStorage.setItem("user", JSON.stringify(response.data.user));

  // Fetch and set user reading list after login
  let loggedInUser = await axios.get(`${apiUrl}/users/me?populate=deep,3`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  let user = response.data.user;
  user.readingList = loggedInUser.data.books.map((book) => book.id);
  sessionStorage.setItem("user", JSON.stringify(user));

  alert("You're logged in");

  document.querySelector("#inlogning-container").style.display = "none";
  document.querySelector("#login-section").style.display = "none";

  renderWindow();
  loadBooks();
};

// Logout function
let logout = async () => {
  sessionStorage.clear();
  renderWindow();
};

loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
logoutBtn.addEventListener("click", logout);
myListBtn.addEventListener("click", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  document.querySelector("#userName").innerText = user.username; // Set user's name
  document.querySelector("#welcome-page").style.display = "none";
  document.querySelector("#users-page").style.display = "block";
  document.querySelector("#logoutBtn").style.display = "none"; // Hide log out button
  document.querySelector("#backToAllBooksBtn").style.display = "block"; // Show back button
  renderUserBookList();
});

backToAllBooksBtn.addEventListener("click", () => {
  document.querySelector("#users-page").style.display = "none";
  document.querySelector("#welcome-page").style.display = "block";
  document.querySelector("#backToAllBooksBtn").style.display = "none"; // Hide back button
  document.querySelector("#logoutBtn").style.display = "block"; // Show log out button
});

// Check login status
let checkIfLogged = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return false;
  }

  try {
    await axios.get(`${apiUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Add book to the user's list or show alert if not logged in
const addBookToReadingList = async (event) => {
  if (!(await checkIfLogged())) {
    showAlert();
    return;
  }

  let bookId = event.target.getAttribute("data-id");
  let user = JSON.parse(sessionStorage.getItem("user"));
  if (!user.readingList) {
    user.readingList = [];
  }

  if (!user.readingList.includes(bookId)) {
    user.readingList.push(bookId);
    sessionStorage.setItem("user", JSON.stringify(user));
    alert("Book added to your reading list!");

    await updateUserReadingList(user);
  } else {
    alert("Book is already in your reading list!");
  }

  renderUserBookList(false);
};

// Update user's reading list in the backend
let updateUserReadingList = async (user) => {
  try {
    console.log("Updating reading list for user:", user.id, user.readingList);
    await axios.put(
      `${apiUrl}/users/${user.id}`,
      {
        books: user.readingList.map((id) => ({ id })),
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
  } catch (error) {
    console.error("Error updating reading list in the backend:", error);
  }
};

// Show an alert if the user is not logged in
const showAlert = () => {
  alert("You need to be registered or logged in!");
};

// Sort the user's book list
let sortUserBookList = (books, criterion) => {
  return books.sort((a, b) => {
    if (a[criterion] < b[criterion]) {
      return -1;
    }
    if (a[criterion] > b[criterion]) {
      return 1;
    }
    return 0;
  });
};

// Render user's book list
let renderUserBookList = async (sort = true) => {
  try {
    let user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) {
      console.error("No user found in session storage");
      return;
    }

    console.log(user.username, "logged in");

    let userBookListElement = document.querySelector("#userBookList");
    if (!userBookListElement) {
      console.error("#userBookList element not found in the DOM");
      return;
    }

    let response = await axios.get(`${apiUrl}/users/me?populate=deep,3`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    let loggedInUser = response.data;
    console.log(loggedInUser, "Logged In User Data");

    if (loggedInUser && loggedInUser.books && loggedInUser.books.length > 0) {
      userBookListElement.innerHTML = "";

      let books = loggedInUser.books;
      if (sort) {
        const sortCriterion = document.querySelector("#sorting-user").value;
        const sortField = sortCriterion === "titleSort" ? "title" : "author";
        books = sortUserBookList(books, sortField);
      }

      for (let book of books) {
        const coverUrl = book.cover?.length
          ? `http://localhost:1337${book.cover[0].url}`
          : "http://localhost:1337/uploads/default_cover.jpg";

        userBookListElement.innerHTML += `<li>
                                 <h3>${book.title}</h3>
                                 <p>Author: ${book.author}</p>
                                 <p>Pages: ${book.pages}</p>
                                 <p>Published: ${book.published_date}</p>
                                 <p>Price: ${book.price} kr</p>
                                 <p><img width="100" height="150" src="${coverUrl}" alt="${book.title} cover"></p>
                                 <button class="remove-from-list-btn" data-id="${book.id}">Remove</button>
                               </li>`;
      }

      document.querySelectorAll(".remove-from-list-btn").forEach((button) => {
        button.addEventListener("click", removeFromReadingList);
      });
    } else {
      userBookListElement.innerHTML =
        "<li>No books found in your reading list.</li>";
    }
  } catch (error) {
    console.error("Error rendering user book list:", error);
  }
};

// Add event listener for sorting
document.querySelector("#sorting-user").addEventListener("change", () => {
  renderUserBookList();
});

// Remove book from user's reading list
let removeFromReadingList = async (event) => {
  let bookId = event.target.getAttribute("data-id");
  let user = JSON.parse(sessionStorage.getItem("user"));

  user.readingList = user.readingList.filter((id) => id != bookId);
  sessionStorage.setItem("user", JSON.stringify(user));

  await updateUserReadingList(user);
  renderUserBookList(false);
};

// Render the window based on login status
let renderWindow = async () => {
  let loggedIn = await checkIfLogged();
  if (loggedIn) {
    document.querySelector("#inlogning-container").style.display = "none";
    document.querySelector("#welcome-page").style.display = "block";

    document.querySelector(
      "#welcome-page h2"
    ).innerText = `Welcome back here, ${
      JSON.parse(sessionStorage.getItem("user")).username
    }!`;

    document.querySelector("#logoutBtn").style.display = "block";
    document.querySelector("#myListBtn").style.display = "block";
    document.querySelector("#openLoginBtn").style.display = "none";
    document.querySelector("#openRegisterBtn").style.display = "none";
    document.querySelector("#backToAllBooksBtn").style.display = "none"; // Hide back button by default
  } else {
    document.querySelector("#inlogning-container").style.display = "none";
    document.querySelector("#welcome-page").style.display = "block";

    document.querySelector("#logoutBtn").style.display = "none";
    document.querySelector("#myListBtn").style.display = "none";
    document.querySelector("#openLoginBtn").style.display = "block";
    document.querySelector("#openRegisterBtn").style.display = "block";
    document.querySelector("#backToAllBooksBtn").style.display = "none"; // Hide back button by default
    document.querySelector("#welcome-page h2").innerText = "";
  }
};

renderWindow();
loadBooks();
