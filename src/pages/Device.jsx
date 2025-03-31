import React, {useState, useEffect} from 'react'
import CardComponent from './reusables/CardComponent'
import { useDispatch, useSelector } from 'react-redux';
import { dashboardData } from '../features/userSlice';
import { Com, Pad, Pink, Pink2, Org, Org2, Act, Act2, Logo } from '../assets';

const Device = () => {
    const dispatch = useDispatch();
    const tokenItem = localStorage.getItem("item");
    const token = JSON.parse(tokenItem);
    const {dataItem } = useSelector((state) => state.user);

    useEffect(() => {
        if (token) {
          dispatch(dashboardData({token}))
        }
    }, [dispatch, token])

  return (
    <>
        <div className="text-right my-4">
            <button className='d-btn'><span style={{fontSize: '22px', marginRight: '10px'}}>+</span>Add New Device </button>
        </div>
        <div className="dash-cards">
            <CardComponent 
                title="Online Devices"
                imageBase={Pad}
                image={Com}
                value={dataItem?.counts?.onlinedevice || 0} 
            />

            <CardComponent 
                title="Offline Devices"
                imageBase={Act2}
                image={Act}
                value={dataItem?.counts?.offlinedevice || 0} 
            />

            <CardComponent 
                title="SOS"
                imageBase={Org2}
                image={Org}
                value={dataItem?.counts?.sos || 0} 
            />

            <CardComponent
                title="Accident Detected"
                imageBase={Pink2}
                image={Pink}
                value={dataItem?.counts?.accident_detected || 0} 
            />
        </div>
    </>
  )
}

export default Device