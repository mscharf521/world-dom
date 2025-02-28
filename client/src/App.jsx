import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, FormControlLabel, Switch } from '@mui/material'
import { LocationSearching } from '@mui/icons-material'
import {
  GoogleMap,
  useLoadScript,
  Circle,
  Marker
} from "@react-google-maps/api"
import Fuse from 'fuse.js';

import CityInfo from "./CityInfo";
import Chat from './Chat'
import StartingPage from './StartingPage'
import RoomPage from './RoomPage'
import ResultPage, { WIN, TIE, LOSE } from './ResultPage'
import PlayerCard from './PlayerCard'
import AlertSystem from './AlertSystem'
import LeftMouse from "./LeftMouse"
import RightMouse from "./RightMouse"
import './App.css'
import './font.css'

import { cap_path } from "./CapSymbol"
import { GetColorBackgroundClass, GetCSSColor, COLOR_CNT } from "./PlayerColors"
import { COUNTRIES } from './constants/countries';

// WebSocket connection
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
const ws = new WebSocket(WS_URL);

let my_connection_id = null;

// Game states
const PREGAME = 0;
const CAPSEL = 1;
const WAIT = 2;
const GAME = 3;

let game_state = PREGAME;
let cap_count = 0;
let cap_buffer = [];
let is_my_turn = false;
let player_colors = [];

const start_zoom = 2;//10;
const mapContainerStyle = {
  width: "100%",
  height: "100%"
}
const start_center = {
    lat: 0,//lat: 38.6270,
    lng: 0,//lng: -90.1994,
}

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  minZoom: 2,
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      east: 180,
      west: -180,
    },
  },
  gestureHandling: 'greedy',
}

const bomb_datas = [
  {rad: 150000,  text:"1 megaton",  base_cnt: 999, bonus_per: 1,        zoom: 8 }, //base count and bonus are not used for first bomb type
  {rad: 300000,  text:"5 megaton",  base_cnt: 10,  bonus_per: 500000,   zoom: 6 },
  {rad: 700000,  text:"10 megaton", base_cnt: 5,   bonus_per: 1000000,  zoom: 5 },
  {rad: 1200000, text:"50 megaton", base_cnt: 1,   bonus_per: 5000000,  zoom: 5 }
];

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if(loadError) console.log(loadError);

  const [showStartPage, SetShowStartPage] = useState(true);
  const [showRoomPage, SetShowRoomPage] = useState(false);
  const [ResultPageData, SetResultPageData] = useState({show:false, result:null});
  //const [ResultPageData, SetResultPageData] = useState({show:true, result:WIN});
  const [showSelCapBtn, SetShowSelCapBtn] = useState(false);
  const [selCapBtnText, SetSelCapBtnText] = useState("Select Capital");
  const [selCapBtnDisabled, SetSelCapBtnDisabled] = useState(false);
  const [showSelCityInfo, SetShowSelCityInfo] = useState(false);
  const [showSelCityMarker, SetShowSelCityMarker] = useState(false);
  const [showLaunchBtn, SetShowLaunchBtn] = useState(false);
  const [showBombBtns, SetShowBombBtns] = useState(false);
  const [InfoText, SetInfoText] = useState({show: false, text:""})
  //const [InfoText, SetInfoText] = useState({show: true, text:"Select 3 Capital Cities"})

  const [mapZoom, SetMapZoom] = useState(start_zoom);

  const [alerts, SetAlerts] = useState([])
  //const [alerts, SetAlerts] = useState([{text:"This is an alert!", id:99999}])
  const [name, SetName] = useState("");
  const [room, SetRoom] = useState("");
  const [isLeader, SetIsLeader] = useState(false);
  const [users, SetUsers] = useState([]);
  //const [users, SetUsers] = useState([{id:"1234-56789", username:"Name", room:"this-Room", caps:[{},{},{}, {}, {}, {}]}]);
  const [bombs, SetBombs] = useState([]);
  const [curTurnID, SetCurTurnID] = useState("");
  //const [curTurnID, SetCurTurnID] = useState("1234-56789");
  //const [bombCount, SetBombCount] = useState([]);
  const [bombCount, SetBombCount] = useState([999999,40,15,3]);

  const [preBomb, SetPreBomb] = useState(null);
  const [selectedCity, SetSelectedCity] = useState({});

  const [CityInfoControl, SetCityInfoControl] = useState(true);

  const [hideChat, SetHideChat] = useState(true);
  const [chat, SetChat] = useState([]);
  //const [chat, SetChat] = useState([{m_name:"user", m_message:"message", color:"Crimson"},{m_name:"user", m_message:"message", color:"Crimson"},{m_name:"user", m_message:"message", color:"Crimson"}]);
  const [message, SetMessage] = useState("");

  const [settings, SetSettings] = useState({
    minPopulation: 0,
    onlyCapitals: false,
    whitelistCountries: [],
    blacklistCountries: []
  });

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

    mapRef.current.panTo(start_center)
    mapRef.current.setZoom(start_zoom)
  }

  const settingsRef = useRef(settings);
  useEffect(() => {settingsRef.current = settings})
  
  const usersRef = useRef(users);
  useEffect(() => {usersRef.current = users})

  const ctrlRef = useRef(CityInfoControl);
  useEffect(() => {ctrlRef.current = CityInfoControl})

  useEffect(() => {
    if(game_state !== PREGAME)
    {
      window.scrollTo(0, 0)
    }
  })

  useEffect(() => {
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      addAlert('Lost connection to server', null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      
      switch (payload.type) {
        case 'message':
          SetChat((current) => ([
            ...current, 
            { 
              m_name: payload.data.username, 
              m_message: payload.data.message, 
              color: GetCSSColor(GetPlayerColorIdx(payload.data.userId)) 
            }
          ]));
          break;

        case 'connection-id':
          my_connection_id = payload.data.connectionId;
          break;

        case 'joined-room-result':
          if (payload.data.success) {
            SetShowRoomPage(true);
            SetShowStartPage(false);
            SetIsLeader(payload.data.leader);
            SetSettings((current) => ({...current, ...payload.data.settings}));
          } else {
            console.log("failed to join room");
          }
          break;

        case 'start-game':
          SetShowStartPage(false);
          SetShowRoomPage(false);
          game_state = CAPSEL;
          cap_count = payload.data.num_caps;
          SetInfoText({
            show: true, 
            text: `Select ${payload.data.num_caps} Capital Cit${payload.data.num_caps > 1 ? 'ies' : 'y'}`
          });
          break;

        case 'room-users':
          SetUsers(payload.data.users);
          break;

        case 'bomb-update':
          SetBombs(payload.data.bombs);
          const lastBomb = payload.data.bombs[payload.data.bombs.length - 1];
          const user = usersRef.current.find(u => u.connectionId === lastBomb.ownerID);
          if (user) {
            addAlert(
              `${user.username} dropped a bomb!`,
              () => bombPanToLoc(lastBomb),
              8000
            );
          }
          break;

        case 'next-turn':
            if(game_state === CAPSEL || game_state === WAIT)
            {
              game_state = GAME;
              SetInfoText({show: false, text:""})
            }

            SetCurTurnID(payload.data.userID);
      
            if(payload.data.userID === my_connection_id) // my turn
            {
              addAlert("It's your turn", null, 3000)
              is_my_turn = true;
              SetPreBomb((current) => ({center:null, radius:bomb_datas[0].rad}))
              SetShowBombBtns(true);
            }
            break;
      
        case 'win':
            if(game_state === GAME)
            {
              SetResultPageData({show:true, result:WIN});
            }
            break;
      
        case 'tie':
            if(game_state === GAME)
            {
              SetResultPageData({show:true, result:TIE});
            }
            break;
      
        case 'lose':
            if(game_state === GAME)
            {
              SetResultPageData({show:true, result:LOSE});
            }
            break;

        case 'settings-change-server':
            SetSettings((current) => ({...current, ...payload.data.settings}));
            break;
      
        default:
            console.log("Unknown message type:", payload.type);
            break;
      }
    };
  }, []);

  const sendWSMessage = (action, data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action, data }));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const checkIfCityIsCapital = (city_info) => {
    const fuse = new Fuse(
      [COUNTRIES[city_info.country_code].capital], 
      { threshold: 0.3, includeScore: true, isCaseSensitive: false, ignoreDiacritics: true }
    );
    const result = fuse.search(city_info.name);
    return result.length > 0;
  }

  const checkIfFailsCityRequirements = (city_info, currentSettings) => {
    return (currentSettings.minPopulation && city_info.pop < currentSettings.minPopulation) ||
           (currentSettings.whitelistCountries.length > 0 && !currentSettings.whitelistCountries.includes(city_info.country_code)) ||
           (currentSettings.blacklistCountries.length > 0 && currentSettings.blacklistCountries.includes(city_info.country_code)) ||
           (currentSettings.onlyCapitals && !checkIfCityIsCapital(city_info));
  }

  const onMapClick = useCallback((e) => {
    if(!ctrlRef.current)
    {
      onBombPosSelect(e);
      return;
    }
    let search_radius = GetSearchRadiusFromZoom(mapRef.current.zoom)
    GetCityInfoFromLatLng(e.latLng.lat(), e.latLng.lng(), search_radius).then(city_info => {

      // Found city
      if(city_info)
      {
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
            if (checkIfFailsCityRequirements(city_info, settingsRef.current)) {
                SetSelCapBtnText("Does not meet requirements");
                SetSelCapBtnDisabled(true);
            } else {
                SetSelCapBtnText("Select Capital");
                SetSelCapBtnDisabled(false);
            }
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
    onBombPosSelect(e);
  }, []);

  const onBombPosSelect = (e) => {
    if(game_state === GAME && is_my_turn)
    {
      SetPreBomb((current) => {
        return {center:{lat:e.latLng.lat(), lng:e.latLng.lng()}, radius:current.radius}})
      SetShowLaunchBtn(true);
    }
  }

  const onMapZoomChange = useCallback((e) => {
    if(mapRef && mapRef.current)
    {
      SetMapZoom(mapRef.current.zoom);
    }
  }, []);

  const bombPanToLoc = (bomb) => {
    mapRef.current.panTo(bomb.center)
    mapRef.current.setZoom(bomb_datas[GetBombIdxfromRadius(bomb.radius)].zoom)
  };

  const onSendMsg = e => {
    e.preventDefault();
    if (message && message !== "") {
      sendWSMessage('client-message', {
        roomId: room,
        message: message
      });
      SetMessage("");
    }
  };

  const onJoinRoom = e => {
    e.preventDefault();
    if (name !== "" && room !== "") {
      sendWSMessage('req-connection-id', {});
      sendWSMessage('join-room', {
        roomId: room,
        username: name
      });
    } else if (room === "") {
      addAlert("Invalid room name", null, 2000);
    } else if (name === "") {
      addAlert("Invalid user name", null, 2000);
    }
  };

  const onStartGame = e => {
    e.preventDefault();
    if( users.length < 2 )
    {
      addAlert("More players needed to start the game.", null, 3000)
    }
    else
    {
      sendWSMessage('host-start-game', {room});
    }

  };

  const onLeaveRoom = e => {
    e.preventDefault();
    sendWSMessage('leave-room', {room});
    SetStartState();
  };

  const onHideResult = e => {
    e.preventDefault();
    SetResultPageData({show: false, result: null})
  };

  const OnHideChatClicked = e => {
    e.preventDefault();
    SetHideChat(!hideChat)
  }

  const onSelCap = e => {
    e.preventDefault();
    cap_buffer.push({capinfo:selectedCity, discovered: false});
    // If we have selected enough caps then send them and switch to waiting
    if(cap_buffer.length === cap_count)
    {
      SetInfoText({show: true, text:"Waiting for other players"})

      sendWSMessage("cap-sel", {room, caps:cap_buffer});

      let total_pop = 0;
      for(var cap of cap_buffer)
      {
        total_pop += cap.capinfo.pop;
      }

      let new_bombCount = [999999999] // set first type to be very high number
      for(var i = 1; i < bomb_datas.length; i+=1)
      {
        let this_bomb_cnt = bomb_datas[i].base_cnt;

        this_bomb_cnt += Math.round( total_pop / bomb_datas[i].bonus_per );
        new_bombCount.push(this_bomb_cnt)
      }
      SetBombCount(new_bombCount);
      cap_buffer = [];
      game_state = WAIT;
    }
    SetShowSelCapBtn(false);
    SetShowSelCityMarker(false);
    SetShowSelCityInfo(false);
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
      SetCityInfoControl(true);
      sendWSMessage("client-turn", {room, bomb:{center:preBomb.center, radius: preBomb.radius, ownerID: my_connection_id}});
    }
  };

  const onBombBtnPress = index => {
    if(is_my_turn && (bombCount[index] > 0))
    {
      SetPreBomb({center:preBomb.center, radius:bomb_datas[index].rad})
    }
  };

  const OnControlChange = (e) => {
    if(is_my_turn)
    {
      SetCityInfoControl(!CityInfoControl);
    }
  };

  const addAlert = (text, OnClickFunc, duration = 2000) => {
    const uuid = crypto.randomUUID();
    SetAlerts(current => ([...current, {text, id:uuid, OnClickFunc}]))
    scheduleRemoveAlert(uuid, duration);
  } 

  const scheduleRemoveAlert = (rm_id, duration) => {
    setTimeout(function() {
      removeAlert(rm_id)
    }, duration)
  }

  const removeAlert = (rm_id) => {
    SetAlerts(current => {
      let idx = current.findIndex(alert => alert.id === rm_id);
      if(idx !== -1)
      {
        current.splice(idx, 1);
      }
      return [...current];
    })
  }

  const handleSettingsChange = (newSettings) => {
    sendWSMessage('settings-change', {room, settings:newSettings});
  }

  return <div>
    {showStartPage &&
    <StartingPage name={name} SetName={SetName} room={room} SetRoom={SetRoom} OnSubmit={onJoinRoom}/>}
    {showRoomPage && 
    <RoomPage 
      room={room} 
      users={users} 
      isLeader={isLeader} 
      OnStartGame={onStartGame} 
      OnLeaveRoom={onLeaveRoom}
      settings={settings}
      onSettingsChange={handleSettingsChange}
    />}

    {game_state === PREGAME &&
    <div className="MapCover"></div>}

    <AlertSystem alerts={alerts} removeAlert={removeAlert}/>

    {game_state !== PREGAME && 
    <Chat hideChat={hideChat} chat={chat} message={message} SetMessage={SetMessage} OnSend={onSendMsg} OnHideChatClicked={OnHideChatClicked}/>}

    {InfoText.show &&
    <div className="info-text-div"><h1 className="info-text">{InfoText.text}</h1></div>}

    {ResultPageData.show && 
    <ResultPage result={ResultPageData.result} OnHide={onHideResult} OnLeave={onLeaveRoom} /> }

    {isLoaded &&
    <div className="Map-div">
    <GoogleMap 
      className="Map"
      mapContainerStyle={mapContainerStyle}
      zoom={start_zoom}
      center={start_center}
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
          (cap.discovered || user.connectionId === my_connection_id) && cap.capinfo &&
          <Marker
            position={{ lat: cap.capinfo.lat, lng: cap.capinfo.lng }}
            icon={{
              path: cap_path,
              fillColor: GetCSSColor(GetPlayerColorIdx(user.connectionId)),
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

      {cap_buffer && 
      cap_buffer.map((cap, index) => (
        cap.capinfo &&
        <Marker
          position={{ lat: cap.capinfo.lat, lng: cap.capinfo.lng }}
          icon={{
            path: cap_path,
            fillColor: GetCSSColor(GetPlayerColorIdx(my_connection_id)),
            fillOpacity: 0.8,
            strokeWeight: 0,
            scale: ((mapZoom ** 1.3) / 20),
            anchor: new window.google.maps.Point(48.384 / 2, 48.384 / 2),
            }}
          options={{clickable:false}}
          key={index}
        />
        ))
      }

      {is_my_turn && preBomb && preBomb.center && preBomb.center.lat && preBomb.center.lng &&
      <Circle
        center={preBomb.center}
        radius={preBomb.radius}
        options={{clickable:false}}
      />}

    </GoogleMap></div>
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
      onClick={onSelCap}
      disabled={selCapBtnDisabled}
      >
        {selCapBtnText}
    </Button></div>}


    {showBombBtns &&
    <div className="bomb-btn-container">

    {showLaunchBtn &&                              // Launch button
    <div className='bomb-btn-div'>
    <Button
      className="launch-btn"
      variant="contained"
      color="error"
      onClick={onLaunch}
      endIcon={<LocationSearching />}
      style={{justifyContent: "flex-end"}}
    >
        <div className="game-btn-label">Launch</div>
    </Button></div>}

    {bomb_datas.map((bomb_data, index) => (    // Bomb buttons
      <div key={index} className={'bomb-btn-div' + ((preBomb && preBomb.radius && GetIndexFromRadius(preBomb.radius) === index) ? " active-bomb-btn" : "")}>
        <Button
          className={"bomb-btn" + ((bombCount[index] > 0) ? " has-bomb" : " no-bomb")}
          variant="contained"
          onClick={() => onBombBtnPress(index)}
          style={{justifyContent: "flex-end"}}
        >
            <div className="game-btn-label">{" " + bomb_data.text}</div>
        </Button>
        <p className="bomb-btn-count">{(index !== 0 ? bombCount[index] : "∞")}</p> 
      </div>
    ))}
    
    </div>}
    
    {game_state !== PREGAME &&
    <div className="player-div">
      {users && users.length !== 0 && 
      users.map((user, index) => (
        <PlayerCard 
          key={index} 
          user={user} 
          curTurnActive={curTurnID === user.connectionId} 
          color_class={GetColorBackgroundClass(GetPlayerColorIdx(user.connectionId))} 
          css_color={GetCSSColor(GetPlayerColorIdx(user.connectionId))}
          />
      ))}
    </div>}
    
    {game_state !== PREGAME &&
    <div className="mouse-container">
      {showBombBtns &&
       <div className="mouse-div">
        Bomb Selection
        <RightMouse css_color="white"/>
      </div>}
      <div className="mouse-div">
        City Info
        <LeftMouse css_color="white"/>
      </div>
    </div>}
    
    {game_state !== PREGAME &&
    <div className="control-switch-div">
      <FormControlLabel
        control={<Switch checked={!CityInfoControl} onChange={OnControlChange} />}
        label={(CityInfoControl ? "City Info" : "Bomb Select")}
        labelPlacement="top"
      />
    </div>}

    

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
        // lat:          parseFloat(info.latitude),
        lat:          parseFloat(info.coordinates[0]),
        // lng:          parseFloat(info.longitude),
        lng:          parseFloat(info.coordinates[1]),
        // country:      info.country,
        country:      info.cou_name_en,
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

function GetPlayerColorIdx(connectionId)
{
  let index = player_colors.findIndex(pc => pc.id === connectionId);
  if(index === -1) // Player has not been assigned color
  {
    for(let i = 0; i < COLOR_CNT; i++)
    {
      if((player_colors.findIndex(pc => pc.color_idx === i)) === -1)
      {
        player_colors.push({id:connectionId, color_idx: i});
        return i;
      }
    }
    return 0;
  }
  else
  {
    return player_colors[index].color_idx;
  }
}

function GetBombIdxfromRadius(radius)
{
  let idx = -1;
  for(const bomb_data of bomb_datas)
  {
    idx += 1;
    if(bomb_data.rad === radius)
    {
      return idx;
    }
  }
  return 0;
}