import React, {useState, useEffect, useRef} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt, faMessage, faBell } from "@fortawesome/free-regular-svg-icons"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from './Sidebar';
import Card from './Card';
import Emergencies from './Emergencies';
import Reports from './Reports'
import Notifications from './Notifications';
import Responders from './Responders';
import HelpCenter from './helpCenter';
import Subscriptions from './Subscriptions';
// import ApiIntegrationsPage from './Api';
// import RoleUserManagement from './UserManagement';


const Dashboard = () => {
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
  const [dashboardRows, setDashboardRows] = useState([]);
  const [dashboardCompanyName, setDashboardCompanyName] = useState("Responder");
  const [pendingNotificationTarget, setPendingNotificationTarget] = useState(null);

  const cardRef = useRef(null);

  const syncDashboardRows = () => {
    try {
      const storedDash = localStorage.getItem("dash");

      if (!storedDash) {
        setDashboardRows([]);
        setDashboardCompanyName("Responder");
        return;
      }

      const parsedDash = JSON.parse(storedDash);
      setDashboardRows(Array.isArray(parsedDash?.table?.rows) ? parsedDash.table.rows : []);
      setDashboardCompanyName(parsedDash?.company?.company_name || "Responder");
    } catch (error) {
      console.error("Error reading dashboard notifications:", error);
      setDashboardRows([]);
      setDashboardCompanyName("Responder");
    }
  };

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

  useEffect(() => {
    syncDashboardRows();

    const interval = setInterval(syncDashboardRows, 3000);
    window.addEventListener("storage", syncDashboardRows);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncDashboardRows);
    };
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

  useEffect(() => {
    if (activeMenu !== "Dashboard" || !pendingNotificationTarget || !cardRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      cardRef.current.scrollToTable();
      cardRef.current.highlightRow(pendingNotificationTarget);
      setPendingNotificationTarget(null);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeMenu, pendingNotificationTarget]);

  const formatNotificationDate = (notification) =>
    notification?.date_time ||
    [notification?.date, notification?.time].filter(Boolean).join(" | ") ||
    "N/A";

  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return <Card ref={cardRef}/>;
      case "Emergencies":
        return <Emergencies />;
      case "Reports & Analysis":
        return <Reports />; 
      case "Notifications" :
        return <Notifications /> 
      case "Responders" :
        return <Responders />
      case "Help Center" :
        return <HelpCenter />
      case "Subscription & Billing" :
        return <Subscriptions />
      // case "Role/User Management" :
      //   return <RoleUserManagement />
      // case "API Access" :
      //   return <ApiIntegrationsPage />
      default:
        return <Card ref={cardRef}/>;
    }
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    setPendingNotificationTarget(
      notification?.device_number || notification?.emergency_id || null
    );
    setActiveMenu("Dashboard");
  };
  
  return (
    <>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content p-2 p-lg-3">
        <header className='mt-3'>
            {/* <div className="search-container px-3">
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
            </div> */}
            <div className='d-flex justify-content-between align-items-center flex-wrap px-3'>
              {activeMenu === "Dashboard" ? (
                <div>
                  <h5 style={{ color: '#14181F', marginBottom: '4px' }}>
                    Welcome {dashboardCompanyName}
                  </h5>
                  <p style={{ color: '#707A8F', marginBottom: 0 }}>
                    Provides an overview of key metrics
                  </p>
                </div>
              ) : (
                <div />
              )}
              <div ref={notificationRef} style={{ position: "relative" }}>
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
                  {dashboardRows.length}
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
                      {dashboardRows.length > 0 ? (
                        dashboardRows.map((notification, index) => (
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
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div style={{ fontWeight: "bold", color: "#FE5B65" }}>
                              {notification.emergency_id || notification.device_number}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {notification.type || notification.nature_of_request || "No incident type"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#999" }}>
                              {formatNotificationDate(notification)}
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
