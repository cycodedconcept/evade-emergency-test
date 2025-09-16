import React, { useState } from "react";
import BillingHistory from "./billing";

const SideNav = () => {
  const [activeSection, setActiveSection] = useState("subscription");

  const renderContent = () => {
    switch (activeSection) {
      case "subscription":
        return (
          <div>
            <h3>Subscription</h3>
            <p>Manage your subscription details and plans here.</p>
          </div>
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
    <div className="col-md-3 col-lg-3 p-3 py-4 border-right d-flex">
      {/* Sidebar */}
      

       <div className="">
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
            <li className={`nav-item nav-link text-start ${activeSection === "subscription" ? "active" : ""}`}
              onClick={() => setActiveSection("subscription")}>
              <a href="#" className="nav-link bg-blue rounded-lg">
                <i className="bi bi-bell-fill mr-2"></i> 
                Subscription
              </a>
            </li>
            <li className={`nav-item nav-link text-start ${activeSection === "billing" ? "active" : ""}`}
              onClick={() => setActiveSection("billing")}>
              <a href="#" className="nav-link text-blue">
                <i className="bi bi-person-vcard mr-2"></i>
                Billing
              </a>
            </li>
          </ul>
        </div> 

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default SideNav;
