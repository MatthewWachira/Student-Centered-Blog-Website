import React from 'react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-bar-container">
      <input
        className="search-bar-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search by title or author'}
        aria-label="Search blog posts"
      />
    </div>
  );
}
