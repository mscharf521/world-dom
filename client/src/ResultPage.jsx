import React from 'react'
import { Button } from '@mui/material'
import './ResultPage.css'
import './font.css'
import xmark from './assets/x-mark.png'

export const WIN = 0;
export const TIE = 1;
export const LOSE = 2;

export default function ResultPage(props) {

  return <div className="ResultPage">
    <h1 className="result">{GetResultText(props.result)}</h1>
    
    <div className="ResultPageHideBtn" 
        onClick={props.OnHide}>
      <img src={xmark} alt={"Close"}/>
    </div>
    
    <Button
        className="ResultPageLeaveBtn result-btn"
        variant="contained"
        color="error"
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