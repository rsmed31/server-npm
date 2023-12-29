const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;


const public_users = express.Router();

public_users.get('/', async function (req, res) {
  try {
    const booksResponse = await axios.get('http://api.example.com/books'); // Replace with your actual API endpoint

    // Assuming the response contains the list of books
    const bookList = booksResponse.data;

    return res.status(200).json({ books: bookList });
  } catch (error) {
    console.error('Error fetching book list:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    // Make an HTTP request to the book details API endpoint
    const bookDetailsResponse = await axios.get(`http://api.example.com/books/${isbn}`); // Replace with your actual API endpoint

    // Assuming the response contains the book details
    const bookDetails = bookDetailsResponse.data;

    return res.status(200).json({ book: bookDetails });
  } catch (error) {
    console.error(`Error fetching book details for ISBN ${isbn}:`, error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required for registration" });
  }

  // Check if the username already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists, please choose another username" });
  }

  // Add the new user to the users array
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});





// Function to find a book by ISBN
function findBookByISBN(isbn) {
  const bookId = parseInt(isbn); // Convert the ISBN to a number
  const book = books[bookId]; // Attempt to find the book by ID

  return book || null; // Return the book if found, otherwise null
}

  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Make an HTTP request to the books by author API endpoint
    const booksByAuthorResponse = await axios.get(`http://api.example.com/books?author=${author}`); // Replace with your actual API endpoint

    // Assuming the response contains the list of books by the specified author
    const booksByAuthor = booksByAuthorResponse.data;

    return res.status(200).json({ books: booksByAuthor });
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Function to find books by author
function findBooksByAuthor(author) {
  const booksByAuthor = [];

  for (const bookId in books) {
    if (books.hasOwnProperty(bookId)) {
      const book = books[bookId];
      if (book.author === author) {
        booksByAuthor.push(book);
      }
    }
  }

  return booksByAuthor;
}


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    // Make an HTTP request to the books by title API endpoint
    const booksByTitleResponse = await axios.get(`http://api.example.com/books?title=${title}`); // Replace with your actual API endpoint

    // Assuming the response contains the list of books by the specified title
    const booksByTitle = booksByTitleResponse.data;

    return res.status(200).json({ books: booksByTitle });
  } catch (error) {
    console.error(`Error fetching books by title ${title}:`, error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Function to find books by title
function findBooksByTitle(title) {
  const booksByTitle = [];

  for (const bookId in books) {
    if (books.hasOwnProperty(bookId)) {
      const book = books[bookId];
      if (book.title.toLowerCase().includes(title.toLowerCase())) {
        booksByTitle.push(book);
      }
    }
  }

  return booksByTitle;
}




// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Get the ISBN from the request parameters
  const book = findBookByISBN(isbn); // Call a function to find the book by ISBN

  if (book && book.reviews) {
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "No reviews found for the provided ISBN" });
  }
});


module.exports.general = public_users;
