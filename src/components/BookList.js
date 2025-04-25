import React from 'react';
import BookItem from './BookItem';

const BookList = () => {
    const books = [
        { id: 1, title: 'Book 1', author: 'Author 1' },
        { id: 2, title: 'Book 2', author: 'Author 2' },
        { id: 3, title: 'Book 3', author: 'Author 3' }
    ];

    return (
        <div>
            <h2>Book List</h2>
            <ul>
                {books.map(book => (
                    <BookItem key={book.id} book={book} />
                ))}
            </ul>
        </div>
    );
};

export default BookList;
