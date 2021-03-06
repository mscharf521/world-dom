import React, { useRef, useEffect } from "react";
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SendIcon from '@material-ui/icons/Send';
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

  const onTextChange = (e) => {
    props.SetMessage(e.target.value)
  }

  return <div className="Chat">
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
        <SendIcon/>
      </Button>
    </form>
  </div>
}

const AlwaysScrollToBottom = () => {
  const elementRef = useRef();
  useEffect(() => elementRef.current.scrollIntoView());
  return <div ref={elementRef} />;
};