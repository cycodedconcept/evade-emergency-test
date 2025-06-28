import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faCrosshairs, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CardCarousel from './reusables/CardCarousel';
import Table from "./reusables/Table"
import { dashboardData } from '../features/userSlice';
import { Em, War, Logo } from '../assets';

const containerStyle = {
  width: "100%",
  height: "400px",
};

const Card = () => {
  const dispatch = useDispatch();
  const tokenItem = localStorage.getItem("item");
  const token = tokenItem ? JSON.parse(tokenItem) : null;
  const {loading, error, dataItem } = useSelector((state) => state.user);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mode, setMode] = useState(false);
  const [details, setDetails] = useState({});
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

useEffect(() => {
  if (!token) return;

  const fetchData = async (isInitial = false) => {
    try {
      if (!isInitial) {
        setIsBackgroundRefresh(true);
      }

      await dispatch(dashboardData({token})).unwrap();
      
      if (!isInitial) {
        setLastRefresh(new Date());
        // Brief delay to show success, then hide
        setTimeout(() => setIsBackgroundRefresh(false), 1000);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      setIsBackgroundRefresh(false);
      
      // Only alert for auth errors, silently handle others
      if (typeof error === 'string' && error.includes('Authentication failed')) {
        alert('Your session has expired. Please log in again.');
      }
    }
  };

  fetchData(true);
  const interval = setInterval(() => fetchData(false), 20000);

  return () => clearInterval(interval);
}, [dispatch, token]);
  
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

  // Safe data transformation with error handling
  const formattedTableData = [];
  if (dataItem && dataItem.records && Array.isArray(dataItem.records)) {
    dataItem.records.forEach((item, index) => {
      if (item) { // Make sure item exists
        formattedTableData.push({
          index: index + 1,
          deviceid: item.deviceid || "N/A",
          name: item.name || "-----",
          accident_type: item.accident_type || "-----",
          nature_of_request: item.nature_of_request || "-----",
          date: item.date || "-----",
          time: item.time || "-----",
          closed_status: item.closed_status, // For the Table component to handle
          status: {
            isActive: item.closed_status !== 0,
            text: item.closed_status === 0 ? "in-active" : "active"
          },
          action: "action",
          id: item.id
        });
      }
    });
  }

  const hideModal = () => {
    setMode(false);
  };

  const handleView = (row) => {
    const recordId = row.id;
    
    if (dataItem && dataItem.records && Array.isArray(dataItem.records)) {
      const originalRecord = dataItem.records.find(record => record.id === recordId);
      
      if (originalRecord) {
        setDetails(originalRecord);
        setMode(true);
        console.log("Original record:", originalRecord);
      } else {
        console.error("Record not found with ID:", recordId);
      }
    } else {
      console.error("No records data available");
    }
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
        (error) => {
          console.error("Error fetching location:", error);
          
          // Handle different error cases
          if (error.code === 1) { // Permission denied
            // Set default location or use the device's location from API
            if (details && details.lat && details.log) {
              setCurrentLocation({
                lat: parseFloat(details.lat),
                lng: parseFloat(details.log)
              });
            } else {
              // Set to a default location (e.g., center of your operational area)
              setCurrentLocation({ lat: 6.5244, lng: 3.3792 }); // Default to Lagos, Nigeria
            }
            
            // Optionally show a friendly message to the user
            Swal.fire({
              icon: 'info',
              title: 'Location Access Denied',
              text: 'We need access to your location to show you nearby information. You can enable this in your browser settings.',
              confirmButtonColor: '#2E3192'
            });
          } else if (error.code === 2) { // Position unavailable
            // Handle position unavailable
            Swal.fire({
              icon: 'error',
              title: 'Location Unavailable',
              text: 'Your location information is currently unavailable.',
              confirmButtonColor: '#2E3192'
            });
          } else if (error.code === 3) { // Timeout
            // Handle timeout
            Swal.fire({
              icon: 'warning',
              title: 'Location Request Timed Out',
              text: 'Please try again later.',
              confirmButtonColor: '#2E3192'
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } 
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      Swal.fire({
        icon: 'error',
        title: 'Geolocation Not Supported',
        text: 'Your browser does not support geolocation features.',
        confirmButtonColor: '#2E3192'
      });
    }
}, [details]);

  // If data is loading or there's an error, show appropriate UI
  // if (loading) {
  //   return <div className="loading-container">Loading dashboard data...</div>;
  // }

  // if (error) {
  //   return (
  //     <div className="error-container">
  //       <h3>Error loading dashboard</h3>
  //       <p>{typeof error === 'string' ? error : 'An unexpected error occurred'}</p>
  //       <button onClick={() => dispatch(dashboardData({ token }))}>Retry</button>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="d-block d-lg-flex justify-content-between p-3 mt-3 text-center">
        <div>
          <h3 style={{color: '#14181F'}}>Welcome {dataItem?.details?.name || 'User'}</h3>
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
      
      <div className="alert-box d-block d-lg-flex justify-content-between p-3" style={{border: "1px solid #FE5B65", borderRadius: "12px"}}>
        <div className='d-flex'>
          <div>
            <img src={Em} alt="" className='mx-3 my-3'/>
          </div>
          <div>
            <div className="d-block d-lg-flex">
              <p style={{color: "#FE5B65", fontWeight: "600", marginRight: "10px", marginBottom: "0"}}>Emergency Alert</p>
              <p style={{color: "#15AC77", fontSize: "14px", background: "#E8F7F1", padding: "5px", marginBottom: "0"}}>
              <FontAwesomeIcon icon={faPhone} className='mx-2'/>Device Number: {dataItem?.notifications?.[dataItem.notifications.length - 1]?.deviceid}
              </p>
            </div>
            <p style={{fontWeight: "600", marginBottom: "0"}}>{dataItem?.notifications?.[dataItem.notifications.length - 1]?.nature_of_request}</p>
            <div className="d-block d-lg-flex">
              <FontAwesomeIcon icon={faCrosshairs} style={{color: "#707A8F", marginRight: "5px", fontSize: "14px", marginTop: "4px"}}/>
              <small style={{color: "#707A8F", marginRight: "15px"}}>Location: {dataItem?.notifications?.[dataItem.notifications.length - 1]?.lat}, {dataItem?.notifications?.[dataItem.notifications.length - 1]?.log}</small>
              <small style={{color: "#707A8F", marginRight: "5px"}}><FontAwesomeIcon icon={faCalendar} /></small>
              <small style={{color: "#707A8F", marginRight: "15px"}}>Date/Time: {dataItem?.notifications?.[dataItem.notifications.length - 1]?.date} | {dataItem?.notifications?.[dataItem.notifications.length - 1]?.time}</small>
              <small style={{color: "#707A8F", marginRight: "5px"}}><FontAwesomeIcon icon={faPhone} /></small>
              <small style={{color: "#707A8F", marginRight: "5px"}}>Accident Type: {' ' + dataItem?.notifications?.[dataItem.notifications.length - 1]?.accident_type}</small>
            </div>
          </div>
        </div>
        <div className='mt-3'>
          <p style={{color: "#FE5B65", background: "#FFEFF0", padding: "7px"}}><img src={War} alt='' /> Severity: {dataItem?.notifications?.[dataItem.notifications.length - 1]?.priority}</p>
        </div>
      </div>

      {/* Card Carousel */}
      <CardCarousel devices={dataItem} />

      <div className="map-section px-3 py-2 mt-5" style={{background: "#fff"}}>
        <p>Device Location</p>
        <LoadScript googleMapsApiKey="AIzaSyC2CKttNS1QGg-S0xkbWhYoA08OHuBWzmY">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={
              currentLocation || 
              (details && details.lat && details.log 
                ? { lat: parseFloat(details.lat), lng: parseFloat(details.log) } 
                : { lat: 6.5244, lng: 3.3792 }) // Default to Lagos, Nigeria
            }
            zoom={10}
          >
            {currentLocation && <Marker position={currentLocation} />}
            {!currentLocation && details && details.lat && details.log && 
              <Marker 
                position={{ lat: parseFloat(details.lat), lng: parseFloat(details.log) }} 
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }}
              />
            }
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="recent-section p-3">
        <p>Recent Emergencies</p>
        {!dataItem || !dataItem.records ? (
          <div>No emergency data available</div>
        ) : (
          <Table 
            columns={columns} 
            data={dataItem.records} 
            onView={handleView}
          />
        )}
      </div>

      {mode && details && (
        <div className="modal-overlay">
          <div className="modal-content2">
            <div className="head-mode">
              <h6 style={{color: '#2E3192'}}>Emergency Details</h6>
              <button className="modal-close" onClick={hideModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-between">
                <img src={Logo} alt="" />
                <p>{details.deviceid || 'N/A'}</p>
              </div>
              <hr />

              <div className="d-block d-lg-flex justify-content-between" style={{gap: '20px'}}>
                <div className='w-100 px-lg-3 px-0 cta' style={{borderRight: '2px solid #e7e8fd'}}>
                  <div className="d-flex justify-content-between">
                    <p>Accident Type: </p>
                    <p>{details.accident_type || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Nature of Request: </p>
                    <p>{details.nature_of_request || 'N/A'}</p>
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
                    <p>{details.log || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Latitude: </p>
                    <p>{details.lat || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Date: </p>
                    <p>{details.date || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Time: </p>
                    <p>{details.time || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Created At: </p>
                    <p>{details.created_at || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Status: </p>
                    <p className={details.closed_status === 0 ? 'Inactive' : 'Active'}>
                      {details.closed_status === 0 ? 'Inactive' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;