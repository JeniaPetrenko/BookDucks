console.log("Test");

const apiUrl = "http://localhost:1337/api";

// Get books from API
let getBooksData = async (url) => {
  let response = await axios.get(url);
  return response.data;
};

// Load books and display on the page
let loadBooks = async () => {
  let booksData = await getBooksData(`${apiUrl}/books?populate=*`);
  console.log(booksData);

  booksData.data.forEach((book) => {
    document.querySelector("#bookList").innerHTML += `<li>
                      <h3>${book.attributes.title}</h3>
                      <p>Author: ${book.attributes.author}</p>
                      <p>Price: ${book.attributes.price} kr</p>
                      <p>Pages: ${book.attributes.pages}</p>
                      <p>Published: ${book.attributes.published_date}</p>
                      <img width="100" src="http://localhost:1337${book.attributes.cover.data[0].attributes.url}" alt="${book.attributes.title} cover">
                    <button class="add-to-list-btn" data-id="${book.id}">Add to my List</button>
                      </li>`;
  });
  // Add event listeners for "Add to List" buttons
  document.querySelectorAll(".add-to-list-btn").forEach((button) => {
    button.addEventListener("click", addBook);
  });
};

// Load books when the page loads
loadBooks();

//Inlogning
const loginUser = document.querySelector("#loginUser");
const loginPassword = document.querySelector("#loginPassword");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");

//Registration
const registerUsername = document.querySelector("#registerUsername ");
const registerUserEmail = document.querySelector("#registerUserEmail");
const registerPassword = document.querySelector("#registerPassword");
const registerBtn = document.querySelector("#registerBtn");

let register = async () => {
  console.log("You are registered!");

  //POST-request to api for registration of new user
  let response = await axios.post(
    "http://localhost:1337/api/auth/local/register",
    {
      username: registerUsername.value,
      email: registerUserEmail.value,
      password: registerPassword.value,
    }
  );

  alert("Now, you can logg in!");
  console.log(response);
};

//inlogning axiox
let login = async () => {
  let response = await axios.post("http://localhost:1337/api/auth/local", {
    identifier: loginUser.value,
    password: loginPassword.value,
  });

  console.log(response.data);
  sessionStorage.setItem("token", response.data.jwt);
  sessionStorage.setItem("user", JSON.stringify(response.data.user));

  alert("You're inlogged");
  console.log("Logged in!");

  renderWindow();
};

//logout button
let logout = async () => {
  sessionStorage.clear();
  renderWindow();
};

loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
logoutBtn.addEventListener("click", logout);

// Check login status
let checkifLogged = () => {
  return sessionStorage.getItem("token") ? true : false;
};

// Function to add the book to usersList
let addBook = (event) => {
  let bookId = event.target.getAttribute("data-id");
  let user = JSON.parse(sessionStorage.getItem("user"));
  if (!user.readingList) {
    user.readingList = [];
  }

  if (!user.readingList.includes(bookId)) {
    user.readingList.push(bookId);
    sessionStorage.setItem("user", JSON.stringify(user));
    alert("Book added to your reading list!");
  } else {
    alert("Book is already in your reading list!");
  }

  renderUserBookList();
};

// Function to render user's book list
let renderUserBookList = async () => {
  let user = JSON.parse(sessionStorage.getItem("user"));

  if (user && user.readingList) {
    let userBookList = document.querySelector("#userBookList");
    userBookList.innerHTML = "";

    for (let bookId of user.readingList) {
      let bookData = await getBooksData(`${apiUrl}/books/${bookId}?populate=*`);
      let book = bookData.data;

      userBookList.innerHTML += `<li>
                               <h3>${book.attributes.title}</h3>
                               <p>Author: ${book.attributes.author}</p>
                               <button class="remove-from-list-btn" data-id="${book.id}">Remove</button>
                             </li>`;
    }

    // Add event listeners for "Remove" buttons
    document.querySelectorAll(".remove-from-list-btn").forEach((button) => {
      button.addEventListener("click", removeFromReadingList);
    });
  }
};

// Function to remove book from user's reading list
let removeFromReadingList = (event) => {
  let bookId = event.target.getAttribute("data-id");
  let user = JSON.parse(sessionStorage.getItem("user"));

  user.readingList = user.readingList.filter((id) => id != bookId);
  sessionStorage.setItem("user", JSON.stringify(user));

  renderUserBookList();
};

// Render the window based on login status
let renderWindow = async () => {
  let loggedIn = checkifLogged();
  if (loggedIn) {
    document.querySelector("#inlogning-container").style.display = "none";
    document.querySelector("#users-page").style.display = "block";
    document.querySelector("#users-page h2").innerText = `Welcome back here, ${
      JSON.parse(sessionStorage.getItem("user")).username
    }!`;
    document.querySelector("#logoutBtn").style.display = "block";
  } else {
    document.querySelector("#inlogning-container").style.display = "block";
    document.querySelector("#users-page").style.display = "block";
    document.querySelector("#logoutBtn").style.display = "none";
  }
};

renderWindow();
