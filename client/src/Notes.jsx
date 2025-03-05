import React, { useState } from 'react';
import './Notes.css';
import './MultiUseInfo.css';
import './font.css';

export default function Notes(props) {
  const [notes, setNotes] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue = notes.substring(0, selectionStart) + '\n• ' + notes.substring(selectionEnd);
      setNotes(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 3;
      }, 0);
    }
  };

  const handleChange = (e) => {
    setNotes(e.target.value);
  };

  const handleFocus = (e) => {
    if (notes.trim() === '') {
      setNotes('• ');
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = 2;
      }, 0);
    }
  };

  return (
    <div className={"NotesPopup MultiUsePopup " + (props.hide ? "MultiUsePopupHide" : "MultiUsePopupShow")}>
      <textarea
        className='NotesTextArea'
        placeholder="Keep notes..."
        value={notes}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />
    </div>
  );
}