import React, {useState} from "react";
import Subscription from "./sub/subscription";
import BillingHistory from "./sub/billing";
import SideNav from "./sub/Sidenav";

const SubscriptionPage = () => {
  const [activeSection, setActiveSection] = useState("subscription");
  

  const renderContent = () => {
    switch (activeSection) {
      case "subscription":
        return (
          <Subscription />
        );
      case "billing":
        return (
          <BillingHistory />
        );
      default:
        return null;
    }
  };

  return (
    <div className="">
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
            <li className={`rounded-lg nav-item text-start text-white ${activeSection === "subscription" ? "bg-blue" : ""}`}
              onClick={() => setActiveSection("subscription")}>
              <a href="#" className="nav-link">
                <i className="bi bi-bell-fill mr-2"></i> 
                Subscription
              </a>
            </li>
            <li className={`rounded-lg nav-item text-start ${activeSection === "billing" ? "bg-blue" : ""}`}
              onClick={() => setActiveSection("billing")}>
              <a href="#" className="nav-link">
                <i className="bi bi-person-vcard mr-2"></i>
                Billing
              </a>
            </li>
          </ul>
        </div> 

        {/* Main Content */}
        {renderContent()}
        
      </div>
      
    </div>
  );
};

export default SubscriptionPage;
