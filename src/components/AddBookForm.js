import React, { useState } from 'react';

const AddBookForm = ({ onAddBook }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddBook({ title, author });
        setTitle('');
        setAuthor('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder="Book Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
            />
            <input 
                type="text" 
                placeholder="Author Name" 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)} 
                required
            />
            <button type="submit">Add Book</button>
        </form>
    );
};

export default AddBookForm;
