import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';


const HelpCenter = () => {
  return (
    <div className="px-1 py-4">
      <h3 className='px-3 mb-0 pb-0' style={{color: '#14181F', fontSize: '28px', fontWeight: '500'}}>Help Center</h3>
      <div className='px-3 mb-5 d-flex justify-content-between align-items-center mt-0 pt-0'>
        <div>
          <p className='my-auto' style={{color: '#707A8F',fontWeight:'600',fontSize: '14px'}}><span className='text-blue mr-2' style={{fontSize: '14px', fontWeight: '700'}}>Dashboard</span> {'>'} <span className='ml-2'>Help Center</span></p>
        </div>
        <div>
          <button className='btn pri px-3' style={{borderRadius: '8px',fontWeight: '600',fontStyle: '14px'}}>+ Add Tickets</button>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4 help-card">
            <div className="card-body">
              <h5 className="" style={{color: '#14181F', fontWeight: '500', fontSize: '20px', letterSpacing: '0.5%'}}>Search</h5>
              <div className="search-container mt-4 mb-4">
                <div className="position-relative">
                    <input 
                        type="text" 
                        placeholder="Search articles..." 
                        className="form-control py-3"
                        style={{ paddingLeft: '40px', paddingRight: '15px', border: "1px solid #E8E8E9", backgroundColor: "#fff", borderRadius: '8px'}}
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
              <div className=''>
                <span className='mr-1' style={{fontSize: '15px', fontWeight: '600', color: 'gray'}}>Recent:  </span>
                {["Installation", "Emergencies", "SOS Button", "Status", "Reports"].map((tag, i) => (
                  <span key={i} className="badge me-5 py-1 px-2 rounded-pill recent-search" style={{marginRight: '8px',border: '1px solid #D3D6DC', fontWeight: '500',color: 'gray',cursor: 'pointer'}}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card help-card p-1">
            <div className="card-body px-0">
              <h5 className="card-title mb-1 px-3" style={{color: '#14181F', fontWeight: '500', fontSize: '20px'}}>Popular Topics</h5>
              <small className="mt-0 pt-0 mb-4 pb-5 px-3" style={{fontWeight: '400', fontSize: '14px', color: '#707A8F'}}>Topics based on category</small>
              <div className="row justify-content-between gap-3 py-4 mt-4" style={{justifyContent: 'space-between', marginTop: '150px'}}>
                <div className="col-6 col-lg-4 mb-3 ">
                  <div className="p-3 border bg-white help-card m-0">
                    <i className="bi bi-box-arrow-in-right pri rounded-circle p-2 text-white fw-5 mb-4 strong" style={{fontSize: '19px'}}></i>
                    <p className="mb-1 mt-3 help-p">Get Started</p>
                    <small className="light-font" >8 Articles</small>
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

        <div className="col-lg-4">
          {/* Tickets */}
          <div className="card mb-4 help-card">
            <div className="card-body pb-0 mb-0">
              <div className='mb-1'>
                <i className='bi bi-three-dots-vertical' style={{float: 'right'}}></i>
                <h6 className=" mb-0 pb-0" style={{color: '#14181F', fontSize: '20px', fontWeight: '500'}}>Your Tickets</h6>
              </div>
              <small className='tiny-text ' style={{color: '#707A8F', fontWeight: '400'}}>Your recent tickets</small>
              <ul className="nav mt-4 pt-3 mb-3 row justify-content-between align-items-center border-bottom">
                <li className="ticket col-lg-4 ticket-active text-center pb-2">
                  <a className="text-blue text-center tiny-text" href="#">
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
                      <i className='bi bi-envelope mr-2 ' style={{fontWeight: '100',color:'#707A8F'}} ></i>
                      <div>
                        <span>
                          <h2 className="mt-1" style={{color: '#707A8F', fontSize: '12px'}}>Today 14:00</h2>
                          <h3 style={{fontSize: '14px',fontWeight: '500',color:'#14181F'}}>{ticket}</h3>
                        </span>
                      </div>
                    </div>
                    <div className="row edit-ticket-container">
                      <i className='bi bi-check2-square mx-2' ></i>
                      <i className="bi bi-pencil-square" ></i>
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