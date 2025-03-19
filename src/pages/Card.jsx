import React, {useState} from 'react'
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faCrosshairs, faCalendar } from '@fortawesome/free-solid-svg-icons';
import CardComponent from './reusables/CardComponent';
import { Em, War, Com, Pad, Pink, Pink2, Org, Org2, Act, Act2 } from '../assets';

const Card = () => {
  const [selectedDate, setSelectedDate] = useState("");
  return (
    <>
      <div className="d-block d-lg-flex justify-content-between p-3 mt-3 text-center">
        <div>
          <h3 style={{color: '#14181F'}}>Welcome Back John</h3>
          <p style={{color: '#707A8F'}}>Provides an overview of key metrics</p>
        </div>
        <div>
          <div className="input-group rounded px-2 position-relative mt-0 mt-lg-3" style={{ width: "250px" }}>
          {/* Calendar Icon */}
          <span className="input-group-text bg-white border-0" style={{borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px"}}>
            <FaCalendarAlt className="text-secondary" />
          </span>

          {/* Date Input */}
          <input
            type="date"
            className="form-control border-0 position-relative"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              appearance: "none",
              paddingLeft: "35px",
              textIndent: selectedDate ? "0" : "50px",
            }}
          />

          {/* "This Year" Placeholder */}
          {!selectedDate && (
            <span
              className="position-absolute text-secondary"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                fontSize: "14px",
              }}
            >
              This Year
            </span>
          )}

          {/* Caret Down Icon */}
          <span className="input-group-text bg-white border-0" style={{borderTopRightRadius: "12px", borderBottomRightRadius: "12px"}}>
            <FaCaretDown className="text-secondary" />
          </span>
          </div>
        </div>
      </div>
      <div className="alert-box d-flex justify-content-between p-3" style={{border: "1px solid #FE5B65", borderRadius: "12px"}}>
        <div className='d-flex'>
          <div>
            <img src={Em} alt="" className='mx-3 my-3'/>
          </div>
          <div>
            <div className="d-flex">
              <p style={{color: "#FE5B65", fontWeight: "600", marginRight: "10px", marginBottom: "0"}}>Emergency Alert</p>
              <p style={{color: "#15AC77", fontSize: "14px", background: "#E8F7F1", padding: "5px", marginBottom: "0"}}><FontAwesomeIcon icon={faPhone} className='mx-2'/>Device Number: 09065435623</p>
            </div>
            <p style={{fontWeight: "600", marginBottom: "0"}}>Fatal Collision</p>
            <div className="d-flex">
              <FontAwesomeIcon icon={faCrosshairs} style={{color: "#707A8F", marginRight: "5px", fontSize: "14px", marginTop: "4px"}}/>
              <small style={{color: "#707A8F", marginRight: "15px"}}>Location:  40.7128° N, 74.0060° W (New York, NY)</small>
              <small style={{color: "#707A8F", marginRight: "5px"}}><FontAwesomeIcon icon={faCalendar} /></small>
              <small style={{color: "#707A8F", marginRight: "15px"}}>Date/Time: 2025-01-10 | 14:30</small>
              <small style={{color: "#707A8F", marginRight: "5px"}}><FontAwesomeIcon icon={faPhone} /></small>
              <small style={{color: "#707A8F", marginRight: "5px"}}>Contact: 09181029838</small>
            </div>
          </div>
          
        </div>
        <div className='mt-3'>
          <p style={{color: "#FE5B65", background: "#FFEFF0", padding: "7px"}}><img src={War} alt='' /> Severity: Fatal</p>
        </div>
      </div>

      <div className="dash-cards mt-5">
        <CardComponent 
        title="Total Devices"
        imageBase={Pad}
        image={Com}
        value="205" />

        <CardComponent 
        title="Total Emergencies"
        imageBase={Act2}
        image={Act}
        value="15" />

        <CardComponent 
        title="Active Devices"
        imageBase={Org2}
        image={Org}
        value="120" />

        <CardComponent 
        title="Active Devices"
        imageBase={Pink2}
        image={Pink}
        value="15" />
      </div>
    </>
  )
}

export default Card