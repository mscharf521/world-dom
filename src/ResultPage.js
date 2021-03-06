import React from 'react'
import Button from '@material-ui/core/Button'
import './ResultPage.css'
import './font.css'

export const WIN = 0;
export const TIE = 1;
export const LOSE = 2;

export default function ResultPage(props) {

  return <div className="ResultPage">
    <h1 className="result">{GetResultText(props.result)}</h1>
    <Button
        className="ResultPageHideBtn result-btn"
        variant="contained"
        color="primary"
        onClick={props.OnHide}>Hide</Button>
    <Button
        className="ResultPageLeaveBtn result-btn"
        variant="contained"
        color="secondary"
        onClick={props.OnLeave}>Leave</Button>
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
        default:
          return "";
    }
}