import React, { useRef, useEffect, useState } from "react";
import { TextField, Button } from '@mui/material'
import { Send } from '@mui/icons-material';
import './Chat.css'
import './font.css'

export default function Chat(props) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hideChat, SetHideChat] = useState(true);

  useEffect(() => {
    if (props.chat.length > 0 && hideChat) {
      setUnreadMessages(prev => prev + 1);
    }
  }, [props.chat]);

  const handleChatButtonClick = () => {
    setUnreadMessages(0);
    SetHideChat(!hideChat);
  };

  const renderChat = () => {
    return props.chat.map(({username, message, color}, index) => (
      <div key={index}>
        <h3>
          <span className="chat-msg-name" style={{color}}>{username}</span><span>: {message}</span>
        </h3>
      </div>
    ))
  }

  const HideChatClass = (hide) => {return (hide ? "ChatHide" : "ChatShow")}
  const HideChatBtnText = (hide) => {return (hide ? "Show Chat" : "Hide Chat")}

  const onTextChange = (e) => {
    props.SetMessage(e.target.value)
  }

  return <div className="ChatWrapper">
    <Button 
      variant="contained"
      onClick={handleChatButtonClick}
      style={{ position: 'relative', backgroundColor: hideChat ? "#435151" : "#634146" }}
    >
      {HideChatBtnText(hideChat)}
      {unreadMessages > 0 && (
        <div className="notif">
          {unreadMessages}
        </div>
      )}
    </Button>
    {!hideChat && <div className={"Chat " + HideChatClass(props.hideChat)}>
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
    </div>}
  </div>
}

const AlwaysScrollToBottom = () => {
  const elementRef = useRef();
  useEffect(() => elementRef.current.scrollIntoView());
  return <div ref={elementRef} />;
};