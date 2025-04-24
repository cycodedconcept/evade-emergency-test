import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { dashboardData } from '../features/userSlice';
import Table from "./reusables/Table"
import { Bbel } from '../assets';


const Notifications = () => {
  const dispatch = useDispatch();
  const tokenItem = localStorage.getItem("item");
  const token = tokenItem ? JSON.parse(tokenItem) : null;
  const {loading, error, dataItem } = useSelector((state) => state.user);
  const [show, setShow] = useState(true)

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
  return (
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
       <div className="recent-section p-3">
            <p>Recent Notifications</p>
            {!dataItem || !dataItem.records ? (
            <div>No emergency data available</div>
            ) : (
            <Table 
                columns={columns} 
                data={dataItem.records} 
            />
            )}
        </div>
     </>
    )}
      
    </>
  )
}

export default Notifications