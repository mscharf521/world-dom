import React, { useState } from "react";
import { Button, TextField, Switch, FormControlLabel, FormGroup, Autocomplete, Chip, Paper, Slider, IconButton } from '@mui/material'
import { NumericFormat } from 'react-number-format';
import { COUNTRIES } from './constants/countries';
import AssetSetting from './components/AssetSetting';
import './RoomPage.css'
import './font.css'

export default function RoomPage(props) {
  const [copyText, setCopyText] = useState("Copy Room Link"); // State for button text

  const renderUsers = () => {
    return props.users.map(({id, username, room, caps}, index) => (
      <div key={index} className="RoomPageUser">
        {username}
      </div>
    ))
  }

  const createRoomLink = () => {
    const baseUrl = window.location.origin;
    const roomLink = `${baseUrl}?room=${encodeURIComponent(props.room)}`; 
    return roomLink;
  }

  const handleCopyLink = async () => {
    const roomLink = createRoomLink();
    await navigator.clipboard.writeText(roomLink);
    setCopyText("Copied!");

    // Reset the button text after 2 seconds
    setTimeout(() => {
      setCopyText("Copy Room Link");
    }, 2000);
  }

  const handleSettingChange = (setting, value) => {
    if (!props.isLeader) return;

    // Create a new settings object to avoid direct mutation
    const newSettings = {
      ...props.settings,
      [setting]: value
    };

    // Notify parent component of settings change
    if (props.onSettingsChange) {
      props.onSettingsChange(newSettings);
    }
  }

  const incrementMinPopulation = () => {
    if (!props.isLeader) return;
    const newMinPopulation = (props.settings?.minPopulation || 0) + 100000;
    handleSettingChange('minPopulation', newMinPopulation);
  }

  // Extract country options for Autocomplete
  const countryOptions = Object.keys(COUNTRIES);

  return <div className="RoomPage">
    <h1 className="RoomSettingsHeader">Room: {props.room}</h1>
    
    <Paper elevation={3} className="RoomSettings">
      <h2 className="RoomSettingsHeader">Room Settings</h2>
      <FormGroup>
        <div className="SettingsRow">
          <AssetSetting
            title="Cities"
            value={props.settings?.numberOfCapitals}
            settingKey="numberOfCapitals"
            handleSettingChange={handleSettingChange}
            isLeader={props.isLeader}
            minValue={1}
            maxValue={10}
          />
          <AssetSetting
            title="Spies"
            value={props.settings?.numberOfSpies}
            settingKey="numberOfSpies"
            handleSettingChange={handleSettingChange}
            isLeader={props.isLeader}
            minValue={0}
            maxValue={10}
          />
        </div>

        <div className="SettingField">
          <NumericFormat
            value={props.settings?.minPopulation}
            thousandSeparator={true}
            customInput={TextField}
            label="Minimum Population"
            type="text"
            onValueChange={(values) => {
              handleSettingChange('minPopulation', parseInt(values.value));
            }}
            disabled={!props.isLeader}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={incrementMinPopulation}
            disabled={!props.isLeader}
            style={{ marginLeft: '10px' }}
          >
            +100,000
          </Button>
        </div>
        
        <FormControlLabel
          control={
            <Switch
              checked={props.settings?.onlyCapitals}
              onChange={(e) => handleSettingChange('onlyCapitals', e.target.checked)}
              disabled={!props.isLeader}
            />
          }
          label="Only Country Capitals"
          className="SettingField"
        />

        <Autocomplete
          multiple
          options={countryOptions}
          getOptionLabel={(option) => COUNTRIES[option]?.name}
          value={props.settings?.whitelistCountries}
          onChange={(e, newValue) => handleSettingChange('whitelistCountries', newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={option + "_whitelist"}
                  label={COUNTRIES[option]?.name}
                  {...tagProps}
                  disabled={!props.isLeader}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Country Whitelist"
              placeholder={props.isLeader ? "Add countries..." : ""}
              size="small"
            />
          )}
          disabled={!props.isLeader}
          className="SettingField"
        />

        <Autocomplete
          multiple
          options={countryOptions}
          getOptionLabel={(option) => COUNTRIES[option]?.name}
          value={props.settings?.blacklistCountries}
          onChange={(e, newValue) => handleSettingChange('blacklistCountries', newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={option + "_blacklist"}
                  label={COUNTRIES[option]?.name}
                  {...tagProps}
                  disabled={!props.isLeader}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Country Blacklist"
              placeholder={props.isLeader ? "Add countries..." : ""}
              size="small"
            />
          )}
          disabled={!props.isLeader}
          className="SettingField"
        />

        <div className="SettingField">
          <label>Bomb Scale: {props.settings.bombScale}%</label>
          <Slider
            value={props.settings.bombScale}
            onChange={(e, newValue) => handleSettingChange('bombScale', newValue)}
            min={50}
            max={200}
            valueLabelDisplay="auto"
            step={10}
            marks={[
              { value: 50, label: '50%' },
              { value: 100, label: '100%' },
              { value: 200, label: '200%' }
            ]}
            disabled={!props.isLeader}
          />
        </div>
      </FormGroup>
    </Paper>

    <h2 className="RoomSettingsHeader">Players</h2>
    <div className="PlayerList">
      {renderUsers()}
    </div>

    {props.isLeader &&
    <form className="RoomPageForm" onSubmit={props.OnStartGame}>
        <Button
        className="StartPageJoinBtn"
        variant="contained"
        color="primary"
        onClick={props.OnStartGame}>Start</Button>
    </form>
    }
    <div className="StartPageLeaveBtnDiv">
      <Button
        className="StartPageLeaveBtn"
        variant="contained"
        color="error"
        onClick={props.OnLeaveRoom}>Leave</Button>
    </div>
    <div className="RoomLinkDiv">
      <Button
        variant="contained"
        color="secondary"
        onClick={handleCopyLink}
      >
        {copyText}
      </Button>
    </div>
  </div>
}