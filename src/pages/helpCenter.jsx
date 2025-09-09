import 'bootstrap/dist/css/bootstrap.min.css';


const HelpCenter = () => {
  return (
    <div className="px-1 py-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4 help-card">
            <div className="card-body">
              <h5 className="card-title">Search</h5>
              <input
                type="search"
                className="form-control mb-2 rounded-lg"
                placeholder="Search articles..."
              />
              <div>
                <span style={{fontSize: '15px', fontWeight: '600'}}>Recents: </span>
                {["Installation", "Emergencies", "SOS Button", "Status", "Reports"].map((tag, i) => (
                  <span key={i} className="badge text-dark me-5 p-2 rounded-pill fw-lighter" style={{marginRight: '8px',backgroundColor: 'rgba(231, 228, 232, 1)'}}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card help-card">
            <div className="card-body">
              <h5 className="card-title mb-1">Popular Topics</h5>
              <small className="mt-0 pt-0 mb-4 pb-5">Topics based on category</small>
              <div className="row justify-content-between gap-3 py-4 mt-4" style={{justifyContent: 'space-between', marginTop: '150px'}}>
                <div className="col-6 col-lg-4 mb-3">
                  <div className="p-3 border bg-white help-card m-0">
                    <i className="bi bi-box-arrow-in-right bg-secondary rounded-circle p-2 text-white fw-5 mb-4" style={{fontSize: '19px'}}></i>
                    <p className="mb-1 mt-3 help-p">Get Started</p>
                    <small className="light-font">8 Articles</small>
                  </div>
                </div>
                <div className="col-6 col-lg-4 mb-3 ">
                  <div className="p-3 border help-card bg-white">
                    <i className="bi bi-question-circle bg-primary rounded-circle p-2 text-white fw-5 mb-4" style={{fontSize: '19px'}}></i>
                    <p className="mb-1 fw-bold mt-3 help-p">FAQs</p>
                    <small>8 Articles</small>
                  </div>
                </div>
                <div className="col-6 col-lg-4 mb-3">
                  <div className="p-3 border bg-white help-card">
                    <i className="bi bi-journal-text fs-3 bg-danger rounded-circle p-2 text-white w-10 fw-5 mb-4" style={{fontSize: '19px'}}></i>
                    <p className="mb-1 fw-bold mt-3 help-p">User Guides</p>
                    <small>8 Articles</small>
                  </div>
                </div>
                <div className="col-6 col-lg-4 mb-3">
                  <div className="p-3 border help-card bg-white">
                    <i className="bi bi-tools fs-3 bg-warning rounded-circle p-2 text-white w-10 pe-5 fw-5 mb-4" style={{fontSize: '19px'}}></i>
                    <p className="mb-1 fw-bold mt-3 help-p">Troubleshooting</p>
                    <small>4 Articles</small>
                  </div>
                </div>
                <div className="col-6 col-lg-4 mb-3">
                  <div className="p-3 border help-card bg-white">
                    <i className="bi bi-chat-left-text bg-success rounded-circle p-2 text-white mb-4" style={{fontSize: '19px'}}></i>
                    <p className="mb-1 fw-bold mt-3 help-p">Feedback/Suggestion</p>
                    <small>6 Articles</small>
                  </div>
                </div>
                <div className="col-6 col-lg-4 mb-3">
                  <div className="p-3 border help-card bg-white">
                    <i className="bi bi-telephone fs-3 bg-warning rounded-circle p-2 text-white w-10 fw-5 mb-4" style={{fontSize: '19px'}}></i>
                    <p className="mb-1 fw-bold mt-3 help-p">Contact Support</p>
                    <small>12 Articles</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {/* Tickets */}
          <div className="card mb-4 help-card">
            <div className="card-body pb-0 mb-0">
              <h6 className="card-title mb-0 pb-0">Your Tickets</h6>
              <small className='tiny-text '>Your recent tickets</small>
              <ul className="nav mt-4 pt-3 mb-3 row justify-content-between align-items-center border-bottom">
                <li className="ticket col-lg-4 ticket-active text-center pb-2">
                  <a className="ticket-link text-center tiny-text" href="#">
                    Open
                  </a>
                </li>
                <li className="ticket col-lg-4 text-center pb-2">
                  <a className="ticket-link tiny-text text-center" href="#">
                    Feedback
                  </a>
                </li>
                <li className="ticket col-lg-4 text-center pb-2">
                  <a className="ticket-link tiny-text text-center" href="#">
                    Closed
                  </a>
                </li>
              </ul>
              <ul className="list-group list-group-flush px-0 mt-2">
                {[
                  "Faulty Device",
                  "Installation fixed",
                  "Installation required",
                  "Faulty Device",
                ].map((ticket, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div className='row align-items-start'>
                      <i className='bi bi-envelope text-muted' style={{paddingRight: '13px',fontWeight: '500'}} ></i>
                      <div>
                        <span>
                          <small className="text-muted">Today 14:00</small>
                          <br />
                          <h3 style={{fontSize: '14px',fontWeight: '600'}}>{ticket}</h3>
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <i className='bi bi-check2-square mx-2'></i>
                      <i className="bi bi-pencil-square"></i>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          
          <div className="card help-card">
            <div className="card-body">
              <h5 className="card-title">Update</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0">
                  <div className='row'>
                    <i className='bi bi-check-lg text-muted' style={{paddingRight: '13px',fontWeight: '500'}} ></i>
                    <div>
                      <small className="text-muted">Today 10:00</small>
                      <br />
                      <h3 style={{fontSize: '14px',fontWeight: '600'}}>V2.0 Update Release</h3>
                    </div>
                  </div>
                </li>
                <li className="list-group-item px-0">
                  <div className='row'>
                    <i className='bi bi-check-lg text-muted' style={{paddingRight: '13px',fontWeight: '500'}} ></i>
                    <div>
                      <small className="text-muted">Today 10:00</small>
                      <br />
                      <h3 style={{fontSize: '14px',fontWeight: '600'}}>Minor update</h3>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter