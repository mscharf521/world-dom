import React, { useRef, useEffect } from "react";
import { TextField, Button } from '@mui/material'
import './StartingPage.css'
import './font.css'

export default function StartingPage(props) {

  const infoRef = useRef();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      props.SetRoom(roomParam); // Set the room value from the query parameter
    }
  }, []);

  function HowToPlayOnClick()
  {
    if(infoRef)
    {
      infoRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  const onNameChange = (e) => {
    props.SetName(e.target.value)
  }
  const onRoomChange = (e) => {
    props.SetRoom(e.target.value)
  }

  return <div className="StartPage">
    <div className="StartPage-background">
      <div className="HomePage">
        <img className="logo" src={"/logo.png"} alt="World Domination"/>
        {false && <h1 className="title">WORLD DOMINATION</h1>}

        <form className="HomePageForm" onSubmit={props.OnSubmit}>
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
            className="HomePageJoinBtn"
            variant="contained"
            color="primary"
            onClick={props.OnSubmit}>JOIN</Button>
        </form>

        <a className='kofi-btn' href='https://ko-fi.com/Z8Z73V4Y6' target='_blank' rel="noopener noreferrer"><img height='36' style={{border:'0px', height:'36px'}} src='https://cdn.ko-fi.com/cdn/kofi1.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
      </div>
      <div className="HomeInfoPage">
        <div className="HowToPlayDiv InfoDiv" ref={infoRef}>
          <h1 className="HowToPlayTitle" onClick={HowToPlayOnClick}>How to Play</h1>
          <p className="HowToPlayText">The world is in the midst of a nuclear apocalypse. You lead one of the surviving nations which have been forced into 
            hiding by the nuclear threats of rivaling nations. Each nation is confined to their secret capital cities which are selected at the beginning 
            of the game. During your turn, you will select a position on the map to drop a nuclear bomb in an attempt to discover and destroy enemy capitals. 
            The last one standing wins.
            <br/><br/>
            BEWARE: <br/>You can bomb your own capital and multiple players may have the same capital city.
            <br/><br/>
            NOTE: <br/>The bigger your capitals are in population, the more bombs you start the game with.
          </p>
        </div>
        <div className="WaysToPlayDiv InfoDiv">
          <h1 className="HowToPlayTitle">Variations</h1>
          <p className="WaysToPlayText">
            There are many ways to play, but here are some ideas for making the game more interesting:
            <br/>
          </p>
          <ol className="WaysToPlayList">
              <li>On your turn, ask another player a "Yes or No" question in order to get a hint at where the capital cities are located.</li>
              <li>Restrict capital selection to a single country or continent and only use the smallest bombs.</li>
              <li>Add restrictions to what words may be use in questions.</li>
          </ol>
          <p className="WaysToPlayText">
            Get Creative!
            <br/>
          </p>
        </div>
        <div className="attributes">
          <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        </div>
      </div>
    </div>
  </div>
}
