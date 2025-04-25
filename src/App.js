// src/App.js
import React, { useState } from 'react';
import BookList from './components/BookList';
import AddBookForm from './components/AddBookForm';
import './App.css';

const App = () => {
    const [books, setBooks] = useState([
        { id: 1, title: 'Book 1', author: 'Author 1' },
        { id: 2, title: 'Book 2', author: 'Author 2' },
        { id: 3, title: 'Book 3', author: 'Author 3' }
    ]);

    const addBook = (book) => {
        setBooks([...books, { ...book, id: books.length + 1 }]);
    };

    return (
        <div className="App">
            <h1>Firebase Bookstore</h1>
            <AddBookForm onAddBook={addBook} />
            <BookList books={books} />
        </div>
    );
};

export default App;
