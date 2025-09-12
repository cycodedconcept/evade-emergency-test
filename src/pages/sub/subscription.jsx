import React from "react";

const SubscriptionPage = () => {
  return (
    <div className="container-fluid">
      <div className="row rounded-lg mb-5" style={{backgroundColor: '#fffff'}}>
        {/* Sidebar */}
        <div className="col-md-3 col-lg-3 p-3 py-4 border-right">
          <h5>Subscription & Billing</h5>
          <p className="text-muted tiny-text">
            View all information about subscriptions and billings
          </p>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search..."
          />

          <ul className="nav flex-column">
            <li className="nav-item">
              <a href="#" className="nav-link bg-blue rounded-lg">
                <i className="bi bi-bell-fill mr-2"></i> 
                Subscription
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-blue">
                <i className="bi bi-person-vcard mr-2"></i>
                Billing
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-9 p-3 py-4 mb-4">
          <h5 className="mb-4"><i className="bi bi-person-vcard mr-2"></i>Subscription</h5> <hr />

          {/* Current Plan */}
          <div className="card mb-4 mt-5 border-0 p-2">
            <h6 className="mb-4">Subscription Overview</h6>
            <div className="row justify-content-start align-items-center ">
              <div className="col-md-6 p-0 pe-3">
                <div className="bg-blue help-card p-3 m-0">
                  <span className="me-2 tiny-text"><i className="bi bi-file-fill bg-light p-2 rounded-lg mr-2 text-blue"></i>Current Plan</span>
                  <span className="bg-success rounded-pill border px-2 " style={{fontSize: '12px', float: 'right'}}>Active</span>
                  <h6 className="mt-3">Premium</h6>
                  <small className="" style={{fontSize: '13px', fontWeight: '100'}}>
                    Subscription expires in three months time
                  </small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="help-card border p-3">
                  <span className="tiny-text"><i className="bi bi-file-fill bg-light p-2 rounded-lg mr-2 text-blue"></i>No of Active Devices Covered</span>
                  <h6 className="mt-3">56
                    <span className="text-success small mr-3 ml-1"><i className="bi bi-circle-fill mr-1"></i> 45 Active</span>
                  <span className="text-warning small"><i className="bi bi-circle-fill mr-1"></i> 11 Inactive</span>
                  </h6>
                  
                  <small className="" style={{fontSize: '13px', fontWeight: '100'}}>
                    Devices currently covered under your subscription
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Renewal & Payment */}
          <h5>Renewal & Payment</h5>
          <p className="text-muted small">
            Update your billing details and address.
          </p>

          <div className="row">
            {/* Basic Plan */}
            <div className="col-md-4">
              <div className="card p-3 help-card">
                <h6>Basic</h6>
                <h3>$12 <small className="">/mo</small></h3>
                <p className="small">Per device</p>
                <ul className="list-unstyled small" style={{lineHeight: '2rem'}}>
                  <li>✔ Full library access</li>
                  <li>✔ 20 assets / mo</li>
                  <li>✔ Regular updates</li>
                  <li>✔ Desktop and mobile</li>
                  <li>✔ Premium support</li>
                </ul>
                <button className="btn bg-blue rounded-pill">Subscribe</button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="col-md-4">
              <div className="card help-card p-3">
                <h6>Premium</h6>
                <h3>$32 <small className="">/mo</small></h3>
                <p className="small">Per device</p>
                <ul className="list-unstyled small" style={{lineHeight: '2rem'}}>
                  <li className="">✔ Full library access</li>
                  <li>✔ 30 assets / mo</li>
                  <li>✔ Regular updates</li>
                  <li>✔ Desktop and mobile</li>
                  <li>✔ Premium support</li>
                </ul>
                <button className="btn btn-info text-white rounded-pill">Subscribe</button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="col-md-4">
              <div className="card help-card p-3">
                <h6>Enterprise</h6>
                <h3>Custom</h3>
                <p className="small">Per device</p>
                <ul className="list-unstyled small" style={{lineHeight: '2rem'}}>
                  <li>✔ Full library access</li>
                  <li>✔ Unlimited assets</li>
                  <li>✔ Regular updates</li>
                  <li>✔ Desktop and mobile</li>
                  <li>✔ Premium support</li>
                </ul>
                <button className="btn btn-success rounded-pill">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
