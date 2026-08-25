import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Logo2 } from '../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { BsThreeDotsVertical, BsPencil, BsLock, BsBoxArrowRight } from "react-icons/bs";
import { dashboardMenuItems, helpCenterItem } from '../config/dashboardMenu';


const Sidebar = ({ activeMenu, setActiveMenu }) => {
    const { dataItem, message } = useSelector((state) => state.user);
    const dashboardUserType = useSelector((state) => state.dashboard?.dataItem?.user_type || '');
    const responderProfileUserType = useSelector(
      (state) => state.responder?.responderProfile?.user_type || ''
    );
    const [isOpen, setIsOpen] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const userDetails = dataItem?.details || message?.details || {};
    const currentUserType =
      dashboardUserType ||
      responderProfileUserType ||
      message?.user_type ||
      message?.details?.user_type ||
      dataItem?.user_type ||
      dataItem?.details?.user_type ||
      '';
    const menuItems = dashboardMenuItems.filter((item) => {
        if (!item.allowedUserTypes?.length) {
            return true;
        }

        if (!currentUserType) {
            return true;
        }

        return item.allowedUserTypes.includes(currentUserType);
    });

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleMenuClick = (menuName) => {
        setActiveMenu(menuName);

        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    const MenuItem = ({ item }) => (
        <div
          className={`menu-item d-flex align-items-center px-3 py-2 mb-2 ${activeMenu === item.name ? "active" : ""}`}
          onClick={() => handleMenuClick(item.name)}
          style={{
            cursor: "pointer",
            backgroundColor: activeMenu === item.name ? "#2E3192" : "transparent",
            borderLeft: activeMenu === item.name ? "4px solid #2E3192" : "4px solid transparent",
          }}
        >
          {item.iconComponent ? (
            <FontAwesomeIcon
              icon={activeMenu === item.name ? item.activeIconComponent || item.iconComponent : item.iconComponent}
              style={{
                width: '16px',
                height: '16px',
                marginRight: '10px',
                color: activeMenu === item.name ? '#fff' : '#707A8F',
              }}
            />
          ) : (
            <img src={activeMenu === item.name ? item.activeIcon : item.icon} alt={item.name} style={{ width: "16px", height: "16px", marginRight: '10px' }} />
          )}
          <span style={{ color: activeMenu === item.name ? "#fff" : "#707A8F" }}>{item.name}</span>
        </div>
    );

    const handleLogOut = () => {
        setShowPopup(false);
        localStorage.clear();
        
        window.location.href = '/';
    };
    

    return (
        <>
            <div className="d-block d-md-none position-fixed" style={{ top: '10px', left: '204px', zIndex: '1050' }}>
                <button 
                    className="btn btn-primary" 
                    onClick={toggleSidebar}
                    style={{ backgroundColor: '#2E3192', border: 'none' }}
                >
                    <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
                </button>
            </div>

            <div 
                className={`sidebar ${isOpen ? 'show' : 'hide'}`} 
                style={{
                    width: isOpen ? '250px' : '0',
                    minHeight: '100vh',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s',
                    position: 'fixed',
                    zIndex: '1000',
                    overflow: 'hidden',
                    paddingTop: '20px',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div className="top-section">
                    <div className="sidebar-header mb-4 px-2">
                        <img src={Logo2} alt=''/>
                    </div>

                    {/* <div className="search-container mb-4 px-3">
                        <div className="position-relative">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="form-control rounded-pill"
                                style={{ paddingLeft: '40px', paddingRight: '15px', border: "1px solid #E8E8E9" }}
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
                </div>

                <div className={`sidebar ${isOpen ? "show" : "hide"}`} style={{ width: isOpen ? "250px" : "0" }}>
                    {menuItems.map((item) => (
                        <MenuItem key={item.name} item={item} />
                    ))}
                </div>

                <div className="bottom-section mt-auto px-3 pb-4">
                    <MenuItem item={helpCenterItem} />
                    <div className="separator mb-3" style={{ height: '1px', backgroundColor: '#e0e0e0' }}></div>
                    <div className="profile" style={{ position: "relative" }}>
                        <div className="profile-img d-flex justify-content-between">
                            <div className='d-flex'>
                                <div className='mr-2'>
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            border: '1px solid #E8E8E9',
                                            backgroundColor: '#F5F7FA'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faUser} style={{ color: '#707A8F', fontSize: '16px' }} />
                                    </div>
                                </div>
                                <div className="text-profile mt-3">
                                    <p style={{fontSize: "11px", margin: '0'}} className='fw-bolder'>{userDetails?.name || 'Profile'}<br/></p>
                                </div>
                            </div>
                            <div style={{ position: "relative" }} className='mt-2'>
                            <BsThreeDotsVertical 
                                style={{ cursor: "pointer" }} 
                                onClick={() => setShowPopup(!showPopup)} 
                            />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showPopup && (
            <div 
              className="popup-box"
              style={{
                position: "fixed",
                bottom: "83px",
                left: "184px",
                background: "#fff",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                width: "180px",
                zIndex: 2000
              }}
            >
              {/* <button className="popup-btn" type="button" onClick={handlePopupAction}>
                <BsPencil style={{ marginRight: "8px" }} />
                Edit Profile
              </button>
              <button className="popup-btn" type="button" onClick={handlePopupAction}>
                <BsLock style={{ marginRight: "8px" }} />
                Edit Password
              </button> */}
              <button className="popup-btn" type="button" style={{ color: "red" }} onClick={handleLogOut}>
                <BsBoxArrowRight style={{ marginRight: "8px" }} />
                Sign Out
              </button>
            </div>
          )}

            {isOpen && (
                <div 
                    className="d-block d-md-none" 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: '999'
                    }}
                    onClick={toggleSidebar}
                />
            )}
            
            {/* Add some media queries for responsiveness */}
            <style jsx>{`
                @media (min-width: 768px) {
                    .sidebar {
                        width: ${isOpen ? '250px' : '0'} !important;
                    }
                    
                    .main-content {
                        margin-left: ${isOpen ? '250px' : '0'};
                        transition: all 0.3s;
                    }
                }
                
                @media (max-width: 767px) {
                    .sidebar {
                        width: ${isOpen ? '250px' : '0'} !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;
