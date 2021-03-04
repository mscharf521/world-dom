import React from 'react'
import Button from '@material-ui/core/Button'
import './ResultPage.css'


export const WIN = 0;
export const TIE = 1;
export const LOSE = 2;

export default function ResultPage(props) {

  const onNameChange = (e) => {
    props.SetName(e.target.value)
  }
  const onRoomChange = (e) => {
    props.SetRoom(e.target.value)
  }

  return <div className="ResultPage">
    <h1 className="result">{GetResultText(props.result)}</h1>

  </div>
}

function GetResultText(result)
{
    switch(result)
    {
        case WIN:
            return "You Win!";
        case TIE:
            return "It's a Draw";
        case LOSE:
            return "You Lost";
    }
}