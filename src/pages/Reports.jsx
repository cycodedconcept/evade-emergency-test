import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { CrashSeverityCard, CrashTrendsCard, EmergencyChart, SensorHealthChart, PowerSourceChart, SignalStrengthChart } from './reusables/Chart';

const Reports = () => {
  return (
    <>
      <div className="p-3">
        <h4 className='font-weight-bold'>Analytics</h4>
        <p><span className='font-weight-bold' style={{color: '#2E3192'}}>Dashboard</span><FontAwesomeIcon icon={faChevronRight} className='mx-2' style={{color: '#9FA6B4', fontSize: '13px'}}/> <span style={{color: '#707A8F'}}>Analytics</span></p>
      </div>
      <div className="my-4">
        <div className="row">
          <div className="col-md-8">
            <CrashTrendsCard />
          </div>
          <div className="col-md-4">
            <CrashSeverityCard />
          </div>
        </div>
        <div className="p-3">
          <EmergencyChart />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <PowerSourceChart />
        </div>
        <div className="col-md-4">
          <SignalStrengthChart />
        </div>
        <div className="col-md-4">
          <SensorHealthChart />
        </div>
      </div>
    </>
  )
}

export default Reports