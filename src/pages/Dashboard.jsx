import React, {useState, useEffect, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt, faMessage, faBell } from "@fortawesome/free-regular-svg-icons"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from './Sidebar';
import Card from './Card';
import Emergencies from './Emergencies';
import Reports from './Reports'
import Device from './Device';
import Notifications from './Notifications';
import { dashboardData } from '../features/userSlice';
import HelpCenter from './helpCenter';


const Dashboard = () => {
  const {loading, error, dataItem } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const tokenItem = localStorage.getItem("item");
  const token = JSON.parse(tokenItem)
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({
    name: "Nigeria",
    flag: "https://flagcdn.com/w40/ng.png",
  });

  const cardRef = useRef(null);


  useEffect(() => {
    if (!token) return;
  
    // Initial call
    dispatch(dashboardData({token}));
  
    // Set up interval for subsequent calls
    const intervals = setInterval(() => {
      dispatch(dashboardData({token}));
    }, 20000);
  
    return () => clearInterval(intervals);
  }, [dispatch, token])


  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data) => {
        const countryList = data.map((country) => ({
          name: country.name.common,
          flag: country.flags.svg,
        }));
        setCountries(countryList);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);



  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setShowPopup(false);
  };

  const iconStyle = {
    fontSize: "16px",
    cursor: "pointer",
    padding: "10px",
  };

  const notifications = dataItem?.notifications?.map((item) => (
    <div className="card-item" key={item.id}>
      <div className="d-flex justify-content-between">
        <p>Device ID:</p>
        <p>{item.deviceid}</p>
      </div>
      <div className="d-flex justify-content-between">
        <p style={{fontSize: '10px'}}>Accident Type:</p>
        <small style={{fontSize: '10px'}}>{item.accident_type}</small>
      </div>
      <div className="d-flex justify-content-between">
        <p style={{fontSize: '10px'}}>Nature of request:</p>
        <small style={{fontSize: '10px'}}>{item.nature_of_request}</small>
      </div>
    </div>
  ))

  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return <Card ref={cardRef}/>;
      case "Emergencies":
        return <Emergencies />;
      case "Device":
        return <Device />;
      case "Reports & Analysis":
        return <Reports />;
      case "Notifications" :
        return <Notifications /> 
      case "Help Center" :
        return <HelpCenter />
      default:
        return <Card ref={cardRef}/>;
    }
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    
    // Use the ref to Card component instead
    if (cardRef.current) {
      cardRef.current.scrollToTable();
      cardRef.current.highlightRow(notification.deviceid);
    }
  };
  
  return (
    <>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content p-3">
        <header className='d-flex justify-content-between'>
            <div className="search-container px-3">
              <div className="position-relative">
                  <input 
                      type="text" 
                      placeholder="Search..." 
                      className="form-control"
                      style={{ paddingLeft: '40px', paddingRight: '15px', border: "1px solid #E8E8E9", backgroundColor: "#fff" }}
                  />
                  <FontAwesomeIcon 
                      icon={faSearch} 
                      className="position-absolute"
                      style={{ 
                          left: '15px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          color: '#707A8F'
                      }}
                  />
              </div>
            </div>
            <div className='d-flex justify-content-between'>
              <div ref={notificationRef} style={{ position: "relative", marginLeft: "15px" }}>
                <FontAwesomeIcon
                  icon={faBell}
                  style={iconStyle}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className='icon-hover'
                />

                <span
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    background: "#FE5B65",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "bold",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                >
                  {dataItem?.notifications?.length}
                </span>

                {showNotifications && (
                  <div
                    style={{
                      position: "absolute",
                      top: "35px",
                      right: "0",
                      width: "250px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      background: "white",
                      borderRadius: "10px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      zIndex: "1000",
                      padding: "5px",
                    }}
                  >
                    <h6 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
                      Notifications
                    </h6>
                    <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                      {dataItem?.notifications?.length > 0 ? (
                        dataItem.notifications.map((notification, index) => (
                          <li
                            key={notification.id || index}
                            style={{
                              padding: "8px",
                              fontSize: "13px",
                              borderBottom: "1px solid #ddd",
                              cursor: "pointer",
                              borderRadius: "5px",
                              transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                            }}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div style={{ fontWeight: "bold", color: "#FE5B65" }}>
                              Device: {notification.deviceid}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {notification.nature_of_request}
                            </div>
                            <div style={{ fontSize: "11px", color: "#999" }}>
                              {notification.date} | {notification.time}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li style={{ padding: "8px", fontSize: "13px" }}>No new notifications</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
        </header>
        {renderContent()}
      </div>
        
    </>
  )
}

export default Dashboard