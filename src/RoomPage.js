import React from "react";
import Button from '@material-ui/core/Button'
import './RoomPage.css'
import './font.css'

export default function RoomPage(props) {

  const renderUsers = () => {
    return props.users.map(({id, username, room, caps}, index) => (
      <div key={index}>
        <h3>
          {username}
        </h3>
      </div>
    ))
  }

  return <div className="RoomPage">
    <h1>Room: {props.room}</h1>
    <h2>Players</h2>

    { renderUsers() }

    {props.isLeader &&
    <form className="RoomPageForm" onSubmit={props.OnStartGame}>
        <Button
        className="StartPageJoinBtn"
        variant="contained"
        color="primary"
        onClick={props.OnStartGame}>Start</Button>
    </form>
    }
    <div className="StartPageLeaveBtnDiv">
      <Button
        className="StartPageLeaveBtn"
        variant="contained"
        color="secondary"
        onClick={props.OnLeaveRoom}>Leave</Button>
    </div>
  </div>
}