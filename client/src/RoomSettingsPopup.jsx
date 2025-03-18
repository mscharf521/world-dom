import React from 'react';
import './RoomSettingsPopup.css';
import './MultiUseInfo.css';
import './font.css';
import { COUNTRIES } from './constants/countries';

const settingsLabels = {
  numberOfCapitals: 'Number of Capitals',
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

  return (
    <div className={"RoomSettingsPopup MultiUsePopup " + (props.hide ? "MultiUsePopupHide" : "MultiUsePopupShow")}>
      <div className="RoomSettingsSettingsList">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="SettingsItem">
            <span>{settingsLabels[key] || key}: </span>
            <span>{formatSettingValue(key, value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}