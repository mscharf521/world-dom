import React from "react";
import { Card } from '@mui/material';
import './PlayerCard.css'
import './font.css'
import CapSymbol from "./CapSymbol"

function getClassName(active)
{
    if(active)
    {
        return "player-card active"
    }
    else
    {
        return "player-card"
    }
}

export default function PlayerCard(props) {
  const handleCapClick = (capinfo) => {
    if (props.onCapClick) {
      props.onCapClick(capinfo.lat, capinfo.lng);
    }
  };

  return <div className={getClassName(props.curTurnActive)}>
    <Card className={"player-card-card " + props.color_class} variant="outlined">
      <h3 className="name">{ props.user.username }</h3>
      <div className="cap-div">
        {props.user.caps.map((cap, index) => (
            <div key={index} onClick={() => handleCapClick(cap.capinfo)}>
              <CapSymbol capinfo={cap} css_color={props.css_color}/>
            </div>
        ))}
      </div>

    </Card>
      
  </div>
  }