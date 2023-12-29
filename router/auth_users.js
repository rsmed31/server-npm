const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Write code to check if the username is valid
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Write code to check if username and password match the one we have in records
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required for login" });
  }

  // Check if the user is registered
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Check if the provided credentials match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Sign a JWT and save it in the session
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken };

  return res.status(200).json({ message: "Login successful", accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { username } = jwt.verify(req.session.authorization.accessToken, "access");
  const isbn = req.params.isbn;
  const review = req.query.review;

  // Check if the review is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Find the book by ISBN
  const book = books[isbn];

  // Check if the book exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has already reviewed this book
  if (book.reviews && book.reviews[username]) {
    // Modify the existing review
    book.reviews[username] = review;
  } else {
    // Add a new review
    if (!book.reviews) {
      book.reviews = {};
    }
    book.reviews[username] = review;
  }

  return res.status(200).json({ message: "Review added or modified successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
