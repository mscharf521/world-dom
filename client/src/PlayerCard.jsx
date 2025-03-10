import React from "react";
import { Card } from '@mui/material';
import './PlayerCard.css'
import './font.css'
import CapSymbol from "./CapSymbol"
import SpySymbol from "./SpySymbol";

function getClassName(active)
{
    return active ? "player-card active" : "player-card";
}

export default function PlayerCard(props) {
  const handleAssetClick = (lat, lng, destroyed) => {
    if (props.onCapClick && canClickAsset(destroyed)) {
      props.onCapClick(lat, lng);
    }
  };

  const canClickAsset = (destroyed) => {
    return props.my_board || destroyed;
  }

  return <div className={getClassName(props.curTurnActive)}>
    <Card className={"player-card-card " + props.color_class} variant="outlined">
      <h3 className="name">{ props.user.username }</h3>
      <div className="cap-div">
        {props.user.caps.map((cap, index) => (
            <div 
              key={index} 
              onClick={() => handleAssetClick(cap.capinfo.lat, cap.capinfo.lng, cap.destroyed)}
              style={canClickAsset(cap.destroyed) ? {cursor: 'pointer'} : {cursor: 'default'}}
              className={"cap-div-item"}
            >
              <CapSymbol css_color={cap.destroyed ? "Gray" : props.css_color}/>
            </div>
        ))}
        {props.user.spies.map((spy, index) => (
            <div 
              key={index} 
              onClick={() => handleAssetClick(spy.spyinfo.lat, spy.spyinfo.lng, spy.destroyed)}
              style={canClickAsset(spy.destroyed) ? {cursor: 'pointer'} : {cursor: 'default'}}
              className={"cap-div-item"}
            >
              <SpySymbol css_color={spy.destroyed ? "Grey" : props.css_color}/>
            </div>
        ))}
      </div>

    </Card>
      
  </div>
  }