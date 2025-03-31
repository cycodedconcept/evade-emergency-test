import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faCrosshairs, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CardComponent from './reusables/CardComponent';
import Table from "./reusables/Table"
import { dashboardData } from '../features/userSlice';
import { Em, War, Com, Pad, Pink, Pink2, Org, Org2, Act, Act2, Logo } from '../assets';

const containerStyle = {
  width: "100%",
  height: "400px",
};

const Card = () => {
  const dispatch = useDispatch();
  const tokenItem = localStorage.getItem("item");
  const token = JSON.parse(tokenItem);
  const {loading, error, dataItem } = useSelector((state) => state.user);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mode, setMode] = useState(false);
  const [details, setDetails] = useState({})

  useEffect(() => {
    if (token) {
      dispatch(dashboardData({token}))
    }
  }, [dispatch, token])
  
  const columns = [
    { header: "INDEX", accessor: "index" },
    { header: "DEVICE ID", accessor: "deviceid" },
    { header: "NAME", accessor: "name" },
    { header: "TYPE", accessor: "accident_type" },
    { header: "REQUEST", accessor: "nature_of_request" },
    { header: "DATE", accessor: "date" },
    { header: "TIME", accessor: "time" },
    { header: "STATUS", accessor: "closed_status" },
    { header: "ACTION", accessor: "action" }
  ];

  const formattedTableData = [];
  if (dataItem && dataItem.records && Array.isArray(dataItem.records)) {
    dataItem.records.forEach((item, index) => {
      formattedTableData.push({
        index: index + 1,
        deviceid: item.deviceid || "N/A",
        name: item.name || "-----",
        accident_type: item.accident_type || "-----",
        nature_of_request: item.nature_of_request || "-----",
        date: item.date || "-----",
        time: item.time || "-----",
        status: {
          isActive: item.closed_status !== 0,
          text: item.closed_status === 0 ? "in-active" : "active"
        },
        action: "action",
        originalData: item
      });
    });
  }

  const hideModal = () => {
    setMode(false)
  }

  const handleView = (row) => {
    const recordId = row.id;
    setMode(true)
    
    const originalRecord = dataItem.records.find(record => record.id === recordId);
    setDetails(originalRecord)
    
    console.log("Original record:", originalRecord);
    
  };

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
          <h3 style={{color: '#14181F'}}>Welcome {dataItem?.details?.name}</h3>
          <p style={{color: '#707A8F'}}>Provides an overview of key metrics</p>
        </div>
        <div>
          <div className="input-group rounded px-2 position-relative mt-0 mt-lg-3" style={{ width: "250px" }}>
            <span className="input-group-text bg-white border-0" style={{borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px"}}>
              <FaCalendarAlt className="text-secondary" />
            </span>

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
              <p style={{color: "#15AC77", fontSize: "14px", background: "#E8F7F1", padding: "5px", marginBottom: "0"}}>
                <FontAwesomeIcon icon={faPhone} className='mx-2'/>Device Number: 09065435623
              </p>
            </div>
            <p style={{fontWeight: "600", marginBottom: "0"}}>Fatal Collision</p>
            <div className="d-flex">
              <FontAwesomeIcon icon={faCrosshairs} style={{color: "#707A8F", marginRight: "5px", fontSize: "14px", marginTop: "4px"}}/>
              <small style={{color: "#707A8F", marginRight: "15px"}}>Location: 40.7128° N, 74.0060° W (New York, NY)</small>
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
          title="Online Devices"
          imageBase={Pad}
          image={Com}
          value={dataItem?.counts?.onlinedevice || 0} 
        />

        <CardComponent 
          title="Offline Devices"
          imageBase={Act2}
          image={Act}
          value={dataItem?.counts?.offlinedevice || 0} 
        />

        <CardComponent 
          title="SOS"
          imageBase={Org2}
          image={Org}
          value={dataItem?.counts?.sos || 0} 
        />

        <CardComponent
          title="Accident Detected"
          imageBase={Pink2}
          image={Pink}
          value={dataItem?.counts?.accident_detected || 0} 
        />
      </div>

      <div className="map-section px-3 py-2 mt-5" style={{background: "#fff"}}>
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
        {loading ? (
          <div>Loading data...</div>
        ) : error ? (
          <div>Error loading data: {error}</div>
        ) : dataItem && dataItem.records ? (
          <Table columns={columns} data={dataItem.records} onView={handleView}/>
        ) : (
          <div>No data available</div>
        )}
      </div>

      {mode ? (
        <>
          <div className="modal-overlay">
            <div className="modal-content2">
              <div className="head-mode">
                <h6 style={{color: '#2E3192'}}>Emergency Details</h6>
                <button className="modal-close" onClick={hideModal}>&times;</button>
              </div>
              {details ? (
                <>
                  <div className="modal-body">
                    <div className="d-flex justify-content-between">
                      <img src={Logo} alt="" />
                      <p>{details.deviceid}</p>
                    </div>
                    <hr />

                    <div className="d-block d-lg-flex justify-content-between" style={{gap: '20px'}}>
                      <div className='w-100 px-lg-3 px-0 cta' style={{borderRight: '2px solid #e7e8fd'}}>
                        <div className="d-flex justify-content-between">
                          <p>Accident Type: </p>
                          <p>{details.accident_type}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Nature of Request: </p>
                          <p>{details.nature_of_request}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Name: </p>
                          <p>{details.name || 'none'}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Priority: </p>
                          <p className={details.priority}>{details.priority || 'none'}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Assigned At: </p>
                          <p>{details.assigned_at || 'none'}</p>
                        </div>
                      </div>
                      
                      <div className='w-100'>
                        <div className="d-flex justify-content-between">
                          <p>Longitute: </p>
                          <p>{details.log}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Latitude: </p>
                          <p>{details.lat}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Date: </p>
                          <p>{details.date}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Time: </p>
                          <p>{details.time}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Created At: </p>
                          <p>{details.created_at}</p>
                        </div>
                        <div className="d-flex justify-content-between">
                          <p>Status: </p>
                          <p className={details.closed_status === 0 ? 'Inactive' : 'Active'}>{details.closed_status === 0 ? 'Inactive' : 'Active'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>Loading data</p>
                </>
              )}
            </div>
          </div>
        </>
      ) : ('')}
    </>
  )
}

export default Card