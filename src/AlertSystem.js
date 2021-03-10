import React from 'react';
import './AlertSystem.css'

export default function AlertSystem(props) {

    const renderAlerts = () => {
        return props.alerts.map(({text}, index) => (
          <div key={index} className="Alert">
              {text}
          </div>
        ))
      }

    return <div className="AlertSystem-container">
        <div className="AlertSystem">
        {renderAlerts()}
        </div> 
    </div> 
}