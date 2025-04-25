import React from 'react';

const BookItem = ({ book }) => {
    return (
        <li>
            <h3>{book.title}</h3>
            <p>by {book.author}</p>
        </li>
    );
};

export default BookItem;
