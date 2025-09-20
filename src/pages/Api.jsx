import React from "react";

const ApiIntegrationsPage = () => {
  const integrations = [
    {
      name: "WatchOut Dispatch",
      description: "Direct integration with WatchOut for automatic SOS and crash event dispatch to responders.",
      status: "Connected",
      icon: "bi-broadcast"
    },
    {
      name: "911/Local Emergency API",
      description: "Push high-priority alerts directly to national or regional emergency services.",
      status: "Connected",
      icon: "bi-shield-plus"
    },
    {
      name: "Fire & Medical Services API",
      description: "Send fire and medical emergency alerts instantly to service providers.",
      status: "Not Connected",
      icon: "bi-hospital"
    },
    {
      name: "FleetOps CRM",
      description: "Sync EVADE device data with fleet management systems for real-time monitoring.",
      status: "Connected",
      icon: "bi-truck"
    },
    {
      name: "Geotab",
      description: "Share live location, trip history, and driver behavior scoring with Geotab’s telematics platform.",
      status: "Not Connected",
      icon: "bi-geo-alt"
    },
    {
      name: "Samsara",
      description: "Integrate vehicle safety events into Samsara for advanced analytics and compliance reporting.",
      status: "Connected",
      icon: "bi-diagram-3"
    },
    {
      name: "Allianz Insurance API",
      description: "Send verified crash data to Allianz for faster claim settlements.",
      status: "Not Connected",
      icon: "bi-shield-check"
    },
    {
      name: "AXA Claims Gateway",
      description: "Push real-time incident reports to AXA’s claim verification platform.",
      status: "Connected",
      icon: "bi-journal-check"
    },
    {
      name: "Leadway Assurance API",
      description: "Provide secure, timestamped crash and driver behavior reports for claims validation.",
      status: "Not Connected",
      icon: "bi-shield-lock"
    }
  ];

  return (
    <div className="container-fluid mt-4">
      <h4 className="mb-2">API & Integrations</h4>
      <p className="text-muted">Manage your API keys, webhooks, and third-party integrations.</p>

      {/* Grid of cards */}
      <div className="row">
        {integrations.map((item, index) => (
          <div key={index} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm rounded-lg help-card">
              <div className="card-body">
                <div className=" align-items-center mb-2">
                  <div className=" ">
                    <i className={`bi ${item.icon} fs-3 mr-2`}></i>
                    <i className={`bi bi-three-dots-vertical fs-3 `} style={{float: 'right', cursor: 'pointer'}}></i>
                  </div>
                  <h6 className="card-title mb-0" style={{fontSize: '16px'}}>{item.name}</h6>
                </div>
                <p className="text-muted small">{item.description}</p><hr />
                <div className="d-flex justify-content-between align-items-center">
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-gear me-1"></i> Configure
                  </button>
                  <button className={`btn ${item.status === "Connected" ? "bg-primary" : "bg-light text-dark border"}`}>
                    {item.status}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <small className="text-muted">Page 2 of 16</small>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled"><span className="page-link">«</span></li>
            <li className="page-item"><a className="page-link" href="#">1</a></li>
            <li className="page-item "><span className="page-link">2</span></li>
            <li className="page-item"><a className="page-link" href="#">3</a></li>
            <li className="page-item"><a className="page-link" href="#">4</a></li>
            <li className="page-item"><a className="page-link" href="#">5</a></li>
            <li className="page-item"><span className="page-link">…</span></li>
            <li className="page-item"><a className="page-link" href="#">16</a></li>
            <li className="page-item"><a className="page-link" href="#">»</a></li>
          </ul>
        </nav>
        <div>
          <select className="form-select form-select-sm">
            <option>7 / page</option>
            <option>10 / page</option>
            <option>20 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegrationsPage;