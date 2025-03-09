import React from "react";
import { Card } from '@mui/material';
import './PlayerCard.css'
import './font.css'
import CapSymbol from "./CapSymbol"

function getClassName(active)
{
    return active ? "player-card active" : "player-card";
}

export default function PlayerCard(props) {
  const handleCapClick = (capinfo, destroyed) => {
    if (props.onCapClick && canClickCap(destroyed)) {
      props.onCapClick(capinfo.lat, capinfo.lng);
    }
  };

  const canClickCap = (destroyed) => {
    return props.my_board || destroyed;
  }

  return <div className={getClassName(props.curTurnActive)}>
    <Card className={"player-card-card " + props.color_class} variant="outlined">
      <h3 className="name">{ props.user.username }</h3>
      <div className="cap-div">
        {props.user.caps.map((cap, index) => (
            <div 
              key={index} 
              onClick={() => handleCapClick(cap.capinfo, cap.destroyed)}
              style={canClickCap(cap.destroyed) ? {cursor: 'pointer'} : {cursor: 'default'}}
              className={"cap-div-item"}
            >
              <CapSymbol capinfo={cap} css_color={props.css_color}/>
            </div>
        ))}
      </div>

    </Card>
      
  </div>
  }