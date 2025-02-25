import React, { useState } from "react";
import { Button } from '@mui/material'
import './RoomPage.css'
import './font.css'

export default function RoomPage(props) {
  const [copyText, setCopyText] = useState("Copy Room Link"); // State for button text

  const renderUsers = () => {
    return props.users.map(({id, username, room, caps}, index) => (
      <div key={index}>
        <h3>
          {username}
        </h3>
      </div>
    ))
  }

  const createRoomLink = () => {
    const baseUrl = window.location.origin;
    const roomLink = `${baseUrl}?room=${encodeURIComponent(props.room)}`; 
    return roomLink;
  }

  const handleCopyLink = async () => {
    const roomLink = createRoomLink();
    await navigator.clipboard.writeText(roomLink);
    setCopyText("Copied!");

    // Reset the button text after 2 seconds
    setTimeout(() => {
      setCopyText("Copy Room Link");
    }, 2000);
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
        color="error"
        onClick={props.OnLeaveRoom}>Leave</Button>
    </div>
    <div className="RoomLinkDiv">
      <Button
        variant="contained"
        color="secondary"
        onClick={handleCopyLink}
      >
        {copyText}
      </Button>
    </div>
  </div>
}