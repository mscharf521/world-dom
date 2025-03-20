import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import './RoomSettingsPopup.css';
import './MultiUseInfo.css';
import './font.css';
import { COUNTRIES } from './constants/countries';

const settingsLabels = {
  numberOfCapitals: 'Number of Capitals',
  numberOfSpies: 'Number of Spies',
  numberOfBoats: 'Number of Boats',
  minPopulation: 'Minimum Population',
  onlyCapitals: 'Only Country Capitals',
  whitelistCountries: 'Country Whitelist',
  blacklistCountries: 'Country Blacklist',
  bombScale: 'Bomb Scale'
};

export default function RoomSettingsPopup(props) {
  const { settings } = props;

  const getCountryName = (code) => COUNTRIES[code]?.name || code;

  const formatSettingValue = (key, value) => {
    if (( key == 'whitelistCountries' ||
          key == 'blacklistCountries' ) &&
        Array.isArray(value)) {
      return value.length === 0 ? 'None' : value.map(getCountryName).join(', ');
    }
    if (key === 'bombScale') {
      return `${value}%`;
    }
    if (key === 'onlyCapitals') {
      return value ? 'Yes' : 'No';
    }
    return value.toString();
  };

  const handlePrefsChange = (pref, value) => {
    const newPrefs = {
      ...props.prefs,
      [pref]: value
    };
    props.onPrefsChange(newPrefs);
  }

  return (
    <div className={"RoomSettingsPopup MultiUsePopup " + (props.hide ? "MultiUsePopupHide" : "MultiUsePopupShow")}>
      <div className="RoomSettingsSettingsList">
        <h2>Room Settings</h2>
        <div className="SettingsDivider" />
        {Object.entries(settings).map(([key, value], index, array) => (
          <div key={key} className="SettingsItem">
            <span>{settingsLabels[key] || key}: </span>
            <span>{formatSettingValue(key, value)}</span>
            {index < array.length - 1 && <div className="SettingsDivider" />}
          </div>
        ))}

        <br></br>
        <h2>Room Preferences</h2>
        <div className="SettingsDivider" />
        <div className="SettingsItem">
          <FormControlLabel
            control={
              <Switch
                checked={props.prefs.metricUnits}
                onChange={() => { handlePrefsChange("metricUnits", !props.prefs.metricUnits )}}
                color="primary"
              />
            }
            label={`Unit System: ${props.prefs.metricUnits ? 'Metric' : 'Imperial'}`}
          />
        </div>
        <div className="SettingsDivider" />
        <div className="SettingsItem">
          <FormControlLabel
            control={
              <Switch
                checked={props.prefs.dragBomb}
                onChange={() => { handlePrefsChange("dragBomb", !props.prefs.dragBomb )}}
                color="primary"
              />
            }
            label={`Drag Bomb: ${props.prefs.dragBomb ? 'Drag' : 'No Drag'}`}
          />
        </div>
      </div>
    </div>
  );
}