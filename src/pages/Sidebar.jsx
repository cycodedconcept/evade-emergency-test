import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Al, Al2, Ch, Ch2, De, De2, Help, Help2, La, La2, Logo2, Avatar, Bel, Bel2 } from '../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { BsThreeDotsVertical, BsPencil, BsLock, BsBoxArrowRight } from "react-icons/bs";
import { dashboardData } from '../features/userSlice';


const Sidebar = ({ activeMenu, setActiveMenu }) => {
    const dispatch = useDispatch();
    const tokenItem = localStorage.getItem("item");
    const token = tokenItem ? JSON.parse(tokenItem) : null;
    const {dataItem } = useSelector((state) => state.user);
    const [isOpen, setIsOpen] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    
    const menuItems = [
        { name: 'Dashboard', icon: La, activeIcon: La2 },
        { name: 'Emergencies', icon: Al, activeIcon: Al2 },
        { name: 'Device', icon: De, activeIcon: De2 },
        { name: 'Reports & Analysis', icon: Ch, activeIcon: Ch2 },
        { name: 'Notifications', icon: Bel2, activeIcon: Bel }
    ];

    const helpCenterItem = { name: 'Help Center', icon: Help2, activeIcon: Help };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (token) {
            dispatch(dashboardData({token}))
        }
    }, [dispatch, token])

    const MenuItem = ({ item }) => (
        <div
          className={`menu-item d-flex align-items-center px-3 py-2 mb-2 ${activeMenu === item.name ? "active" : ""}`}
          onClick={() => setActiveMenu(item.name)}
          style={{
            cursor: "pointer",
            backgroundColor: activeMenu === item.name ? "#2E3192" : "transparent",
            borderLeft: activeMenu === item.name ? "4px solid #2E3192" : "4px solid transparent",
          }}
        >
          <img src={activeMenu === item.name ? item.activeIcon : item.icon} alt={item.name} style={{ width: "16px", height: "16px", marginRight: '10px' }} />
          <span style={{ color: activeMenu === item.name ? "#fff" : "#707A8F" }}>{item.name}</span>
        </div>
    );

    const handleLogOut = () => {
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

                    <div className="search-container mb-4 px-3">
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
                    </div>
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
                                <img src={Avatar} alt="" />
                                </div>
                                <div className="text-profile">
                                    <p style={{fontSize: "11px", margin: '0'}}>{dataItem?.details?.name || 'User'}<br/> <span style={{fontSize: '9px', color: "707A8F"}}>premium</span></p>
                                </div>
                            </div>
                            <div style={{ position: "relative" }}>
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
              <button className="popup-btn">
                <BsPencil style={{ marginRight: "8px" }} />
                Edit Profile
              </button>
              <button className="popup-btn">
                <BsLock style={{ marginRight: "8px" }} />
                Edit Password
              </button>
              <button className="popup-btn" style={{ color: "red" }} onClick={handleLogOut}>
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