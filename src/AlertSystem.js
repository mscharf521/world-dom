import React from 'react';
import './AlertSystem.css'

export default function AlertSystem(props) {

    const renderAlerts = () => {
        return props.alerts.map(({text, id}, index) => (
          <div key={index} className="Alert" onClick={() => props.removeAlert(id)}>
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