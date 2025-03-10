import React, { useState } from "react";
import { Button } from '@mui/material'
import './CityInfo.css'
import './font.css'
import earthflag from './assets/earthflag.png'
import CapSymbol from './CapSymbol'

//let dummycity = {
//  name: "st louis",
//  country_code: "US",
//  country: "USA",
//  pop: 10000
//}

export default function CityInfo(props) {
  function OnWikiClick() {
    let search_str = props.cityinfo.name
    if(props.cityinfo.country_code === "US")
    {
      //search_str = props.cityinfo.name + ", "
    }
    const url = "https://en.wikipedia.org/wiki/Special:Search?search=" + search_str
    window.open(url, "_blank")
  }

  function GetFlagSrc() {
    return "https://flagsapi.com/" + props.cityinfo.country_code.toUpperCase() + "/flat/64.png";
  }

  function OnFlagImgError(ev) {
    ev.target.onError = null;
    ev.target.className = "flag3";
    ev.target.src = earthflag
  }

  return <div className="city-info">
      <div className="top-div">
        
        <img className="flag" src={GetFlagSrc()} onError={OnFlagImgError} alt={"Country Flag"}></img>
        <h2 className="cityname">{ props.cityinfo.name }</h2>
        
        {props.cityinfo.isCapital && (
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <CapSymbol css_color="Black" />
          </div>
        )}
      </div>
      <h3 className="countryname">{ props.cityinfo.country }</h3>

      <h4 className="population">Population: {numberWithCommas(props.cityinfo.pop)}</h4>
      <div className="wiki-btn-div">
        <Button
          className="wiki-btn"
          variant="contained"
          color="primary"
          onClick={OnWikiClick}>
          WIKI
        </Button>
      </div>
      
  </div>
  }

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}