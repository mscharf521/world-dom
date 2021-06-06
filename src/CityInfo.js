import React, { useState } from "react";
import Button from '@material-ui/core/Button'
import './CityInfo.css'
import './font.css'


//let dummycity = {
//  name: "st louis",
//  country_code: "US",
//  country: "USA",
//  pop: 10000
//}

export default function CityInfo(props) {

  const [flagErrorCnt, SetFlagErrorCnt] = useState(0);

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
    return "https://www.countryflags.io/" + props.cityinfo.country_code.toLowerCase() + "/flat/64.png";
  }

  function OnFlagImgError(ev) {
    if(flagErrorCnt === 0)
    {
      console.log("here")
      SetFlagErrorCnt(1);
      ev.target.className = "flag2";
      ev.target.src = "https://flagcdn.com/256x192/" + props.cityinfo.country_code.toLowerCase() + ".png";
    }
    else // second time erroring so set to error flag
    {
      ev.target.onError = null;
      ev.target.className = "flag3";
      ev.target.src = process.env.PUBLIC_URL + '/earthflag.png'
    }
  }

  return <div className="city-info">
      <div className="top-div">
        
        <img className="flag" src={GetFlagSrc()} onError={OnFlagImgError} alt={"Country Flag"}></img>
        <h2 className="cityname">{ props.cityinfo.name }</h2>
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