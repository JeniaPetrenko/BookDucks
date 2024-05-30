console.log("Test");

const apiUrl = "http://localhost:1337/api";

// Hämta färgen från Strapi och tillämpa den på webbsidan
async function colorTheme() {
  try {
    const response = await axios.get(`${apiUrl}/color-theme`);
    if (response.data.data) {
      const data = response.data.data.attributes;

      // Sätt bakgrund och textfärg baserat på vilken mode är aktiverad
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

// Anropa funktionen för att tillämpa inställningarna från Strapi när sidan laddas
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
    document.querySelector("#bookList").innerHTML = ""; // Очищуємо список перед завантаженням нових книг
    booksData.data.forEach((book) => {
      document.querySelector("#bookList").innerHTML += `<li>
                        <h3>${book.attributes.title}</h3>
                        <p>Author: ${book.attributes.author}</p>
                        <p>Price: ${book.attributes.price} kr</p>
                        <p>Pages: ${book.attributes.pages}</p>
                        <p>Published: ${book.attributes.published_date}</p>
                        <img width="100" height="150" src="http://localhost:1337${book.attributes.cover.data[0].attributes.url}" alt="${book.attributes.title} cover">
                        <button class="add-to-list-btn" data-id="${book.id}">Add to my List</button>
                        </li>`;
    });

    // Add event listeners for "Add to my List" buttons
    document.querySelectorAll(".add-to-list-btn").forEach((button) => {
      button.addEventListener("click", addBook);
    });
  } else {
    document.querySelector(
      "#bookList"
    ).innerHTML = `<li>Error loading books.</li>`;
  }
};

// Load books when the page loads
loadBooks();

// Load site settings from API
let loadSiteSettings = async () => {
  let response = await axios.get(`${apiUrl}/site-settings`);
  return response.data.data.attributes;
};

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

// Show/hide login and register sections
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

  // POST-request to api for registration of new user
  let response = await axios.post(`${apiUrl}/auth/local/register`, {
    username: registerUsername.value,
    email: registerUserEmail.value,
    password: registerPassword.value,
  });

  alert("Now, you can log in!");
  console.log(response);

  // Close the register section after successful registration
  document.querySelector("#inlogning-container").style.display = "none";
  document.querySelector("#register-section").style.display = "none";
};

// Login axios
let login = async () => {
  let identifier = document.querySelector("#loginUser").value;
  let password = document.querySelector("#loginPassword").value;

  let response = await axios.post("http://localhost:1337/api/auth/local", {
    identifier: identifier,
    password: password,
  });

  console.log(response.data);
  sessionStorage.setItem("token", response.data.jwt);
  sessionStorage.setItem("user", JSON.stringify(response.data.user));

  alert("You're logged in");

  // Close the login section after successful login
  document.querySelector("#inlogning-container").style.display = "none";
  document.querySelector("#login-section").style.display = "none";

  await renderWindow();
  await loadBooks(); // Додаємо виклик функції для завантаження всіх книг після логіна
};

// Logout button
let logout = async () => {
  sessionStorage.clear();
  await renderWindow();
  await loadBooks(); // Додаємо виклик функції для завантаження всіх книг після виходу
};

loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
logoutBtn.addEventListener("click", logout);
myListBtn.addEventListener("click", () => {
  document.querySelector("#welcome-page").style.display = "none";
  document.querySelector("#users-page").style.display = "block";
  renderUserBookList();
});
backToAllBooksBtn.addEventListener("click", () => {
  document.querySelector("#users-page").style.display = "none";
  document.querySelector("#welcome-page").style.display = "block";
});

// Check login status
let checkIfLogged = async () => {
  //return sessionStorage.getItem("token") ? true : false;
  let status;
  try {
    await axios.get(`${apiUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    status = true;
  } catch (error) {
    console.log(error);
    status = false;
  } finally {
    return status;
  }
};

// Function to add the book to the user's list or show alert if not logged in
const addBook = async (event) => {
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
  } else {
    alert("Book is already in your reading list!");
  }

  renderUserBookList();
};

// Function to show an alert if the user is not logged in
const showAlert = () => {
  alert("You need to be registered or logged in!");
};

// Function to render user's book list
let renderUserBookList = async () => {
  let user = JSON.parse(sessionStorage.getItem("user"));
  console.log(user, "logged in");

  if (user && user.readingList) {
    let userBookList = document.querySelector("#userBookList");
    userBookList.innerHTML = "";

    for (let bookId of user.readingList) {
      let bookData = await getBooksData(`${apiUrl}/books/${bookId}?populate=*`);
      let book = bookData.data;

      console.log(bookData);
      userBookList.innerHTML += `<li>
                               <h3>${book.attributes.title}</h3>
                               <p>Author: ${book.attributes.author}</p>
                               <p>Pages: ${book.attributes.pages}</p>
                               <p>Published: ${book.attributes.published_date}</p>
                               <p>Price: ${book.attributes.price} kr</p>
                               <p><img width="100" height="150" src="http://localhost:1337${book.attributes.cover.data[0].attributes.url}" alt="${book.attributes.title} cover"></p>
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
  let loggedIn = await checkIfLogged();
  if (loggedIn) {
    document.querySelector("#inlogning-container").style.display = "none";
    document.querySelector("#welcome-page").style.display = "block";
    // Встановлюємо текст тільки для залогінених користувачів
    document.querySelector(
      "#welcome-page h2"
    ).innerText = `Welcome back here, ${
      JSON.parse(sessionStorage.getItem("user")).username
    }!`;
    document.querySelector("#logoutBtn").style.display = "block";
    document.querySelector("#myListBtn").style.display = "block";
    // Очищаємо список книг перед завантаженням книг зі списку користувача
    document.querySelector("#bookList").innerHTML = "";
    // Завантажуємо книги зі списку користувача
    renderUserBookList();
  } else {
    document.querySelector("#inlogning-container").style.display = "none";
    document.querySelector("#welcome-page").style.display = "block";
    document.querySelector("#logoutBtn").style.display = "none";
    document.querySelector("#myListBtn").style.display = "none";
    // Очищаємо текст при виході з системи
    document.querySelector("#welcome-page h2").innerText = "";
  }
};

renderWindow();
loadBooks(); // Додаємо виклик функції для завантаження всіх книг при першому завантаженні сторінки
