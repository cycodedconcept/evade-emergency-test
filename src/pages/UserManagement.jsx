import React, {useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  Modal,
  Button,
  Form,
  Row,
  Col
} from "react-bootstrap";


export default function RoleUserManagement() {
    const [show, setShow] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    privileges: {
      manageDevices: false,
      viewCrashData: true,
      renewSubscriptions: false,
      apiWebhook: true,
      roleManagement: true,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePrivilegeChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      privileges: { ...formData.privileges, [name]: checked },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };


  return (
    <>

    <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
        size="md"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="px-2" style={{fontSize:'18px'}}>Add New User</Modal.Title>
        </Modal.Header>

        <Form className="px-2" onSubmit={handleSubmit}>
          <Modal.Body className="mt-4">
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="modal-p">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="modal-p">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label className="modal-p">Assign Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Viewer">Viewer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-semibold px-3 mb-3">Role Privileges</h6>
            {[
              { name: "manageDevices", label: "Manage Devices" },
              { name: "viewCrashData", label: "View Crash Data" },
              { name: "renewSubscriptions", label: "Renew Subscriptions" },
              { name: "apiWebhook", label: "API & Webhook Management" },
              { name: "roleManagement", label: "Role/User Management" },
            ].map((priv) => (
              <div className="container d-flex justify-content-between">
                <h6 className="modal-p">{priv.label}</h6>
                <label class="purple-checkbox">
                    <input type="checkbox" class="cbx-input" />
                    <span class="cbx-box"></span>
                </label>
              </div>
            ))}
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
                <Button className="modal-btn-light rounded-lg px-4" onClick={() => setShow(false)}>
                    <i className="bi bi-x-lg mr-2"></i>
                    Cancel
                </Button>
                <Button className="modal-btn px-4 rounded-lg" type="submit">
                    Add User
                </Button>
          </Modal.Footer>
        </Form>
      </Modal>


    <div className="container-fluid py-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-3 border-right bg-white p-3">
          <h6 className="fw-bold">Role/User Management</h6>
          <p className="text-muted small">
            Manage system users, assign roles, and control access levels.
          </p>
          <div className="input-group mb-3">
            <span className="input-group-text border-right-0 rounded-0 bg-white pr-0 mr-0">
              <i className="bi bi-search pr-0 mr-0"></i>
            </span>
            <input
              type="text"
              className="form-control border-left-0 ps-0"
              placeholder="Search..."
            />
          </div>
        </div>  

        {/* Main Content */}
        <div className="col-md-9 col-lg-9 p-0 border-0">
          <div className="card mb-3 border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-people-fill me-2"></i> Role/User Management
              </h5>

              {/* Members List Header */}
              <div className="d-flex justify-content-between align-items-center mb-2 mt-5">
                <div>
                    <h5 className="mb-0 pb-0" style={{fontSize: '18px'}}>Members List</h5>
                    <p className="text-muted mb-0" style={{fontSize: '14px', fontWeight: '400'}}>View all your list information.</p>
                </div>
                <div className="input-group w-auto">
                  <input
                    type="text"
                    className="form-control rounded-lg"
                    placeholder="Search..."
                  />
                  <button className="btn btn-primary ml-3 rounded-lg bg-blue" type="button" onClick={() => setShow(true)} style={{fontSize: '13px'}}>
                    <i className="bi bi-plus-circle-dotted mr-2"></i> Add New User
                  </button>
                  
                </div>
              </div>

              {/* Members Table */}
              <div className="table-responsive " style={{borderRadius: '15px'}}>
                <table className="table align-center no-lines-table my-table">
                  <thead className="p-0 m-0" style={{borderRadius: '100px', border: '5px solid red'}}>
                    <tr className="p-0 m-0 bg-light" style={{border: '50px solid red', borderRadius: '100px'}}>
                      <th className="p-0 m-0">
                        <input type="checkbox" className="form-control m-0 p-0"/>
                      </th>
                      <th className="p-0 m-0">Name/Email</th>
                      <th className="p-0 m-0">Role</th>
                      <th className="p-0 m-0">Date Added</th>
                      <th className="p-0 m-0">Status</th>
                      <th className="p-0 m-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="align-bottom">
                        <input type="checkbox" />
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <img
                            src="https://i.pinimg.com/736x/03/eb/d6/03ebd625cc0b9d636256ecc44c0ea324.jpg"
                            className="rounded-circle mr-2 img img-fluid"
                            alt="user"
                            style={{maxWidth: '30px'}}
                          />
                          <div>
                            <div className="tab-name text-truncate">James Brown</div>
                            <small className="text-muted">james@align.com</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-bottom">
                        <select className="" style={{border: '5px solid black'}}>
                          <option>WatchOut</option>
                          <option>Insurance Partner</option>
                          <option>Fleet Owner</option>
                        </select>
                      </td>
                      <td className="align-middle">May 6, 2024</td>
                      <td className="align-middle">
                        <span className="badge bg-success px-5 py-3 text-white" style={{fontSize: '1em'}}>Active</span>
                      </td>
                      <td className="align-middle">
                        <button className="btn btn-sm btn-light">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td className="align-bottom">
                        <input type="checkbox" />
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <img
                            src="https://i.pinimg.com/736x/03/eb/d6/03ebd625cc0b9d636256ecc44c0ea324.jpg"
                            className="rounded-circle mr-2 img img-fluid"
                            alt="user"
                            style={{maxWidth: '30px'}}
                          />
                          <div>
                            <div className="tab-name text-truncate">James Brown</div>
                            <small className="text-muted">james@align.com</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-bottom">
                        <select className="form-select">
                          <option>Insurance Partner</option>
                          <option>WatchOut</option>
                          <option>Fleet Owner</option>
                        </select>
                      </td>
                      <td className="align-middle">November 7, 2025</td>
                      <td className="align-middle">
                        <span className="badge bg-warning w-100 py-3 text-white" style={{fontSize: '1em'}}>Active</span>
                      </td>
                      <td className="align-middle">
                        <button className="btn btn-sm btn-light">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td className="align-bottom">
                        <input type="checkbox" />
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <img
                            src="https://i.pinimg.com/736x/03/eb/d6/03ebd625cc0b9d636256ecc44c0ea324.jpg"
                            className="rounded-circle mr-2 img img-fluid"
                            alt="user"
                            style={{maxWidth: '30px'}}
                          />
                          <div>
                            <div className="tab-name text-truncate">James Brown</div>
                            <small className="text-muted">james@align.com</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <select className="form-select">
                          <option>Fleet Owner</option>
                          <option>WatchOut</option>
                          <option>Insurance Partner</option>
                        </select>
                      </td>
                      <td className="align-middle">November 7, 2025</td>
                      <td className="align-middle">
                        <span className="badge bg-danger w-100 py-3 text-white" style={{fontSize: '1em'}}>Suspended</span>
                      </td>
                      <td className="align-middle">
                        <button className="btn btn-sm btn-light">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Role Privileges */}
          <div className="card border-0">
            <div className="card-body">
              <h6 className="fw-bold">Role Privileges</h6>
              <div className="table-responsive rounded-lg" style={{border: '1px solid #E8E8E9'}}>
                <table className="table shadow-sm text-center border-1 rounded-lg no-lines-table my-table">
                  <thead className="table-light">
                    <tr>
                      <th className="text-start">Feature</th>
                      <th className="text-center" >Super Admin</th>
                      <th className="text-center">WatchOut</th>
                      <th className="text-center">Insurance</th>
                      <th className="text-center">Fleet Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr >
                      <td className="text-start">Manage Devices</td>
                      <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                      <td className="text-center">❌</td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">View Crash Data</td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                      <td className="text-center">❌</td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">Renew Subscriptions</td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">API & Webhook</td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">Role/User Management</td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                      <td className="text-center">❌</td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                       <td className="text-center">
                        <i className="bi bi-check-square-fill purple-check" ></i>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>   

    </div>
    <div
        className="modal fade"
        id="addUserModal"
        tabIndex="-1"
        aria-labelledby="addUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-sm rounded-3">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold" id="addUserModalLabel">
                Add New User
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body px-4">
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email Address */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Assign Role */}
                <div className="mb-4">
                  <label className="form-label fw-medium">Assign Role</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                {/* Role Privileges */}
                <div>
                  <h6 className="fw-semibold mb-3">Role Privileges</h6>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="manageDevices"
                      name="manageDevices"
                      checked={formData.privileges.manageDevices}
                      onChange={handlePrivilegeChange}
                    />
                    <label className="form-check-label" htmlFor="manageDevices">
                      Manage Devices
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="viewCrashData"
                      name="viewCrashData"
                      checked={formData.privileges.viewCrashData}
                      onChange={handlePrivilegeChange}
                    />
                    <label className="form-check-label" htmlFor="viewCrashData">
                      View Crash Data
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="renewSubscriptions"
                      name="renewSubscriptions"
                      checked={formData.privileges.renewSubscriptions}
                      onChange={handlePrivilegeChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="renewSubscriptions"
                    >
                      Renew Subscriptions
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="apiWebhook"
                      name="apiWebhook"
                      checked={formData.privileges.apiWebhook}
                      onChange={handlePrivilegeChange}
                    />
                    <label className="form-check-label" htmlFor="apiWebhook">
                      API & Webhook Management
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="roleManagement"
                      name="roleManagement"
                      checked={formData.privileges.roleManagement}
                      onChange={handlePrivilegeChange}
                    />
                    <label className="form-check-label" htmlFor="roleManagement">
                      Role/User Management
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 px-4">
                <button
                  type="button"
                  className="btn btn-light border"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
