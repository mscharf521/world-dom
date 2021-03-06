import React from "react";
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import './StartingPage.css'
import './font.css'

export default function StartingPage(props) {

  const onNameChange = (e) => {
    props.SetName(e.target.value)
  }
  const onRoomChange = (e) => {
    props.SetRoom(e.target.value)
  }

  return <div className="StartPage">
    <h1 className="title">WORLD DOMINATION</h1>

    <form className="StartPageForm" onSubmit={props.OnSubmit}>
      <TextField 
        name="name"
        autoComplete='off' 
        onChange={e => onNameChange(e)}
        value={props.name}
        label="Name"/>
      <TextField 
        name="room"
        autoComplete='off'
        onChange={e => onRoomChange(e)}
        value={props.room}
        label="Room"/>
      <Button
        className="StartPageJoinBtn"
        variant="contained"
        color="primary"
        onClick={props.OnSubmit}>JOIN</Button>
    </form>
  </div>
}
