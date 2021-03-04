import React from "react";
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SendIcon from '@material-ui/icons/Send';
import './Chat.css'


export default function Chat(props) {

  const renderChat = () => {
    return props.chat.map(({m_name, m_message}, index) => (
      <div key={index}>
        <h3>
          {m_name}: <span>{m_message}</span>
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
    </div>

    
    <form onSubmit={props.OnSend} className="message-field">
      <TextField 
        className="message-text-field"
        name="message" 
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
