console.log("Test");

// The base URL for the API This sets the base URL for the API.
const apiUrl = "http://localhost:1337/api";

// Function to apply the color theme from Strapi.
//This asynchronous function fetches the color theme settings from the Strapi
// API and applies them to the document body.
async function colorTheme() {
  try {
    // Fetch the color theme data from the API
    const response = await axios.get(`${apiUrl}/color-theme`);

    // Check if the response contains data
    //Depending on the theme (darkMode, lightMode, or colorMode), the corresponding class is added to the document body while removing the other classes.
    if (response.data.data) {
      const data = response.data.data.attributes;

      // Apply the dark mode theme
      if (data.darkMode) {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        document.body.classList.remove("color-mode");
      }
      // Apply the light mode theme
      else if (data.lightMode) {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        document.body.classList.remove("color-mode");
      }
      // Apply the custom color mode theme
      else if (data.colorMode) {
        document.body.classList.add("color-mode");
        document.body.classList.remove("dark-mode");
        document.body.classList.remove("light-mode");
      }
    } else {
      // Log an error if no theme data is found
      console.error("No theme data found");
    }
  } catch (error) {
    // Log an error if the request fails
    console.error("Error fetching theme from Strapi:", error);
  }
}
// Invoke the color theme function to apply the theme on page load
colorTheme();

// Get books from API
// Function to fetch books data from a given URL
//Declares an asynchronous function named getBooksData that takes a url parameter.

let getBooksData = async (url) => {
  //The try-catch block is used for error handling. If any errors occur within the try block, they will be caught and handled in the catch block.
  try {
    // Send a GET request to the provided URL using Axios
    //The await keyword is used to wait for the response from the API before continuing with the rest of
    let response = await axios.get(url);

    // Return the data from the response
    return response.data;
  } catch (error) {
    // Log an error message if the request fails
    console.error("Error fetching books data:", error);

    // Return null if an error occurs
    return null;
  }
};

// Load books and display on the page
let loadBooks = async () => {
  // Fetch books data from the API
  let booksData = await getBooksData(`${apiUrl}/books?populate=*`);
  if (booksData) {
    // Clear the list of books before appending new books to it
    document.querySelector("#bookList").innerHTML = "";
    // Loop through the books data and append each book to the list of books
    booksData.data.forEach((book) => {
      // Get the cover image URL from the book data
      const coverUrl = book.attributes.cover?.data?.length
        ? `http://localhost:1337${book.attributes.cover.data[0].attributes.url}`
        : "http://localhost:1337/uploads/default_cover.jpg";

      // Append the book data to the list of books
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
    // Listen for clicks on the "Add to my List" buttons
    document.querySelectorAll(".add-to-list-btn").forEach((button) => {
      button.addEventListener("click", addBookToReadingList);
    });
  } else {
    // Display an error message if no books data is found
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

// Add book to reading list
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

//
// Asynchronous function to handle user registration
let register = async () => {
  // Log a message to the console indicating the registration process
  console.log("You are registered!");

  // Send a POST request to the registration endpoint using Axios
  let response = await axios.post(`${apiUrl}/auth/local/register`, {
    // Pass the user input values for username, email, and password in the request body
    username: registerUsername.value,
    email: registerUserEmail.value,
    password: registerPassword.value,
  });

  // Alert the user that they can now log in
  alert("Now, you can log in!");

  // Log the response from the server to the console
  console.log(response);

  // Hide the registration form and the container
  document.querySelector("#inlogning-container").style.display = "none";
  document.querySelector("#register-section").style.display = "none";
};

// Login axios
// Asynchronous function to handle user login
let login = async () => {
  // Get the user input values for identifier (username/email) and password
  let identifier = document.querySelector("#loginUser").value;
  let password = document.querySelector("#loginPassword").value;

  // Send a POST request to the login endpoint using Axios
  let response = await axios.post(`${apiUrl}/auth/local`, {
    // Pass the user input values for identifier and password in the request body
    identifier: identifier,
    password: password,
  });

  // Log the response data from the server to the console
  console.log(response.data);

  // Store the JWT token and user data in session storage
  sessionStorage.setItem("token", response.data.jwt);
  sessionStorage.setItem("user", JSON.stringify(response.data.user));

  // Fetch and set user reading list after login
  let loggedInUser = await axios.get(`${apiUrl}/users/me?populate=deep,3`, {
    // Pass the JWT token in the Authorization header
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  // Get the user data from the response and update the reading list
  let user = response.data.user;
  user.readingList = loggedInUser.data.books.map((book) => book.id);
  sessionStorage.setItem("user", JSON.stringify(user));

  // Alert the user that they are logged in
  alert("You're logged in");

  // Hide the login container and section from view
  document.querySelector("#inlogning-container").style.display = "none";
  document.querySelector("#login-section").style.display = "none";

  // Call functions to render the window and load books
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
  // Check if there is a token in session storage
  const token = sessionStorage.getItem("token");
  if (!token) {
    return false;
  }

  try {
    // Send a GET request to the /users/me endpoint with the token in the Authorization header
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
  // Check if there is a token in session storage
  if (!(await checkIfLogged())) {
    showAlert();
    return;
  }

  // Get the book ID from the button's data-id attribute
  let bookId = event.target.getAttribute("data-id");
  // Get the user data from session storage
  let user = JSON.parse(sessionStorage.getItem("user"));
  // Check if the user has a readingList property
  if (!user.readingList) {
    // If not, create an empty array for the user's reading list
    user.readingList = [];
  }

  // Check if the user's reading list already includes the book ID
  if (!user.readingList.includes(bookId)) {
    // If not, add the book ID to the user's reading list and save it in session storage
    user.readingList.push(bookId);
    // Save the updated user data in session storage
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
  // Get the user data from session storage
  try {
    console.log("Updating reading list for user:", user.id, user.readingList);
    // Send a PUT request to the /users/:id endpoint with the user's reading list in the request body and the token in the Authorization header
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
  // Sort the books based on the given criterion
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
  // Get the user data from session storage
  try {
    let user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) {
      // If there is no user data in session storage, return
      console.error("No user found in session storage");
      return;
    }

    console.log(user.username, "logged in");

    // Get the user's reading list from the user data
    let userBookListElement = document.querySelector("#userBookList");
    // Check if the #userBookList element exists in the DOM
    if (!userBookListElement) {
      console.error("#userBookList element not found in the DOM");
      return;
    }

    // Send a GET request to the /users/me endpoint with the token in the Authorization header
    let response = await axios.get(`${apiUrl}/users/me?populate=deep,3`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    // Get the user data from the response and store it in the loggedInUser variable
    let loggedInUser = response.data;
    console.log(loggedInUser, "Logged In User Data");

    // Check if the user has a readingList property
    if (loggedInUser && loggedInUser.books && loggedInUser.books.length > 0) {
      // Get the user's reading list from the user data
      userBookListElement.innerHTML = "";

      // Get the user's reading list from the user data
      let books = loggedInUser.books;
      // Sort the books based on the given criterion
      if (sort) {
        const sortCriterion = document.querySelector("#sorting-user").value;
        const sortField = sortCriterion === "titleSort" ? "title" : "author";
        books = sortUserBookList(books, sortField);
      }

      // Loop through the books in the user's reading list and add them to
      //the #userBookList element in the DOM
      for (let book of books) {
        // Get the cover image URL for the book
        const coverUrl = book.cover?.length
          ? `http://localhost:1337${book.cover[0].url}`
          : "http://localhost:1337/uploads/default_cover.jpg";

        userBookListElement.innerHTML += `<li>
                                 <h3>${book.title}</h3>
                                 <p>Author: ${book.author}</p>
                                 <p>Pages: ${book.pages}</p>
                                 <p>Published: ${book.published_date}</p>
                                 <p>Price: ${book.price} kr</p>
                                   <div class="cover-container">
                                   <img src="${coverUrl}" alt="${book.title} cover">
                                     </div>
                                 <button class="remove-from-list-btn" data-id="${book.id}">Remove</button>
                               </li>`;
      }

      document.querySelectorAll(".remove-from-list-btn").forEach((button) => {
        button.addEventListener("click", removeFromReadingList);
      });
    } else {
      // If the user has no books in their reading list,
      //display a message in the #userBookList element in the DOM
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

  // Check if the user has a readingList property
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
