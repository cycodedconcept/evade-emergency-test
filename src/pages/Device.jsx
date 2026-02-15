import React, {useState, useEffect, useMemo, useRef} from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import CardCarousel from './reusables/CardCarousel';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useDispatch, useSelector } from 'react-redux';
import { getDevices, addDevice, updateDevice, getDetails, closeDevice } from '../features/deviceSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSliders, faDownload, faTimes, faPen, faPhone, faSquareCheck, faExclamationTriangle, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Table from './reusables/Table';
import Pagination from './reusables/Pagination';
import { Logo2 } from '../assets';
import Swal from 'sweetalert2';

const containerStyle = {
  width: "100%",
  height: "400px",
};


const Device = () => {
    const dispatch = useDispatch();
    const tokenItem = localStorage.getItem("item");
    const token = JSON.parse(tokenItem);
    const { loading, error, devices, detailsItem } = useSelector((state) => state.device);
    const [details, setDetails] = useState({})
    const [mode, setMode] = useState(false)
    const [mode2, setMode2] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [add, setAdd] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [filterItem, setFilterItem] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [deviceData, setDeviceData] = useState({
      device_id: '',
      device_number: '',
      device_ime: '',
      owner_name: '',
      owner_phone_number: '',
      owner_email: '',
      owner_address: '',
      vehicle_name: '',
      vehicle_plate_number: '',
      vehicle_chasses_number: '',
      vehicle_model_year: ''
    })
    const [deviceData2, setDeviceData2] = useState({
      device_id: '',
      device_number: '',
      device_ime: '',
      owner_name: '',
      owner_phone_number: '',
      owner_email: '',
      owner_address: '',
      vehicle_name: '',
      vehicle_plate_number: '',
      vehicle_chasses_number: '',
      vehicle_model_year: ''
    })


    useEffect(() => {
        if (token) {
          dispatch(getDevices({token, page: currentPage}));
        }
    }, [dispatch, token, currentPage]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
      if (detailsItem && Object.keys(detailsItem).length > 0) {
        setDetails(detailsItem);
      }
    }, [detailsItem]);


    const columns = [
        { header: "INDEX", accessor: "index" },
        { header: "DEVICE ID", accessor: "device_id" },
        { header: "NAME", accessor: "owner_name" },
        { header: "DEVICE NUMBER", accessor: "device_number" },
        { header: "IME", accessor: "device_ime" },
        { header: "OWNER PHONE NUMBER", accessor: "owner_phone_number" },
        { header: "OWNER EMAIL", accessor: "owner_email" },
        { header: "STATUS", accessor: "status"},
        { header: "ACTION", accessor: "action" }
    ];

    useEffect(() => {
      if (mode || add) {
          // Save scroll position
          const scrollY = window.scrollY;
          
          // Prevent body scroll
          document.body.style.position = 'fixed';
          document.body.style.top = `-${scrollY}px`;
          document.body.style.width = '100%';
          document.body.style.overflow = 'hidden';
          
          return () => {
              // Restore body scroll
              document.body.style.position = '';
              document.body.style.top = '';
              document.body.style.width = '';
              document.body.style.overflow = '';
              
              // Restore scroll position 
              window.scrollTo(0, scrollY);
          };
      }
    }, [mode, add]);


    const hideModal = () => {
      setMode(false);
      setMode2(false);
      setAdd(false);
      setDetails({})
    }

    // Transform data for the table
    const deviceTableData = [];
    if (devices && devices.devices && devices.devices.data) {
      devices.devices.data.forEach((item, index) => {
          deviceTableData.push({
              index: index + 1,
              device_id: item.device_id || "N/A",
              owner_name: item.owner_name || "N/A",
              device_number: item.device_number || "N/A",
              device_ime: item.device_ime || "N/A",
              owner_phone_number: item.owner_phone_number || "N/A",
              owner_email: item.owner_email || "N/A",
              vehicle_name: item.vehicle_name || "N/A",
              vehicle_plate_number: item.vehicle_plate_number || "N/A",
              owner_address: item.owner_address || "N/A",
              status: item.status || "N/A",
              action: "action",
              id: item.id
          });
      });
    }

    const handleRowClick = (row) => {
      const devId = row.device_id;
      setMode(true)
      console.log(devId)
      dispatch(getDetails({token, device_id: devId}))
      // setDetails(detailsItem);
      console.log(detailsItem)
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setDeviceData(prev => {
        const newData = { ...prev, [name]: value };

        return newData
      })
    }

    const handleChange2 = (e) => {
      const { name, value } = e.target;
      setDeviceData2(prev => {
        const newData = { ...prev, [name]: value };

        return newData
      })
    }

    const handleUpdate = (row) => {
      const updateId = row.id;
      localStorage.setItem("uid", updateId);
      setMode2(true);
      const getData = devices.devices.data.find(upid => upid.id === updateId);
      setDeviceData2({
        device_id: getData.device_id,
        device_number: getData.device_number,
        device_ime: getData.device_ime,
        owner_name: getData.owner_name,
        owner_email: getData.owner_email,
        owner_phone_number: getData.owner_phone_number,
        owner_address: getData.owner_address,
        vehicle_name: getData.vehicle_name,
        vehicle_plate_number: getData.vehicle_plate_number,
        vehicle_model_year: getData.vehicle_model_year,
        vehicle_chasses_number: getData.vehicle_chasses_number
      })
    }

    const handleDeviceUpdate = async (e) => {
      e.preventDefault();
      const getId = localStorage.getItem("uid");

      if (!deviceData2.device_id || !deviceData2.device_number || !deviceData2.device_ime || !deviceData2.owner_name || !deviceData2.owner_email || !deviceData2.owner_phone_number || !deviceData2.owner_address || !deviceData2.vehicle_name || !deviceData2.vehicle_chasses_number || !deviceData2.vehicle_model_year || !deviceData2.vehicle_plate_number) {
        Swal.fire({
          icon: "info",
          title: "update device",
          text: 'All these fields are required!',
          confirmButtonColor: '#2E3192'
        })
        return;
      }

      const formData = new FormData();
      formData.append("id", getId);
      formData.append("device_id", deviceData2.device_id);
      formData.append('device_number', deviceData2.device_number);
      formData.append('device_ime', deviceData2.device_ime);
      formData.append('owner_name', deviceData2.owner_name);
      formData.append('owner_phone_number', deviceData2.owner_phone_number);
      formData.append('owner_email', deviceData2.owner_email);
      formData.append('owner_address', deviceData2.owner_address);
      formData.append('vehicle_name', deviceData2.vehicle_name);
      formData.append('vehicle_plate_number', deviceData2.vehicle_plate_number);
      formData.append('vehicle_chasses_number', deviceData2.vehicle_chasses_number);
      formData.append('vehicle_model_year', deviceData2.vehicle_model_year);

      Swal.fire({
        icon: "success",
        title: "Valid Input!",
        text: "Device is being updated...",
        timer: 1500,
        showConfirmButton: false,
      });

      try {
        Swal.fire({
          title: "Adding Device...",
          text: "Please wait while we process your request.",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
              Swal.showLoading();
          },
        }); 

        const response = await dispatch(updateDevice({token, formData})).unwrap();

        if (response.message === "updated") {
          Swal.fire({
            icon: "success",
            title: "Device Updated!",
            text: `${response.message}`,
          });

          setDeviceData2({
            device_id: '',
            device_number: '',
            device_ime: '',
            owner_name: '',
            owner_phone_number: '',
            owner_email: '',
            owner_address: '',
            vehicle_name: '',
            vehicle_plate_number: '',
            vehicle_chasses_number: '',
            vehicle_model_year: ''
          });

          hideModal();

          dispatch(getDevices({token, page: currentPage}));
        }
        else {
          Swal.fire({
            icon: "info",
            title: "Device Update",
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

    const dStatus = () => {
      setFilterItem(!filterItem)
    }

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!deviceData.device_id || !deviceData.device_number || !deviceData.device_ime || !deviceData.owner_name || !deviceData.owner_email || !deviceData.owner_phone_number || !deviceData.owner_address || !deviceData.vehicle_name || !deviceData.vehicle_chasses_number || !deviceData.vehicle_model_year || !deviceData.vehicle_plate_number) {
        Swal.fire({
          icon: "info",
          title: "adding device",
          text: 'All these fields are required!',
          confirmButtonColor: '#2E3192'
        })
        return;
      }

      const formData = new FormData();
      formData.append("device_id", deviceData.device_id);
      formData.append('device_number', deviceData.device_number);
      formData.append('device_ime', deviceData.device_ime);
      formData.append('owner_name', deviceData.owner_name);
      formData.append('owner_phone_number', deviceData.owner_phone_number);
      formData.append('owner_email', deviceData.owner_email);
      formData.append('owner_address', deviceData.owner_address);
      formData.append('vehicle_name', deviceData.vehicle_name);
      formData.append('vehicle_plate_number', deviceData.vehicle_plate_number);
      formData.append('vehicle_chasses_number', deviceData.vehicle_chasses_number);
      formData.append('vehicle_model_year', deviceData.vehicle_model_year);

      Swal.fire({
        icon: "success",
        title: "Valid Input!",
        text: "Device is being added...",
        timer: 1500,
        showConfirmButton: false,
      });

      try {
        Swal.fire({
          title: "Adding Device...",
          text: "Please wait while we process your request.",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
              Swal.showLoading();
          },
        });
        
        const response = await dispatch(addDevice({token, formData})).unwrap();

        if (response.message === "created") {
          Swal.fire({
            icon: "success",
            title: "Device Added!",
            text: `${response.message}`,
          });

          setDeviceData({
            device_id: '',
            device_number: '',
            device_ime: '',
            owner_name: '',
            owner_phone_number: '',
            owner_email: '',
            owner_address: '',
            vehicle_name: '',
            vehicle_plate_number: '',
            vehicle_chasses_number: '',
            vehicle_model_year: ''
          });

          hideModal();

          dispatch(getDevices({token, page: currentPage}));

        }
        else {
          Swal.fire({
            icon: "info",
            title: "Product Creation",
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
        <div className="text-right">
          <button className='d-btn' onClick={() => setAdd(true)}><span style={{fontSize: '22px', marginRight: '10px'}}>+</span>Add New Device </button>
        </div>
        

        <CardCarousel devices={devices} />

        <div className="recent-section p-3 mt-5" style={{ position: 'relative', paddingBottom: '100px' }}>
          <div className="d-flex justify-content-between">
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
          <button className='fil-btn' onClick={dStatus} style={{ height: '48px', display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon 
              icon={filterItem ? faTimes : faSliders} 
              rotation={filterItem ? 0 : 90} 
              className='mr-2'
            />
            {filterItem ? 'Cancel' : 'Filter'}
          </button>
          </div>
          <div>
            <button className='ex-btn'><FontAwesomeIcon icon={faDownload} className='mr-2'/>Export Data</button>
          </div>
          </div>
          <AnimatePresence>
            {filterItem && (
              <motion.div 
                className="d-block d-lg-flex justify-content-between p-4" 
                style={{
                  gap: '20px', 
                  background: '#fff', 
                  borderRadius: '15px', 
                  border: "2px solid #E8E8E9",
                  marginTop: '15px',
                  overflow: 'hidden'
                }}
                initial={{ 
                  height: 0, 
                  opacity: 0, 
                  y: -20,
                  scale: 0.95
                }}
                animate={{ 
                  height: 'auto', 
                  opacity: 1, 
                  y: 0,
                  scale: 1
                }}
                exit={{ 
                  height: 0, 
                  opacity: 0, 
                  y: -20,
                  scale: 0.95
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <motion.div
                  className="form-group mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <label htmlFor="methods">Methods</label>
                  <select className="form-control">
                    <option>Select...</option>
                    <option>Method 1</option>
                    <option>Method 2</option>
                  </select>
                </motion.div>

                <motion.div
                  className="form-group mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <label htmlFor="status">Status</label>
                  <select className="form-control">
                    <option>Select...</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </motion.div>

                <motion.div
                  className="form-group mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <label htmlFor="date">Date</label>
                  <input type='date' className='fdt form-control'/>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {loading ? (
              <div>Loading devices data...</div>
          ) : error ? (
              <div>Error loading device data: {error}</div>
          ) : deviceTableData.length > 0 ? (
              <>
              <div className='my-5' style={{ marginBottom: '100px' }}>
                <Table columns={columns} data={deviceTableData} actionIcons={['phone', 'map', 'pencil']} onRowClick={handleRowClick} onEdit={handleUpdate}/>
              </div>
              <div className="pagination-container" style={{
                  position: 'fixed',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  width: 'calc(100% - 250px)', 
                  marginLeft: '250px',
                  background: 'white',
                  padding: '8px',
                  boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                  zIndex: '100'
              }}>
                  <Pagination
                  currentPage={parseInt(devices?.devices?.current_page) || 1}
                  lastPage={parseInt(devices?.devices?.last_page) || 1}
                  onPageChange={handlePageChange}
                  nextPageUrl={devices?.devices?.next_page_url}
                  prevPageUrl={devices?.devices?.prev_page_url}
                  totalItems={parseInt(devices?.devices?.total) || 0}
                  perPage={parseInt(devices?.devices?.per_page) || 10}
                  />
              </div>
                  
              </>
          ) : (
              <div>No device data available</div>
          )}
        </div>


        {mode ? (
          <>
            <div className="modal-overlay" onClick={hideModal}>
              <div className="modal-content2 spli" style={{width: '40%'}}  onClick={(e) => e.stopPropagation()}>
                <div className="head-mode d-flex justify-content-between px-4 py-4">
                  <h5 style={{color: '#14181F'}} className='mt-3'><b>Device Details</b></h5>
                  <div className="d-flex">
                    <button className='fil-btn mr-3'><FontAwesomeIcon icon={faPen} className='mr-2'/>Add Note</button>
                    <FontAwesomeIcon icon={faTimes} className="modal-close p-3 fic" onClick={hideModal} style={{border: '2px solid #e8e8e9', borderRadius: '8px'}}/>
                  </div>
                  </div>
                {details ? (
                  <>
                    <div className="modal-body">
                      <div className="device-top px-4 py-3" style={{background: '#EAEAF4'}}>
                        <div className="d-flex justify-content-between mb-3">
                          <h5>Device ID: {details.devicedetails?.device_id || 'N/A'}</h5>
                          <button style={{background: '#2e3192', fontSize: '13px'}} className='btn text-light rounded-pill'>Strong</button>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div>
                            <small className="d-block mb-4" style={{color: '#707A8F'}}>Device Number</small>
                            <p style={{color: '#14181F'}}><FontAwesomeIcon icon={faPhone} className='mr-2'/> {details.devicedetails?.owner_phone_number}</p>
                          </div>
                          <div>
                            <small className="d-block mb-4" style={{color: '#707A8F'}}>Status</small>
                            <p className={details.devicedetails?.status}>{details.devicedetails?.status}</p>
                          </div>
                          <div>
                            <small className="d-block mb-4" style={{color: '#707A8F'}}>Battery</small>
                            <p style={{color: '#14181F'}}>80%</p>
                          </div>
                          <div>
                            <small className="d-block mb-4" style={{color: '#707A8F'}}>LAST CHECK-IN</small>
                            {details?.accident_history && details.accident_history.length > 0 ? (
                              <>
                                {(showAllHistory ? details.accident_history : details.accident_history.slice(0, 3)).map((item) => (
                                  <p key={item.id} style={{marginBottom: '5px'}}>{item.date} {item.time}</p>
                                ))}
                                {details.accident_history.length > 3 && (
                                  <button 
                                    onClick={() => setShowAllHistory(!showAllHistory)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#2E3192',
                                      cursor: 'pointer',
                                      padding: '5px 0',
                                      fontSize: '13px',
                                      fontWeight: '500'
                                    }}
                                  >
                                    {showAllHistory ? 'Show Less' : `Show All (${details.accident_history.length})`}
                                  </button>
                                )}
                              </>
                            ) : (
                              <p className='text-center'>No record</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <p style={{color: '#14181F', fontSize: '18px'}} className='px-4 mt-4'><b>Device Details</b></p>
                      <div className="">
                        <div className='w-100 px-lg-4 px-0 cta'>
                          <div className="d-flex justify-content-between">
                            <p>Device IME: </p>
                            <p>{details.devicedetails?.device_ime || 'N/A'}</p>
                          </div>
                          <div className="d-flex justify-content-between">
                            <p>Installation Date: </p>
                            <p>2025-09-01</p>
                          </div>
                          <div className="d-flex justify-content-between">
                            <p>Firmware Version: </p>
                            <p>1.2.3</p>
                          </div>
                        </div>
                        <div style={{border: '2px solid #eaecf0', borderRadius: '15px'}} className='mx-4 py-3'>
                          <p style={{color: '#14181F'}} className='mx-3'><b>Vehicle Information</b></p>
                          <div className="d-block d-lg-flex justify-content-between" style={{gap: '20px'}}>
                            <div className='w-100 px-lg-3 px-0 cta'>
                              <div className="d-flex justify-content-between">
                                <p>Vehicle Name: </p>
                                <p>{details.devicedetails?.vehicle_name || "N/A"}</p>
                              </div>
                              <div className="d-flex justify-content-between">
                                <p>Type/Model: </p>
                                <p>{details.devicedetails?.vehicle_model_year || "N/A"}</p>
                              </div>
                              <div className="d-flex justify-content-between">
                                <p>Plate Number: </p>
                                <p>{details.devicedetails?.vehicle_plate_number || "N/A"}</p>
                              </div>
                              <div className="d-flex justify-content-between">
                                <p>Vehicle Chases Number </p>
                                <p>{details.devicedetails?.vehicle_chasses_number || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className='mx-4 my-3 py-3' style={{border: '2px solid #eaecf0', borderRadius: '15px'}}>
                          <p style={{color: '#14181F'}} className='mx-3'><b>Owner's Information</b></p>
                          <div className="px-4">
                            <div className="d-flex justify-content-between">
                              <p> Full Name: </p>
                              <p>{details.devicedetails?.owner_name}</p>
                            </div>
                            <div className="d-flex justify-content-between">
                              <p>Email Address: </p>
                              <p>{details.devicedetails?.owner_email}</p>
                            </div>
                            <div className="d-flex justify-content-between">
                              <p>Phone Number: </p>
                              <p>{details.devicedetails?.owner_phone_number}</p>
                            </div>
                            <div className="d-flex justify-content-between">
                              <p>Location: </p>
                              <p>{details.devicedetails?.owner_address}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{border: '2px solid #eaecf0', borderRadius: '15px'}} className='mx-4 py-3'>
                        <p style={{color: '#14181F'}} className='mx-3'><b>Accident Detected</b></p>
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
                      </div>

                      <div style={{border: '2px solid #eaecf0', borderRadius: '15px'}} className='mx-4 py-3 mt-3'>
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

                      <div className="mx-3">
                        <div className="d-flex justify-content-between px-3">
                        <p style={{color: '#14181F'}}><b>Emmergency History</b></p>
                        <button className='btn' style={{color: '#29A5DE'}}>View All</button>
                      </div>
                      <div className="table-content mb-4" style={{backgroundColor: '#fff', border: '1px solid #d3d6dc', borderRadius: '20px'}}>
                        <div className="table-container">
                          <div className="p-0">
                            <table className="my-table w-100 no-lines-table">
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
                  </>
                ) : (
                  <>
                    <p>Loading data</p>
                  </>
                )}

                <div className="mx-3 my-4 d-flex" style={{ gap: '10px' }}>
                  <button className='da-btn'><FontAwesomeIcon icon={faExclamationTriangle} className='mr-2'/>Deactivate Device</button>
                  <button className='exp-btn'><FontAwesomeIcon icon={faPaperPlane} className='mr-2'/>Export Data</button>
                </div>
                
              </div>
            </div>
          </>
        ) : ('')}

        {add ? (
          <>
            <div className="modal-overlay" onClick={hideModal}>
              <div className="modal-content2 spli">
                <div className="head-mode p-3 d-flex justify-content-between">
                  <h6 style={{color: '#2E3192'}}>Add Device Manually</h6>
                  <button className="modal-close" onClick={hideModal}><FontAwesomeIcon icon={faTimes} /> </button>
                </div>
                <hr />
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <h6 className='px-3 py-3'>Device Information</h6>
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Device ID <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter device id' name="device_id" value={deviceData.device_id} onChange={handleChange}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Device Number <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter device number' name='device_number' value={deviceData.device_number} onChange={handleChange}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-12">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Device IME <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter device ime' name='device_ime' value={deviceData.device_ime} onChange={handleChange}/>
                        </div>
                      </div>
                    </div>
                    <h6 className='px-3 py-3'>Owner's Information</h6>
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Owner's Fullname <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter fullname here' name='owner_name' value={deviceData.owner_name} onChange={handleChange}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Owner's Email <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter email here' name='owner_email' value={deviceData.owner_email} onChange={handleChange}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Owner's Phone Number <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter phone here' name='owner_phone_number' value={deviceData.owner_phone_number} onChange={handleChange}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Owner's Address <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter fullname here' name='owner_address' value={deviceData.owner_address} onChange={handleChange}/>
                        </div>
                      </div>
                    </div>
                    <h6 className='px-3 py-3'>Vehicle Information</h6>
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Vehicle name <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter vehicle here' name='vehicle_name' value={deviceData.vehicle_name} onChange={handleChange}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Vehicle Model Year <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter model here' name='vehicle_model_year' value={deviceData.vehicle_model_year} onChange={handleChange}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Plate Number <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter plate number here' name='vehicle_plate_number' value={deviceData.vehicle_plate_number} onChange={handleChange}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Chasses  Number<span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter chasses here' name='vehicle_chasses_number' value={deviceData.vehicle_chasses_number} onChange={handleChange}/>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-3">
                        <div className="form-group mb-4">
                          <button className='ca-btn'><span className='mr-3' style={{fontSize: '20px'}}>x</span>Cancel</button>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-3"></div>
                      <div className="col-sm-12 col-md-12 col-lg-3"></div>
                      <div className="col-sm-12 col-md-12 col-lg-3">
                        <div className="form-group mb-4">
                          <button className='s-btn py-3'>
                            {
                              loading ? (
                              <>
                                <div className="spinner-border spinner-border-sm text-light" role="status">
                                  <span className="sr-only"></span>
                                </div>
                                <span>Adding Device... </span>
                              </>
                              ) : (<b>Submit</b>)
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : ('')}

        {mode2 ? (
          <>
            <div className="modal-overlay">
              <div className="modal-content2">
                <div className="head-mode p-3">
                  <h6 style={{color: '#2E3192'}}>Update Device Manually</h6>
                  <button className="modal-close" onClick={hideModal}>&times;</button>
                </div>
                <hr />
                <div className="modal-body">
                  <form onSubmit={handleDeviceUpdate}>
                    <h6 className='px-3 py-3'>Device Information</h6>
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Device ID <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter device id' name="device_id" value={deviceData2.device_id} onChange={handleChange2}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Device Number <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter device number' name='device_number' value={deviceData2.device_number} onChange={handleChange2}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-12">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Device IME <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter device ime' name='device_ime' value={deviceData2.device_ime} onChange={handleChange2}/>
                        </div>
                      </div>
                    </div>
                    <h6 className='px-3 py-3'>Owner's Information</h6>
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Owner's Fullname <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter fullname here' name='owner_name' value={deviceData2.owner_name} onChange={handleChange2}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Owner's Email <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter email here' name='owner_email' value={deviceData2.owner_email} onChange={handleChange2}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Owner's Phone Number <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter phone here' name='owner_phone_number' value={deviceData2.owner_phone_number} onChange={handleChange2}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Owner's Address <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter fullname here' name='owner_address' value={deviceData2.owner_address} onChange={handleChange2}/>
                        </div>
                      </div>
                    </div>
                    <h6 className='px-3 py-3'>Vehicle Information</h6>
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Vehicle name <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter vehicle here' name='vehicle_name' value={deviceData2.vehicle_name} onChange={handleChange2}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Vehicle Model Year <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter model here' name='vehicle_model_year' value={deviceData2.vehicle_model_year} onChange={handleChange2}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Plate Number <span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter plate number here' name='vehicle_plate_number' value={deviceData2.vehicle_plate_number} onChange={handleChange2}/>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-6">
                        <div className="form-group mb-4">
                          <label htmlFor="exampleInputEmail1">Chasses  Number<span style={{color: '#2E3192'}}>*</span></label>
                          <input type="text" placeholder='Enter chasses here' name='vehicle_chasses_number' value={deviceData2.vehicle_chasses_number} onChange={handleChange2}/>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-12 col-md-12 col-lg-3">
                        <div className="form-group mb-4">
                          <button className='ca-btn'><span className='mr-3' style={{fontSize: '20px'}}>x</span>Cancel</button>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-12 col-lg-3"></div>
                      <div className="col-sm-12 col-md-12 col-lg-3"></div>
                      <div className="col-sm-12 col-md-12 col-lg-3">
                        <div className="form-group mb-4">
                          <button className='s-btn py-3'>
                            {
                              loading ? (
                              <>
                                <div className="spinner-border spinner-border-sm text-light" role="status">
                                  <span className="sr-only"></span>
                                </div>
                                <span>Updating Device... </span>
                              </>
                              ) : (<b>Update</b>)
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : ('')}
      </>
    );
};

export default Device;