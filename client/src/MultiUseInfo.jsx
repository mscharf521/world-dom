import React, { useRef, useEffect, useState } from "react";
import { Button } from '@mui/material'
import RoomSettingsPopup from "./RoomSettingsPopup";
import Chat from "./Chat";
import './MultiUseInfo.css'
import Notes from "./Notes";

const ANIMATION_DURATION_MS = 250;

export default function MultiUseInfo(props) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hideChat, SetHideChat] = useState(true);
  const [hideRoomSettings, setHideRoomSettings] = useState(true);
  const [hideNotes, setHideNotes] = useState(true);

  useEffect(() => {
    if (props.chat.length > 0 && hideChat) {
      setUnreadMessages(prev => prev + 1);
    }
  }, [props.chat]);

  const isAnythingElseOpen = (window) => {
    return window != "Chat" && !hideChat 
    || window != "Settings" && !hideRoomSettings
    || window != "Notes" && !hideNotes;
  };

  const toggle = (window) => {
    setTimeout(() => {
      switch (window) {
        case "Chat":
          SetHideChat(!hideChat);
          break;
        case "Settings":
          setHideRoomSettings(!hideRoomSettings);
          break;
        case "Notes":
          setHideNotes(!hideNotes);
          break;
      }
    }, isAnythingElseOpen(window) ? ANIMATION_DURATION_MS : 0);

    if (window != "Chat") {
      SetHideChat(true);
    }
    if (window != "Settings") {
      setHideRoomSettings(true);
    }
    if (window != "Notes") {
      setHideNotes(true);
    }
  };

  const handleChatButtonClick = () => {
    setUnreadMessages(0);
    toggle("Chat");
  };

  const handleRoomSettingsButtonClick = () => {
    SetHideChat(true);
    toggle("Settings");
  };

  const handleNotesButtonClick = () => {
    SetHideChat(true);
    toggle("Notes");
  };

  return <div className="MultiUseInfoWrapper">
    <Button 
      variant="contained"
      onClick={handleChatButtonClick}
      style={{ position: 'relative', backgroundColor: hideChat ? "#435151" : "#634146", marginRight: '10px' }}
    >
      Chat
      {unreadMessages > 0 && (
        <div className="notif">
          {unreadMessages}
        </div>
      )}
    </Button>
    <Button 
      variant="contained"
      onClick={handleRoomSettingsButtonClick}
      style={{ position: 'relative', backgroundColor: hideRoomSettings ? "#435151" : "#634146", marginRight: '10px' }}
    >
      Settings
    </Button>
    <Button 
      variant="contained"
      onClick={handleNotesButtonClick}
      style={{ position: 'relative', backgroundColor: hideNotes ? "#435151" : "#634146", marginRight: '10px' }}
    >
      Notes
    </Button>
    <Chat 
      chat={props.chat} 
      hide={hideChat} 
      message={props.message} 
      SetMessage={props.SetMessage} 
      OnSend={props.OnSend} 
      setUnreadMessages={setUnreadMessages}
    />
    <RoomSettingsPopup hide={hideRoomSettings} settings={props.settings} />
    <Notes hide={hideNotes} />
  </div>
}