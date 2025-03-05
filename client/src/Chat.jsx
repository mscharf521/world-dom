import React, { useRef, useEffect, useState } from "react";
import { TextField, Button } from '@mui/material'
import { Send } from '@mui/icons-material';
import './MultiUseInfo.css'
import './Chat.css'
import './font.css'

export default function Chat(props) {
  useEffect(() => {
    if (props.chat.length > 0 && props.hide) {
      props.setUnreadMessages(prev => prev + 1);
    }
  }, [props.chat]);

  const renderChat = () => {
    return props.chat.map(({username, message, color}, index) => (
      <div key={index}>
        <h3>
          <span className="chat-msg-name" style={{color}}>{username}</span><span>: {message}</span>
        </h3>
      </div>
    ))
  }

  const onTextChange = (e) => {
    props.SetMessage(e.target.value)
  }

  return <div className={"ChatPopup MultiUsePopup " + (props.hide ? "MultiUsePopupHide" : "MultiUsePopupShow")}>
    <div className='render-chat'>
      {renderChat()}
      <AlwaysScrollToBottom />
    </div>
    
    <form onSubmit={props.OnSend} className="message-field">
      <TextField 
        className="message-text-field"
        name="message"
        autoComplete='off'
        onChange={e => onTextChange(e)}
        value={props.message}
        label="Message"
        variant="outlined"/>
      <Button
        variant="contained"
        color="primary"
        onClick={props.OnSend}
      >
        <Send/>
      </Button>
    </form>
  </div>
}

const AlwaysScrollToBottom = () => {
  const elementRef = useRef();
  useEffect(() => elementRef.current.scrollIntoView());
  return <div ref={elementRef} />;
};