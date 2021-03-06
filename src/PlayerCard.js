import React from "react";
import Card from '@material-ui/core/Card';
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

  return <div className={getClassName(props.curTurnActive)}>
    <Card className={"player-card-card " + props.color_class} variant="outlined">
      <h3 className="name">{ props.user.username }</h3>
      <div className="cap-div">
        {props.user.caps.map((cap, index) => (
            <CapSymbol key={index} capinfo={cap} css_color={props.css_color}/>
        ))}
      </div>

    </Card>
      
  </div>
  }