import React from 'react';
import './AlertSystem.css'

export default function AlertSystem(props) {

    const renderAlerts = () => {
        return props.alerts.map(({text, id, OnClickFunc}, index) => (
        <div className="Alert-buffer" key={id}>
          <div className="Alert" onClick={function()
            {
                props.removeAlert(id); 
                if(OnClickFunc)
                {
                    OnClickFunc();
                }
            }}
          >
              {text}
          </div>
        </div>
        ))
      }

    return <div className="AlertSystem-container">
        <div className="AlertSystem">
        {renderAlerts()}
        </div> 
    </div> 
}