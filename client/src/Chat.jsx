import React, { useRef, useEffect } from "react";
import { TextField, Button } from '@mui/material'
import { Send } from '@mui/icons-material';
import './Chat.css'
import './font.css'

export default function Chat(props) {

  const renderChat = () => {
    return props.chat.map(({m_name, m_message, color}, index) => (
      <div key={index}>
        <h3>
          <span className="chat-msg-name" style={{color}}>{m_name}</span><span>: {m_message}</span>
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
    <Button className="HideChatBtn" onClick={props.OnHideChatClicked}>
      {HideChatBtnText(props.hideChat)}
    </Button>
    <div className={"Chat " + HideChatClass(props.hideChat)}>
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
  </div>
}

const AlwaysScrollToBottom = () => {
  const elementRef = useRef();
  useEffect(() => elementRef.current.scrollIntoView());
  return <div ref={elementRef} />;
};