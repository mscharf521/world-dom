import React from "react";
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card';
import './CityInfo.css'


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

  return <div className="city-info">
    <Card className="city-info-card" variant="outlined">
      <div className="top-div">
        <img src={"https://www.countryflags.io/" + props.cityinfo.country_code.toLowerCase() + "/flat/64.png"} alt={props.cityinfo.country}></img>
        <h2 className="cityname">{ props.cityinfo.name }</h2>
      </div>
      <h3 className="countryname">{ props.cityinfo.country }</h3>

      <h4 className="population">Population: {numberWithCommas(props.cityinfo.pop)}</h4>
      <div className="wiki-btn">
        <Button
          variant="contained"
          color="primary"
          onClick={OnWikiClick}>
          WIKI
        </Button>
      </div>
    </Card>
      
  </div>
  }

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}