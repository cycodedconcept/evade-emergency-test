import React, {useState, useEffect, useMemo} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { dashboardData } from '../features/userSlice';
import { getDetails } from '../features/deviceSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSliders, faDownload, faChevronRight, faChevronLeft, faPaperPlane, faPen, faSquareCheck, faBullseye } from '@fortawesome/free-solid-svg-icons';
import Table from "./reusables/Table"
import { Bbel, Logo2, Ab } from '../assets';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";


const Notifications = () => {
  const dispatch = useDispatch();
  const tokenItem = localStorage.getItem("item");
  const token = tokenItem ? JSON.parse(tokenItem) : null;
  const {loading, error, dataItem } = useSelector((state) => state.user);
  const { detailsItem } = useSelector((state) => state.device);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [show, setShow] = useState(true)
  const [emer, setEmer] = useState(true);
  const [details, setDetails] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);

  const containerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: '20px'
  };

  useEffect(() => {
    if (token) {
        setShow(false)
        dispatch(dashboardData({token}))
        .unwrap()
        .then(data => {
          console.log('Dashboard data loaded successfully');
        })
        .catch(error => {
          console.error('Failed to load dashboard data:', error);
          
          // Handle authentication errors
          if (typeof error === 'string' && error.includes('Authentication failed')) {
            // You could redirect to login or show error message
            alert('Your session has expired. Please log in again.');
          }
        });
    } else {
      console.error('No token found in localStorage');
    }
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
    // { header: "ACTION", accessor: "action" }
  ];

  // Safe data transformation with error handling
  const formattedTableData = [];
  if (dataItem && dataItem.notifications && Array.isArray(dataItem.notifications)) {
    dataItem.notifications.forEach((item, index) => {
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
        //   action: "action",
          id: item.id
        });
      }
    });
  }

  const handleRowClick = (row) => {
    const devId = row.deviceid;
    console.log(devId)
    dispatch(getDetails({token, device_id: devId}))
    setEmer(false)
  };

  useEffect(() => {
    if (detailsItem && Object.keys(detailsItem).length > 0) {
      setDetails(detailsItem);
    }
  }, [detailsItem]);

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
  return (
    <>
    {emer ? (
      <>

        {show ? (
        <>
            <div className="text-center fig">
                <img src={Bbel} alt="" />
                <h5><b>No Notifications</b></h5>
                <p style={{color: '#707A8F'}}>You’re all caught up! Check back later for updates.</p>
            </div>
        </>
        ) : (
        <>
          <div className="recent-section p-3 mt-5">
              <h4 className='font-weight-bold'>Notifications</h4>
              <p><span className='font-weight-bold' style={{color: '#2E3192'}}>Dashboard</span><FontAwesomeIcon icon={faChevronRight} className='mx-2' style={{color: '#9FA6B4', fontSize: '13px'}}/> <span style={{color: '#707A8F'}}>Notifications</span></p>
              <div className="d-flex justify-content-between mt-4">
                <div className="d-flex mb-3">
                <div className="search-container mr-3">
                <div className="position-relative">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="form-control"
                        style={{ padding: '23px 40px', border: "2px solid #E8E8E9", backgroundColor: "#fff", borderRadius: '10px' }}
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
              <button className='fil-btn'><FontAwesomeIcon icon={faSliders} rotation={90} className='mr-2'/>Filter</button>
              </div>
              {/* <div>
                <button className='ex-btn'><FontAwesomeIcon icon={faDownload} className='mr-2'/>Export Data</button>
              </div> */}
              </div>
              {!dataItem || !dataItem.records ? (
              <div>No emergency data available</div>
              ) : (
              <Table 
                  columns={columns} 
                  data={dataItem.records}
                  onRowClick={handleRowClick}
              />
              )}
            </div>
        </>
        )}
      </>
    ) : (
    <>
      <div className="mt-3">
        <FontAwesomeIcon icon={faChevronLeft} className='px-4 py-3 fic mx-3' style={{border: '2px solid #d3d6dc', borderRadius: '10px'}} onClick={() => setEmer(true)}/>

        <h4 className='mt-5 p-3'>{details.accident_detected?.accident_type}</h4>
        <p className='mx-3'><span className='font-weight-bold' style={{color: '#2E3192'}}>Dasboard</span><FontAwesomeIcon icon={faChevronRight} className='mx-2' style={{color: '#9FA6B4', fontSize: '13px'}}/> <span style={{color: '#2E3192'}} className='font-weight-bold'>Notifications</span><FontAwesomeIcon icon={faChevronRight} className='mx-2' style={{color: '#707A8F', fontSize: '11px'}}/><span>{details?.accident_detected?.deviceid}</span></p>
      </div>

      <div className="row">
        <div className="col-sm-12 col-md-12 col-lg-9">
          <div className="jumbotron" style={{backgroundColor: '#fff', border: '2px solid #d3d6dc', borderRadius: '20px'}}>
            <div className="d-block d-lg-flex justify-content-between mb-5">
              <div className="log">
                <img src={Logo2} alt="" />
              </div>
              <div className="overview">
                <div className="d-flex justify-content-between">
                  <p className={details.devicedetails?.status}>{details.devicedetails?.status}</p>
                </div>
              </div>
            </div>

            {/* <div className="row">
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
            </div> */}

            <div >
              <div className='w-100 px-lg-4 px-0 cta' style={{border: '2px solid #eaecf0', borderRadius: '5px'}}>
                <p style={{color: '#14181F', fontSize: '18px'}} className='mt-4'><b>Details Overview</b></p>
                <div className="d-flex justify-content-between">
                  <p>Vehicle Name </p>
                  <p>{details.devicedetails?.vehicle_name || "N/A"}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p>Date/Time </p>
                  <p>{details.accident_detected?.date}/{details.accident_detected?.time}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p>Impact Force </p>
                  <p>6.2 G (Frontal)</p>
                </div>
              </div>
              <div style={{border: '2px solid #eaecf0', borderRadius: '5px'}} className='py-3 mt-3'>
                <div className="d-flex justify-content-between mb-3">
                <p style={{color: '#14181F'}} className='mx-3'><b>Sensor Health</b></p>
                <button className='vi-btn'>View Details</button>
                </div>
                <div className="d-block d-lg-flex justify-content-between" style={{gap: '20px'}}>
                  <div className='w-100 px-lg-3 px-0 cta'>
                    <div className="d-flex justify-content-between">
                      <p>Impact Sensors: </p>
                      <p><FontAwesomeIcon icon={faSquareCheck} className='rounded mr-2' style={{color: '#F9C146', fontSize: '23px'}}/>8/10 Working</p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p>Water Sensors: </p>
                      <p><FontAwesomeIcon icon={faSquareCheck} className='rounded mr-2' style={{color: '#15AC77', fontSize: '23px'}}/>2/2 Working</p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <p>Somersault Sensors: </p>
                      <p><FontAwesomeIcon icon={faSquareCheck} className='rounded mr-2' style={{color: '#15AC77', fontSize: '23px'}}/>1/1 Working</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between px-3 mt-4">
              <p style={{color: '#14181F'}}><b>Tempar Alert</b></p>
            </div>
            <div className="table-content" style={{backgroundColor: '#fff', border: '1px solid #d3d6dc', borderRadius: '10px'}}>
              <div className="table-container">
                <div className="p-0">
                  <table className="my-table w-100 no-lines-table">
                  <thead>
                    <tr>
                      <th>Tamper Type</th>
                      <th>Battery%</th>
                      <th>Date/Time</th>
                      <th>Location</th>
                      <th>Input P/S</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>input power</td>
                      <td>85%</td>
                      <th>2023-10-01 14:3</th>
                      <td>Lekki</td>
                      <td>Disconected</td>
                      <td>Active</td>
                    </tr>
                    <tr>
                      <td>Battery</td>
                      <td>10%</td>
                      <th>2023-10-01 14:3</th>
                      <td>Ikeja</td>
                      <td>Conected</td>
                      <td>Active</td>
                    </tr>
                  </tbody>
                </table>
                </div>
                
              </div>
            </div>

            {/* <div style={styles.impactSection} className='mt-5'>
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
            </div> */}

            <div className="progress-section p-4 mt-4" style={{background: '#2E3192', borderRadius: '10px'}}>
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
            <button className='sh-btn mb-2'><FontAwesomeIcon icon={faDownload} className='mr-2'/>Export Notification</button>
            <button className='sh-btn mb-2'><FontAwesomeIcon icon={faBullseye} className='mr-2'/>Mark as Resolved</button>
            <button className='sh-btn'><FontAwesomeIcon icon={faPen} className='mr-2'/>Add Notes</button>

          </div>
        </div>
      </div>
    </>
    )}
    </>
  )
}

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

export default Notifications