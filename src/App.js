import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client"
import Button from '@material-ui/core/Button'
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import {
  GoogleMap,
  useLoadScript,
  Circle,
  Marker
} from "@react-google-maps/api"

import CityInfo from "./CityInfo";
import Chat from './Chat'
import StartingPage from './StartingPage'
import RoomPage from './RoomPage'
import ResultPage, { WIN, TIE, LOSE } from './ResultPage'
import PlayerCard from './PlayerCard'
import './App.css'
import './font.css'

import { cap_path } from "./CapSymbol"
import { GetColorBackgroundClass, GetCSSColor, COLOR_CNT } from "./PlayerColors"

const socket = io.connect('http://localhost:4000')
//const socket = io.connect('https://world-dom-backend.herokuapp.com/')

const start_zoom = 2;//10;
const mapContainerStyle = {
  width: "100vw",
  height: "100vh"
}
const center = {
    lat: 0,//lat: 38.6270,
    lng: 0,//lng: -90.1994,
}

const options = {
  disableDefaultUI: true,
  zoomControl: true,
}

const PREGAME = 0;
const CAPSEL = 1;
const GAME = 2;

let game_state = PREGAME; 
let cap_count = 0;
let cap_buffer = [];
let is_my_turn = false;

const bomb_datas = [
  {rad: 30000,   text:"1 megaton",  base_cnt: 9999, bonus_per: 0        },
  {rad: 100000,  text:"5 megaton",  base_cnt: 15,   bonus_per: 100000   },
  {rad: 500000,  text:"10 megaton", base_cnt: 8,    bonus_per: 1000000  },
  {rad: 1000000, text:"50 megaton", base_cnt: 4,    bonus_per: 10000000 }
];

let player_colors = [];

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if(loadError) console.log(loadError);

  const [showStartPage, SetShowStartPage] = useState(true);
  const [showRoomPage, SetShowRoomPage] = useState(false);
  const [ResultPageData, SetResultPageData] = useState({show:false, result:null});
  //const [ResultPageData, SetResultPageData] = useState({show:true, result:WIN});
  const [showSelCapBtn, SetShowSelCapBtn] = useState(false);
  const [showSelCityInfo, SetShowSelCityInfo] = useState(false);
  const [showSelCityMarker, SetShowSelCityMarker] = useState(false);
  const [showLaunchBtn, SetShowLaunchBtn] = useState(false);
  const [showBombBtns, SetShowBombBtns] = useState(false);
  const [InfoText, SetInfoText] = useState({show: false, text:""})
  //const [InfoText, SetInfoText] = useState({show: true, text:"Select 3 Capital Cities"})

  const [mapZoom, SetMapZoom] = useState(start_zoom);

  const [name, SetName] = useState("");
  const [room, SetRoom] = useState("");
  const [isLeader, SetIsLeader] = useState(false);
  const [users, SetUsers] = useState([]);
  //const [users, SetUsers] = useState([{id:"1234-56789", username:"Name", room:"this-Room", caps:[{},{},{}, {}, {}, {}]}]);
  const [bombs, SetBombs] = useState([]);
  const [curTurnID, SetCurTurnID] = useState("");
  //const [curTurnID, SetCurTurnID] = useState("1234-56789");
  const [bombCount, SetBombCount] = useState([]);

  const [preBomb, SetPreBomb] = useState(null);
  const [selectedCity, SetSelectedCity] = useState({});

  const [chat, SetChat] = useState([]);
  const [message, SetMessage] = useState("");

  function SetStartState()
  {
    game_state = PREGAME; 
    cap_count = 0;
    cap_buffer = [];
    is_my_turn = false;
    player_colors = [];

    SetShowStartPage(true);
    SetShowRoomPage(false);
    SetResultPageData({show: false, result: null})
    SetShowSelCapBtn(false);
    SetShowSelCityInfo(false);
    SetShowSelCityMarker(false);
    SetShowLaunchBtn(false);
    SetShowBombBtns(false);

    SetMapZoom(start_zoom);

    SetRoom("");
    SetIsLeader(false);
    SetUsers([]);
    SetBombs([]);
    SetCurTurnID("");
    SetBombCount([]);

    SetPreBomb(null);
    SetSelectedCity({});
    SetChat([]);
    SetMessage("");
  }

  useEffect(() => {
    socket.on('connect_error', function(){
      console.log('Connection Failed');
    })

    socket.on('message', ({m_name, m_message, fromID}) => {
      SetChat((current) => ([...current, { m_name, m_message, color:GetCSSColor( GetPlayerColorIdx(fromID) ) }]))
    })

    socket.on('joined-room-result', ({success, leader}) => {
      if( success )
      {
        SetShowRoomPage(true);
        SetShowStartPage(false);
        SetIsLeader(leader);
      }
      else
      {
        console.log("failed to join room")
      }
    })

    socket.on('start-game', ({num_caps}) => {
      // start game
      SetShowStartPage(false);
      SetShowRoomPage(false);
      game_state = CAPSEL;
      cap_count = num_caps;
      SetInfoText({show:true, text:"Select " + num_caps + " Capital Cit" + ( (num_caps > 1) ? "ies" : "y")})
    })

    socket.on('room-users', ({users}) => {
      SetUsers(users);
    })

    socket.on('bomb-update', ({bombs}) => {
      SetBombs(bombs);
    })

    socket.on('next-turn', ({userID}) => {
      if(game_state === CAPSEL)
      {
        game_state = GAME;
        SetInfoText({show: false, text:""})
      }

      SetCurTurnID(userID);

      if(userID === socket.id) // my turn
      {
        is_my_turn = true;
        SetPreBomb((current) => ({center:null, radius:bomb_datas[0].rad}))
        SetShowBombBtns(true);
      }
      
    })

    socket.on('win', () => {
      if(game_state === GAME)
      {
        SetResultPageData({show:true, result:WIN});
      }
    })

    socket.on('tie', () => {
      if(game_state === GAME)
      {
        SetResultPageData({show:true, result:TIE});
      }
    })

    socket.on('lose', () => {
      if(game_state === GAME)
      {
        SetResultPageData({show:true, result:LOSE});
      }
    })

  }, [])

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((e) => {

    let search_radius = GetSearchRadiusFromZoom(mapRef.current.zoom)
    //console.log(search_radius)
    //SetBombs((current) => [...current, {center:{lat:e.latLng.lat(), lng:e.latLng.lng()}, radius:search_radius}])

    GetCityInfoFromLatLng(e.latLng.lat(), e.latLng.lng(), search_radius).then(city_info => {

      // Found city
      if(city_info)
      {
        //console.log(city_info)
        SetSelectedCity(city_info)
        SetShowSelCityMarker(true);
        SetShowSelCityInfo(true);

        if(game_state === CAPSEL)
        {
          let city_already_sel = false;
          for(var cap of cap_buffer)
          {
            if(cap && cap.capinfo.lat && cap.capinfo.lat === city_info.lat && cap.capinfo.lng === city_info.lng)
            {
              city_already_sel = true;
              break;
            }
          }
          if(city_already_sel === false)
          {
            SetShowSelCapBtn(true);

          }
        }
        else if(game_state === GAME)
        {

        }
      }
      else
      {
        SetSelectedCity(null)
        SetShowSelCityMarker(false);
        SetShowSelCityInfo(false);
        SetShowSelCapBtn(false);
      }

    })
    
  }, []);

  const onMapRightClick = useCallback((e) => {
    console.log("Right click")
    if(game_state === GAME && is_my_turn)
    {
      SetPreBomb((current) => {
        console.log(GetIndexFromRadius(current.radius))
        return {center:{lat:e.latLng.lat(), lng:e.latLng.lng()}, radius:current.radius}})
      SetShowLaunchBtn(true);
    }
  }, []);

  const onMapZoomChange = useCallback((e) => {
    if(mapRef && mapRef.current)
    {
      SetMapZoom(mapRef.current.zoom);
    }
  }, []);

  const onSendMsg = e => {
    e.preventDefault();
    if(message && message !== "")
    {
      const {m_room, m_name, m_message} = {m_room: room, m_name:name, m_message:message};
      socket.emit('client-message', {m_room, m_name, m_message});
      SetMessage("");
    }
    //console.log(selectedCity)
  };

  const onJoinRoom = e => {
    e.preventDefault();
    if( name !== "" && room !== "" )
    {
      const {m_name, m_room} = {m_name:name, m_room:room};
      socket.emit('join-room', {m_name, m_room});
    }
  };

  const onStartGame = e => {
    e.preventDefault();
    socket.emit('host-start-game', {room});
  };

  const onLeaveRoom = e => {
    e.preventDefault();
    socket.emit('leave-room', {room});
    SetStartState();
  };

  const onHideResult = e => {
    e.preventDefault();
    SetResultPageData({show: false, result: null})
  };

  const onSelCap = e => {
    e.preventDefault();
    cap_buffer.push({capinfo:selectedCity, discovered: false});
    // If we have selected enough caps then send them and switch to waiting
    if(cap_buffer.length === cap_count)
    {
      SetInfoText({show: true, text:"Waiting for other players"})

      socket.emit("cap-sel", {room, caps:cap_buffer});

      let total_pop = 0;
      for(var cap of cap_buffer)
      {
        total_pop += cap.capinfo.pop;
      }

      console.log("total pop: " + total_pop);

      let new_bombCount = [999999999] // set first type to be very high number
      for(var i = 1; i < bomb_datas.length; i+=1)
      {
        let this_bomb_cnt = bomb_datas[i].base_cnt;

        this_bomb_cnt += Math.round( total_pop / bomb_datas[i].bonus_per );
        console.log("i: " + i + " bmb: " + this_bomb_cnt)
        new_bombCount.push(this_bomb_cnt)
      }
      SetBombCount(new_bombCount);
    }
    SetShowSelCapBtn(false);
    SetShowSelCityMarker(false);
    SetShowSelCityInfo(false);
    console.log(cap_buffer)
  };

  const onLaunch = e => {
    e.preventDefault();
    if(is_my_turn && preBomb)
    {
      is_my_turn = false;
      let new_bombCount = [...bombCount];
      new_bombCount[GetIndexFromRadius(preBomb.radius)] -= 1;
      SetBombCount(new_bombCount);
      SetPreBomb(null);
      SetShowLaunchBtn(false);
      SetShowBombBtns(false);
      socket.emit("client-turn", {room, bomb:{center:preBomb.center, radius: preBomb.radius, ownerID: socket.id}});
    }
  };

  const onBombBtnPress = index => {
    console.log(is_my_turn)
    console.log(index)
    console.log(bombCount[index] > 0)
    if(is_my_turn && (bombCount[index] > 0))
    {
      SetPreBomb({center:preBomb.center, radius:bomb_datas[index].rad})
    }
  };

  return <div>
    {showStartPage && 
    <StartingPage name={name} SetName={SetName} room={room} SetRoom={SetRoom} OnSubmit={onJoinRoom}/>}
    {showRoomPage && 
    <RoomPage room={room} users={users} isLeader={isLeader} OnStartGame={onStartGame} OnLeaveRoom={onLeaveRoom}/>}

    <Chat chat={chat} message={message} SetMessage={SetMessage} OnSend={onSendMsg}/>

    {InfoText.show &&
    <div className="info-text-div"><h1 className="info-text">{InfoText.text}</h1></div>}

    {ResultPageData.show && 
    <ResultPage result={ResultPageData.result} OnHide={onHideResult} OnLeave={onLeaveRoom} /> }

    {isLoaded &&
    <GoogleMap 
      mapContainerStyle={mapContainerStyle}
      zoom={start_zoom}
      center={center}
      options={options}
      onClick={onMapClick}
      onRightClick={onMapRightClick}
      onZoomChanged={onMapZoomChange}
      onLoad={onMapLoad}

    >
      {bombs.map((bomb, index) => (
        <Circle
          key={index}
          center={bomb.center}
          radius={bomb.radius}
          options={{clickable:false, fillColor:GetCSSColor(GetPlayerColorIdx(bomb.ownerID)), strokeColor:GetCSSColor(GetPlayerColorIdx(bomb.ownerID))}}
        />
      ))}

      {showSelCityMarker && selectedCity && selectedCity.lat && selectedCity.lng &&
      <Marker
      position={{ lat: selectedCity.lat, lng: selectedCity.lng }}
      options={{clickable:false}}
      />
      }

      {users.map((user) => (
        user.caps.map((cap, index) => (
          (cap.discovered || user.id === socket.id) && cap.capinfo &&
          <Marker
            position={{ lat: cap.capinfo.lat, lng: cap.capinfo.lng }}
            icon={{
              path: cap_path,
              fillColor: GetCSSColor(GetPlayerColorIdx(user.id)),
              fillOpacity: 0.8,
              strokeWeight: 0,
              scale: ((mapZoom ** 1.3) / 20),
              anchor: new window.google.maps.Point(48.384 / 2, 48.384 / 2),
              }}
            options={{clickable:false}}
            key={index}
          />
          )
        )
      ))}

      {is_my_turn && preBomb && preBomb.center && preBomb.center.lat && preBomb.center.lng &&
      <Circle
        center={preBomb.center}
        radius={preBomb.radius}
        options={{clickable:false}}
      />}

    </GoogleMap>
    }

    {showSelCityInfo && selectedCity &&
    <CityInfo cityinfo={selectedCity}/>
    }

    {showSelCapBtn &&
    <div className='sel-cap-btn-div'>
    <Button
      className="sel-cap-btn"
      variant="contained"
      color="primary"
      onClick={onSelCap}>
        Select Capital
    </Button></div>}


    {showBombBtns &&
    <div className="bomb-btn-container">
    {bomb_datas.map((bomb_data, index) => (
      <div key={index} className={'bomb-btn-div' + ((preBomb && preBomb.radius && GetIndexFromRadius(preBomb.radius) === index) ? " active-bomb-btn" : "")}>
      <Button
        className={"bomb-btn" + ((bombCount[index] > 0) ? " has-bomb" : " no-bomb")}
        variant="contained"
        onClick={() => onBombBtnPress(index)}
      >
          <p className="bomb-btn-count">{(index !== 0 ? bombCount[index] : "∞")}</p> {" " + bomb_data.text}
      </Button></div>
    ))}
    </div>}

    {showLaunchBtn &&
    <div className='launch-btn-div'>
    <Button
      className="launch-btn"
      variant="contained"
      color="secondary"
      onClick={onLaunch}
      endIcon={<LocationSearchingIcon />}>
        Launch
    </Button></div>}
    
    <div className="player-div">
      {users && users.length !== 0 && 
      users.map((user, index) => (
        <PlayerCard 
          key={index} 
          user={user} 
          curTurnActive={curTurnID === user.id} 
          color_class={GetColorBackgroundClass(GetPlayerColorIdx(user.id))} 
          css_color={GetCSSColor(GetPlayerColorIdx(user.id))}
          />
      ))}
    </div>

  </div>
}

async function GetCityInfoFromLatLng(lat, lng, rad) {
    // Make API call passing in LAT LNG
    let response = await fetch("https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&sort=population&geofilter.distance="+ lat + "%2C+" + lng + "%2C+" + rad)
    let data = await response.json()
    let cityinfo = null
    if(data.records.length > 0)
    {
      let info = data.records[0].fields
      cityinfo = {
        name:         info.name,
        pop:          info.population,
        lat:          parseFloat(info.latitude),
        lng:          parseFloat(info.longitude),
        country:      info.country,
        country_code: info.country_code
      }
    }
    
    return cityinfo;
}

// returns search radius in meters from map zoom
function GetSearchRadiusFromZoom( zoom )
{
  let rad = ( (1 - ((zoom + 1) / 23) ) * (1 - ((zoom + 1) / 23) ) * (1 - ((zoom + 1) / 23) ) * (1 - ((zoom + 1) / 23) )  * 100000);
  return rad;
}

function GetIndexFromRadius(radius)
{
  for(var i = 0; i < bomb_datas.length; i += 1)
  {
    if(bomb_datas[i].rad === radius)
    {
      return i;
    }
  }
  return -1
}

function GetPlayerColorIdx(userID)
{
  let index = player_colors.findIndex(pc => pc.id === userID);
  if(index === -1) // Player has not been assigned color
  {
    for(let i = 0; i < COLOR_CNT; i++)
    {
      if((player_colors.findIndex(pc => pc.color_idx === i)) === -1)
      {
        player_colors.push({id:userID, color_idx: i});
        //console.log("add color entry")
        //console.log(i)
        return i;
      }
    }
    //console.log("could not get color index")
    return 0;
  }
  else
  {
    //console.log(index)
    return player_colors[index].color_idx;
  }
}