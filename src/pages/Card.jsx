import React, {useState, useEffect} from 'react'
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faCrosshairs, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CardComponent from './reusables/CardComponent';
import Table from "./reusables/Table"
import { Em, War, Com, Pad, Pink, Pink2, Org, Org2, Act, Act2 } from '../assets';

const containerStyle = {
  width: "100%",
  height: "400px",
};


const Card = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  

  const columns = [
    {header: "INDEX", accessor: ""},
    { header: "EMERGENCY ID", accessor: "id" },
    { header: "DEVICE ID", accessor: "deviceid" },
    { header: "NAME", accessor: "name" },
    { header: "DATE/TIME", accessor: "date" },
    { header: "LOCATION", accessor: "location" },
    { header: "TYPE", accessor: "accident_type" },
    { header: "SEVERITY", accessor: "severity" },
    { header: "STATUS", accessor: "closed_status" },
    { header: "ACTION", accessor: "name" },
  ];

  const data = [
    {
      id: "EMG001",
      deviceid: "DEV123",
      name: "John Doe",
      date: "2025-03-15 10:30 AM",
      location: "40.7128° N, 74.0060° W (New York, NY)",
      accident_type: "Fatal Collision",
      severity: "High",
      closed_status: "Open",
    },
    {
      id: "EMG002",
      deviceid: "DEV124",
      name: "Jane Smith",
      date: "2025-03-15 12:15 PM",
      location: "34.0522° N, 118.2437° W (Los Angeles, CA)",
      accident_type: "Minor Collision",
      severity: "Low",
      closed_status: "Closed",
    },
    {
      id: "EMG003",
      deviceid: "DEV125",
      name: "Michael Johnson",
      date: "2025-03-15 3:45 PM",
      location: "41.8781° N, 87.6298° W (Chicago, IL)",
      accident_type: "Pedestrian Hit",
      severity: "Medium",
      closed_status: "Pending",
    },
    {
      id: "EMG004",
      deviceid: "DEV126",
      name: "Sarah Williams",
      date: "2025-03-15 5:00 PM",
      location: "29.7604° N, 95.3698° W (Houston, TX)",
      accident_type: "Vehicle Overturn",
      severity: "High",
      closed_status: "Open",
    },
    {
      id: "EMG005",
      deviceid: "DEV127",
      name: "David Brown",
      date: "2025-03-15 7:20 PM",
      location: "33.4484° N, 112.0740° W (Phoenix, AZ)",
      accident_type: "Head-on Collision",
      severity: "Critical",
      closed_status: "Closed",
    }
  ];
  

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error fetching location:", error),
        { enableHighAccuracy: true } 
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);
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

      <div className="map-section px-3 py-2  mt-5" style={{background: "#fff"}}>
        <p>Device Location</p>
        <LoadScript googleMapsApiKey="AIzaSyC2CKttNS1QGg-S0xkbWhYoA08OHuBWzmY">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation || { lat: 37.7749, lng: -122.4194 }}
            zoom={currentLocation ? 15 : 10}
        >
           {currentLocation && <Marker position={currentLocation} />}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="recent-section p-3">
        <p>Recent Emergencies</p>
        <Table columns={columns} data={data} />
      </div>
    </>
  )
}

export default Card