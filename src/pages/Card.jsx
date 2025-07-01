import React, {useState, useEffect, useMemo, useRef} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faCrosshairs, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CardCarousel from './reusables/CardCarousel';
import Table from "./reusables/Table"
import { dashboardData } from '../features/userSlice';
import { getDetails, closeDevice } from '../features/deviceSlice';
import Swal from 'sweetalert2';


import { Em, War, Logo2 } from '../assets';

const containerStyle = {
  width: "100%",
  height: "400px",
};

const Card = () => {
  const dispatch = useDispatch();
  const tokenItem = localStorage.getItem("item");
  const token = tokenItem ? JSON.parse(tokenItem) : null;
  const { loading, error, dataItem } = useSelector((state) => state.user);
  const { detailsItem } = useSelector((state) => state.device);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mode, setMode] = useState(false);
  const [details, setDetails] = useState({});
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [shouldVibrate, setShouldVibrate] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const alertRef = useRef(null);

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


useEffect(() => {
  const currentNotification = dataItem?.notifications?.[dataItem.notifications.length - 1];
  const currentId = currentNotification?.id || currentNotification?.deviceid + currentNotification?.date + currentNotification?.time;
  
  if (currentId && currentId !== lastNotificationId && lastNotificationId !== null) {
    // New notification detected, trigger vibration
    setShouldVibrate(true);
    
    // Play notification sound
    playNotificationSound();
    
    // Alternative: Play audio file instead
    // playAudioFile('/path/to/your/notification-sound.mp3');
    
    // Remove vibration class after animation completes
    setTimeout(() => {
      setShouldVibrate(false);
    }, 1000);
  }
  
  setLastNotificationId(currentId);
}, [dataItem?.notifications, lastNotificationId, audioContext]);


// audio file section
useEffect(() => {
  // Create audio context on first user interaction to comply with browser policies
  const initAudioContext = () => {
    if (!audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
    }
  };

  // Add event listener for first user interaction
  document.addEventListener('click', initAudioContext, { once: true });
  document.addEventListener('touchstart', initAudioContext, { once: true });

  return () => {
    document.removeEventListener('click', initAudioContext);
    document.removeEventListener('touchstart', initAudioContext);
  };
}, [audioContext]);


const playNotificationSound = async () => {
  if (!audioContext) return;
  
  try {
    // Resume audio context if it's suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Create a synthetic alert sound using Web Audio API
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect the nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the sound (urgent alert tone)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High frequency for urgency
    oscillator.type = 'sine';
    
    // Create envelope for the sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Create a second beep for double alert
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator2.type = 'sine';
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.5);
    }, 600);
    
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};






  
  
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
    const recordId = row.deviceid;
    console.log(recordId)
    dispatch(getDetails({token, device_id: recordId}))
    setMode(true); 
    
    // if (dataItem && dataItem.records && Array.isArray(dataItem.records)) {
    //   const originalRecord = dataItem.records.find(record => record.id === recordId);
      
    //   if (originalRecord) {
    //     setDetails(originalRecord);
        // setMode(true);
    //     console.log("Original record:", originalRecord);
    //   } else {
    //     console.error("Record not found with ID:", recordId);
    //   }
    // } else {
    //   console.error("No records data available");
    // }
  };


  useEffect(() => {
    if (detailsItem && Object.keys(detailsItem).length > 0) {
      setDetails(detailsItem);
    }
  }, [detailsItem]);

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

  const mapCenter = useMemo(() => {
        if (currentLocation) {
          return currentLocation;
        }
        
        if (details?.devicedetails?.lat && details?.devicedetails?.log) {
          const lat = parseFloat(details.devicedetails.lat);
          const lng = parseFloat(details.devicedetails.log);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
        
        return { lat: 6.5244, lng: 3.3792 }; // Default
      }, [currentLocation, details?.devicedetails?.lat, details?.devicedetails?.log]);
      
      const markerPosition = useMemo(() => {
        if (currentLocation) return currentLocation;
        
        if (details?.devicedetails?.lat && details?.devicedetails?.log) {
          const lat = parseFloat(details.devicedetails.lat);
          const lng = parseFloat(details.devicedetails.log);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
        
        return null;
      }, [currentLocation, details?.devicedetails?.lat, details?.devicedetails?.log]);

      const closeCase = async (cid) => {
        console.log(cid)
  
        const formData = new FormData();
        formData.append("accident_id", cid);
  
        Swal.fire({
          icon: "success",
          title: "Validing Id!",
          text: "Device is being closed...",
          timer: 1500,
          showConfirmButton: false,
        });
  
        try {
          Swal.fire({
            title: "Closing Device...",
            text: "Please wait while we process your request.",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
          });
  
          const response = await dispatch(closeDevice({token, formData})).unwrap();
  
          if (response.message === "case closed") {
            Swal.fire({
              icon: "success",
              title: "Device Closed!",
              text: `${response.message}`,
            });
  
            hideModal();
          }
          else {
            Swal.fire({
              icon: "info",
              title: "Device status",
              text: `${response.message}`,
            });
          }
        } catch (error) {
          let errorMessage = "Something went wrong";
                  
          if (error && typeof error === "object") {
              if (Array.isArray(error)) {
                  errorMessage = error.map(item => item.message).join(", ");
              } else if (error.message) {
                  errorMessage = error.message;
              } else if (error.response && error.response.data) {
                  errorMessage = Array.isArray(error.response.data) 
                      ? error.response.data.map(item => item.message).join(", ") 
                      : error.response.data.message || JSON.stringify(error.response.data);
              }
          }
      
          Swal.fire({
            icon: "error",
            title: "Error Occurred",
            text: errorMessage,
          });
        }
      }

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
      
      {/* <div className="alert-box d-block d-lg-flex justify-content-between p-3" style={{border: "1px solid #FE5B65", borderRadius: "12px"}}>
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
      </div> */}
      <div 
        ref={alertRef}
        className={`alert-box d-block d-lg-flex justify-content-between p-3 ${shouldVibrate ? 'vibrate-animation' : ''}`}
        style={{border: "1px solid #FE5B65", borderRadius: "12px"}}
      >
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
                <img src={Logo2} alt="" />
              </div>
              <hr />

              <p style={{color: '#2E3192'}}>Device Information</p>
              <div className="">
                <div className='w-100 px-lg-3 px-0 cta'>
                  <div className="d-flex justify-content-between">
                    <p>Device ID: </p>
                    <p>{details.devicedetails?.device_id || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Device IME: </p>
                    <p>{details.devicedetails?.device_ime || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Device Number: </p>
                    <p>{details.devicedetails?.device_number || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Status: </p>
                    <p className={details.devicedetails?.status}>{details.devicedetails?.status}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Longitute: </p>
                    <p>{details.devicedetails?.log || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Latitude: </p>
                    <p>{details.devicedetails?.lat || 'N/A'}</p>
                  </div>
                </div>
                
                <div className='w-100'>
                  
                  <div className="d-flex justify-content-between">
                    <p>Owner Name: </p>
                    <p>{details.devicedetails?.owner_name}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Owner Email: </p>
                    <p>{details.devicedetails?.owner_email}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Owner Phone Number: </p>
                    <p>{details.devicedetails?.owner_phone_number}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Owner Address: </p>
                    <p>{details.devicedetails?.owner_address}</p>
                  </div>
                </div>
              </div>

              <hr />
              <p style={{color: '#2E3192'}}>Vehicle Information</p>
              <div className="d-block d-lg-flex justify-content-between" style={{gap: '20px'}}>
                <div className='w-100 px-lg-3 px-0 cta'>
                  <div className="d-flex justify-content-between">
                    <p>Vehicle Name: </p>
                    <p>{details.devicedetails?.vehicle_name || "N/A"}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Vehicle Year: </p>
                    <p>{details.devicedetails?.vehicle_model_year || "N/A"}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Vehicle Plate Number: </p>
                    <p>{details.devicedetails?.vehicle_plate_number || "N/A"}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Vehicle Chases Number </p>
                    <p>{details.devicedetails?.vehicle_chasses_number || "N/A"}</p>
                  </div>
                </div>
              </div>
              <hr />
              <p style={{color: '#2E3192'}}>Accident Detected</p>
              <div className="d-block d-lg-flex justify-content-between" style={{gap: '20px'}}>
                <div className='w-100 px-lg-3 px-0 cta'>
                  <div className="d-flex justify-content-between">
                    <p>Latitude: </p>
                    <p>{details.accident_detected?.lat || "N/A"}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Longitude: </p>
                    <p>{details.accident_detected?.log || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Accident Type: </p>
                    <p>{details.accident_detected?.accident_type || 'N/A'}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p>Nature Of Request </p>
                    <p>{details.accident_detected?.nature_of_request || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <hr />
              <div className="map-section px-3 py-2 mt-5" style={{background: "#fff"}}>
                <p>Device Location</p>
                  <LoadScript googleMapsApiKey="AIzaSyC2CKttNS1QGg-S0xkbWhYoA08OHuBWzmY">
                  <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={mapCenter}
                      zoom={10}
                    >
                      {markerPosition && (
                        <Marker 
                          position={markerPosition}
                          icon={!currentLocation ? {
                            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                          } : undefined}
                        />
                      )}
                    </GoogleMap>
                  </LoadScript>
              </div>
              <hr />
              <p style={{color: '#2E3192'}}>Accident History</p>
              <div className="table-content">
                <div className="table-container">
                  <table className="my-table">
                    <thead>
                      <tr>
                        <th>Emergency ID</th>
                        <th>Date/Time</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        details?.accident_history && details.accident_history.length > 0 ? (
                          details.accident_history.map((item) => (
                            <tr key={item.id}>
                              <td>{item.deviceid}</td>
                              <td>{item.date}{item.time}</td>
                              <td>{item.accident_type}</td>
                              <td>{item.nature_of_request}</td>
                              <td>{item.priority}</td>
                              <td><button className="btn btn-sm btn-primary" onClick={() => closeCase(item.id)}>Close</button></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7"><p className='text-center'>No History available</p></td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
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