import React from 'react';
import { IconButton } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

export default function AssetSetting({ title, value, settingKey, handleSettingChange, isLeader, minValue, maxValue }) {
  const handleIncrement = () => {
    const newValue = Math.min(maxValue, (value || minValue) + 1);
    handleSettingChange(settingKey, newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(minValue, (value || minValue) - 1);
    handleSettingChange(settingKey, newValue);
  };

  return (
    <div className="SettingColumn">
      <h3>{title}</h3>
      <div className="ButtonGroup">
        <IconButton
          onClick={handleDecrement}
          disabled={!isLeader || value <= minValue}
          color="primary"
        >
          <Remove />
        </IconButton>
        <span>{value}</span>
        <IconButton
          onClick={handleIncrement}
          disabled={!isLeader || value >= maxValue}
          color="primary"
        >
          <Add />
        </IconButton>
      </div>
    </div>
  );
}