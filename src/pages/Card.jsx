import React, {useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faCrosshairs, faCalendar, faCarCrash, faPaperPlane, faDownload, faPrint, faPen } from '@fortawesome/free-solid-svg-icons';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CardCarousel from './reusables/CardCarousel';
import Table from "./reusables/Table"
import { dashboardData } from '../features/userSlice';
import { getDetails, closeDevice } from '../features/deviceSlice';
import Swal from 'sweetalert2';


import { Em, War, Logo2, Ab } from '../assets';

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: '20px'
};

const Card = forwardRef((props, ref) => {
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
  const [showMainAlert, setShowMainAlert] = useState(true);
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const emergenciesTableRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // New states for popup notifications
  const [activePopups, setActivePopups] = useState([]);
  const [processedNotifications, setProcessedNotifications] = useState(new Set());
  const [emer, setEmer] = useState(true);
  
  const alertRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToTable: () => {
      if (emergenciesTableRef.current) {
        emergenciesTableRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    },
    highlightRow: (deviceId) => {
      setTimeout(() => {
        const tableRows = document.querySelectorAll('table tbody tr');
        tableRows.forEach(row => {
          const deviceIdCell = row.querySelector('td:nth-child(2)');
          if (deviceIdCell && deviceIdCell.textContent.trim() === deviceId) {
            row.style.backgroundColor = '#fffbf0';
            row.style.border = '2px solid #FE5B65';
            row.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
              row.style.backgroundColor = '';
              row.style.border = '';
            }, 3000);
          }
        });
      }, 500);
    }
  }));

   const impactData = [
    { id: 1, area: "Left Front Door", level: "High" },
    { id: 2, area: "INC001", level: "Medium" },
    { id: 3, area: "INC001", level: "Low" }
  ];

  const getLevelColor = (level) => {
    switch(level.toLowerCase()) {
      case 'high': 
        return {  color: '#dc2626' };
      case 'medium': 
        return { color: '#2563eb' };
      case 'low': 
        return { color: '#ea580c' };
      default: 
        return { color: '#374151' };
    }
  };

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
  if (!dataItem?.notifications || dataItem.notifications.length === 0) return;

  // Check for new notifications that weren't processed yet
  const newNotifications = dataItem.notifications.filter(notification => {
    const notificationId = notification.id || `${notification.deviceid}_${notification.date}_${notification.time}`;
    return !processedNotifications.has(notificationId);
  });

  if (newNotifications.length > 0) {
    // Process each new notification
    newNotifications.forEach(notification => {
      const notificationId = notification.id || `${notification.deviceid}_${notification.date}_${notification.time}`;
      
      // Add to processed set
      setProcessedNotifications(prev => new Set([...prev, notificationId]));
      
      // Add to visible notifications with auto-remove timer
      const notificationWithTimer = {
        ...notification,
        notificationId,
        timestamp: Date.now(),
        shouldVibrate: true
      };

      setVisibleNotifications(prev => [...prev, notificationWithTimer]);

      // Auto-remove from visible notifications after 15 seconds
      setTimeout(() => {
        setVisibleNotifications(prev => 
          prev.filter(item => item.notificationId !== notificationId)
        );
      }, 15000);

      // Stop vibration after 2 seconds
      setTimeout(() => {
        setVisibleNotifications(prev => 
          prev.map(item => 
            item.notificationId === notificationId 
              ? { ...item, shouldVibrate: false }
              : item
          )
        );
      }, 2000);

      // Create popup (keep your existing popup logic)
      triggerNotificationPopup(notification);
    });

    // Play sound for new notifications (only once even if multiple)
    playNotificationSound();
  }
}, [dataItem?.notifications]);

const closeMainNotification = (notificationId) => {
  setVisibleNotifications(prev => 
    prev.filter(item => item.notificationId !== notificationId)
  );
};

// Function to create notification popup
const triggerNotificationPopup = (notification) => {
  const popupId = `popup-${Date.now()}-${Math.random()}`;
  const newPopup = {
    ...notification,
    popupId,
    timestamp: Date.now(),
    shouldVibrate: true
  };

  setActivePopups(prev => [...prev, newPopup]);

  // Auto-remove after 20 seconds
  setTimeout(() => {
    setActivePopups(prev => prev.filter(popup => popup.popupId !== popupId));
  }, 20000);

  // Stop vibration after 2 seconds
  setTimeout(() => {
    setActivePopups(prev => 
      prev.map(popup => 
        popup.popupId === popupId 
          ? { ...popup, shouldVibrate: false }
          : popup
      )
    );
  }, 2000);
};

// Function to manually close a popup
const closeNotificationPopup = (popupId) => {
  setActivePopups(prev => prev.filter(popup => popup.popupId !== popupId));
};

// Original notification effect for the main alert box
useEffect(() => {
  const currentNotification = dataItem?.notifications?.[dataItem.notifications.length - 1];
  const currentId = currentNotification?.id || currentNotification?.deviceid + currentNotification?.date + currentNotification?.time;
  
  if (currentId && currentId !== lastNotificationId && lastNotificationId !== null) {
    // New notification detected, trigger vibration for main alert
    setShouldVibrate(true);
    
    // Remove vibration class after animation completes
    setTimeout(() => {
      setShouldVibrate(false);
    }, 1000);
  }
  
  setLastNotificationId(currentId);
}, [dataItem?.notifications, lastNotificationId]);

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
    // setMode(true); 
    setEmer(false)
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
              setCurrentLocation({ lat: '', lng: '' }); // Default to Lagos, Nigeria
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
          const lat = parseFloat(details?.devicedetails?.lat);
          const lng = parseFloat(details?.devicedetails?.log);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
        
        return { lat: parseFloat(details?.devicedetails?.lat), lng: parseFloat(details?.devicedetails?.log) }; // Default
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

  // get map center
  const getMapCenter = () => {
  if (currentLocation) return currentLocation;
  
  const lat = localStorage.getItem('lat');
  const lng = localStorage.getItem('log');
  
  if (lat && lng) {
    return { 
      lat: parseFloat(lat), 
      lng: parseFloat(lng) 
    };
  }
  
  // Default fallback
  return { lat: 6.5244, lng: 3.3792 };
};

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
  
  useEffect(() => {
    if (dataItem?.notifications && dataItem.notifications.length > 0) {
      setShowMainAlert(true);
    }
  }, [dataItem?.notifications?.[dataItem?.notifications?.length - 1]?.id]);

  console.log(details)

  return (
    <>

    {emer ? (
      <>
        <div className="d-block d-lg-flex justify-content-between p-3 mt-3">
        <div>
          <h3 style={{color: '#14181F'}}>Welcome {dataItem?.details?.name || 'User'}</h3>
          <p style={{color: '#707A8F'}}>Provides an overview of key metrics</p>
        </div>
      </div>
      
      

      {dataItem?.notifications && dataItem.notifications.length > 0 && showMainAlert && (
        <div className="notifications-container">
          {(() => {
            // Get the last notification
            const lastNotification = dataItem.notifications[dataItem.notifications.length - 1];
            localStorage.setItem("lat", lastNotification.lat)
            localStorage.setItem("log", lastNotification.log)
            
            return (
              <div 
                key={lastNotification.id || `${lastNotification.deviceid}_${lastNotification.date}_${lastNotification.time}`}
                className={`alert-box d-block d-lg-flex justify-content-between p-3 mb-3 ${shouldVibrate ? 'vibrate-animation' : ''}`}
                style={{
                  border: "1px solid #FE5B65", 
                  borderRadius: "12px",
                  position: 'relative',
                  animation: `slideIn 0.3s ease-out both`
                }}
              >
                <div className='d-flex'>
                  <div>
                    <img src={Em} alt="" className='mx-3 my-3'/>
                  </div>
                  <div>
                    <div className="d-block d-lg-flex">
                      <p style={{color: "#FE5B65", fontWeight: "600", marginRight: "10px", marginBottom: "0"}}>Emergency Alert</p>
                      <p style={{color: "#15AC77", fontSize: "14px", background: "#E8F7F1", padding: "5px", marginBottom: "0"}}>
                        <FontAwesomeIcon icon={faPhone} className='mx-2'/>Device Number: {lastNotification.deviceid}
                      </p>
                    </div>
                    <p style={{fontWeight: "600", marginBottom: "0"}}>{lastNotification.nature_of_request}</p>
                    <div className="d-block d-lg-flex">
                      <FontAwesomeIcon icon={faCrosshairs} style={{color: "#707A8F", marginRight: "5px", fontSize: "14px", marginTop: "4px"}}/>
                      <small style={{color: "#707A8F", marginRight: "15px"}}>Location: {lastNotification.lat}, {lastNotification.log}</small>
                      <small style={{color: "#707A8F", marginRight: "5px"}}><FontAwesomeIcon icon={faCalendar} /></small>
                      <small style={{color: "#707A8F", marginRight: "15px"}}>Date/Time: {lastNotification.date} | {lastNotification.time}</small>
                      <small style={{color: "#707A8F", marginRight: "5px"}}><FontAwesomeIcon icon={faCarCrash} /></small>
                      <small style={{color: "#707A8F", marginRight: "5px"}}>Accident Type: {lastNotification.accident_type}</small>
                    </div>
                  </div>
                </div>
                <div className='mt-3'>
                  <p style={{color: "#FE5B65", background: "#FFEFF0", padding: "7px"}}>
                    <img src={War} alt='' /> Severity: {lastNotification.priority}
                  </p>
                </div>
                {/* Close button */}
                <button 
                  onClick={() => setShowMainAlert(false)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '20px',
                    color: '#FE5B65',
                    cursor: 'pointer'
                  }}
                >
                  &times;
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Card Carousel */}
      <CardCarousel devices={dataItem} />

      <div className="map-section px-4 py-4 mt-5" style={{backgroundColor: '#fff', border: '1px solid #d3d6dc', borderRadius: '20px'}}>
        <h5>Device Location</h5>

        <LoadScript googleMapsApiKey="AIzaSyC2CKttNS1QGg-S0xkbWhYoA08OHuBWzmY">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={
              currentLocation || 
              (() => {
                const lat = localStorage.getItem('lat');
                const lng = localStorage.getItem('log');
                return lat && lng 
                  ? { lat: parseFloat(lat), lng: parseFloat(lng) } 
                  : { lat: '', lng: '' }; // Default fallback
              })()
            }
            zoom={10}
          >
            {currentLocation && <Marker position={currentLocation} />}
            {!currentLocation && details && details.lat && details.log && 
              <Marker 
                position={{ lat: parseFloat(lat), lng: parseFloat(log) }} 
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }}
              />
            }
          </GoogleMap>
        </LoadScript>
      </div>

      <div ref={emergenciesTableRef} className="recent-section p-3">
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
      ) : (
      <>
        <div className="mt-3">
          <button className='p-3 d-btn mx-3' onClick={() => setEmer(true) }>Back to dashboard</button>

          <h4 className='mt-5 p-3'>Emergency: {details.accident_detected?.deviceid}</h4>
        </div>

        <div className="row">
          <div className="col-sm-12 col-md-12 col-lg-9">
            <div className="jumbotron" style={{backgroundColor: '#fff', border: '2px solid #d3d6dc', borderRadius: '20px'}}>
              <div className="d-block d-lg-flex justify-content-between mb-5">
                <div className="log">
                  <img src={Logo2} alt="" />
                </div>
                <div className="overview">
                  <h4>Emergency Overview</h4>
                  <div className="d-flex justify-content-between">
                    <p style={{color: '#707A8F'}}>Emergency ID: </p>
                    <small className="d-block">{details.accident_detected?.deviceid}</small>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p style={{color: '#707A8F'}}>Emergency Date</p>
                    <small className="d-block">{details.accident_detected?.date}</small>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p style={{color: '#707A8F'}}>Emergency Time</p>
                    <small className="d-block">{details.accident_detected?.time}</small>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p style={{color: '#707A8F'}}>Type</p>
                    <small className="d-block">{details.accident_detected?.accident_type}</small>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p style={{color: '#707A8F'}}>Severity</p>
                    <small className="d-block">{details.accident_detected?.priority}</small>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p style={{color: '#707A8F'}}>Status</p>
                    <p className={details.devicedetails?.status}>{details.devicedetails?.status}</p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-12 col-md-12 col-lg-6">
                  <h4>Emergency Details</h4>
                  <hr />
                  <h4><b>Device Info</b></h4>
                  <h6 style={{color: '#707A8F'}}>Device ID: {details.devicedetails?.device_id || 'N/A'}</h6>
                  <h6 style={{color: '#707A8F'}}>Device Number: {details.devicedetails?.device_number || 'N/A'}</h6>
                  <h6 style={{color: '#707A8F'}}>Device IMEI: {details.devicedetails?.device_ime || 'N/A'}</h6>

                  <h4 className="mt-5">Emergency Timeline</h4>
                  <h6 style={{color: '#707A8F'}}>14:30: Emergency detected</h6>
                  <h6 style={{color: '#707A8F'}}>14:31: SOS button pressed</h6>
                  <h6 style={{color: '#707A8F'}}>14:32: Alert sent to server</h6>
                  <h6 style={{color: '#707A8F'}}>14:33: Device called by Agent</h6>
                </div>
                <div className="col-sm-12 col-md-12 col-lg-6">
                  <h4>Owner's Information</h4>
                  <hr />
                  <h4><b>Owner Info</b></h4>
                  <h6 style={{color: '#707A8F'}}>Full Name: {details.devicedetails?.owner_name}</h6>
                  <h6 style={{color: '#707A8F'}}>Phone Number: {details.devicedetails?.owner_phone_number}</h6>
                  <h6 style={{color: '#707A8F'}}>Email Address: {details.devicedetails?.owner_email}</h6>
                  <h6 style={{color: '#707A8F'}}>Contact Address: {details.devicedetails?.owner_address}</h6>


                  <h4 className="mt-5">Vehicle Info</h4>
                  <h6 style={{color: '#707A8F'}}>Vehicle Name: {details.devicedetails?.vehicle_name || "N/A"}</h6>
                  <h6 style={{color: '#707A8F'}}>Type/Model: {details.devicedetails?.vehicle_model_year || "N/A"}</h6>
                  <h6 style={{color: '#707A8F'}}>Plate Number: {details.devicedetails?.vehicle_plate_number || "N/A"}</h6>
                  <h6 style={{color: '#707A8F'}}>Vehicle Identification Number (VIN): {details.devicedetails?.vehicle_chasses_number || "N/A"}</h6>
                </div>
              </div>

              <div style={styles.impactSection} className='mt-5'>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Impacts on Vehicle</h2>
              </div>
              
              <div style={styles.impactContainer}>
                <div style={styles.impactHeader}>
                  <span style={styles.headerText}>Area of Impact</span>
                  <span style={styles.headerText}>Level of Impact</span>
                </div>
                
                <div style={styles.impactList}>
                  {impactData.map((impact, index) => (
                    <div 
                      key={impact.id || index}
                      style={{
                        ...styles.impactItem,
                        ...(hoveredItem === index ? styles.impactItemHover : {})
                      }}
                      onMouseEnter={() => setHoveredItem(index)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span style={styles.areaName}>{impact.area}</span>
                      <span 
                        style={{
                          ...styles.impactLevel,
                          ...getLevelColor(impact.level),
                          ...(hoveredItem === index ? styles.impactLevelHover : {})
                        }}
                      >
                        {impact.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              </div>

              <div className="progress-section p-4" style={{background: '#2E3192', borderRadius: '10px'}}>
                <div className="d-flex justify-content-between">
                  <div className="d-flex">
                    <img src={Ab} alt="" />
                    <small className="d-block text-light ml-3">Emergency Location</small>
                  </div>
                  <div>
                    <small className="d-block text-light">En Route (ETA: 20 minutes)</small>
                  </div>
                </div>

                <div className="pl-5">
                  <small className="d-block text-light">Distance: 3.5km</small>
                  <div className="progress" style={{height: '5px'}}>
                    <div className="progress-bar" role="progressbar" style={{width: '5%'}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                </div>
              </div>
              <div className="mt-2">
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
            </div>
          </div>
          <div className="col-sm-12 col-md-12 col-lg-3">
            <div className="p-3 text-center" style={{backgroundColor: '#fff', border: '2px solid #d3d6dc', borderRadius: '20px'}}>
              <button className='sh-btn mb-2'><FontAwesomeIcon icon={faPaperPlane} className='mr-2'/>Share Details</button>
              <button className='sh-btn mb-2'><FontAwesomeIcon icon={faDownload} className='mr-2'/>Export Emergency</button>
              <button className='sh-btn mb-2'><FontAwesomeIcon icon={faPrint} className='mr-2'/>Update Status</button>
              <button className='sh-btn'><FontAwesomeIcon icon={faPen} className='mr-2'/>Add Notes</button>

            </div>
          </div>
        </div>
      </>
      )}
      
    </>
  );
});

const styles = {
  // VEHICLE IMPACT SECTION STYLES
  impactSection: {
    width: '100%',
    margin: '0 auto 40px',
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #d3d6dc'
  },
  sectionHeader: {
    padding: '30px 40px 20px',
    borderBottom: '2px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0'
  },
  impactContainer: {
    padding: '30px 40px',
    borderRadius: '12px',
    margin: '40px',
    border: '2px solid #d3d6dc'
  },
  impactHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '1px solid #d1d5db'
  },
  headerText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#6b7280',
    letterSpacing: '0.5px'
  },
  impactList: {
    display: 'flex',
    flexDirection: 'column',
  },
  impactItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  impactItemHover: {
    // backgroundColor: '#f9fafb',
    paddingLeft: '10px',
    marginLeft: '-10px',
    marginRight: '-10px',
    borderRadius: '8px'
  },
  areaName: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#374151'
  },
  impactLevel: {
    fontSize: '16px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease'
  },
  impactLevelHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  },
};

export default Card;