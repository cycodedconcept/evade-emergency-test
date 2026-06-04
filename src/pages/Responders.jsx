import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPen,
  faPlus,
  faSearch,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { Act, Act2, Com, Org, Org2, Pad, Pink, Pink2 } from '../assets';
import CardCarousel from './reusables/CardCarousel';
import Pagination from './reusables/Pagination';
import {
  createResponderUser,
  getResponderAgentDetails,
  getResponderAgents,
  getResponderProfile,
  updateResponderAgent,
} from '../features/responderSlice';

const controlHeight = '48px';

const toMetricNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getStoredToken = () => {
  const tokenItem = localStorage.getItem('item');

  if (!tokenItem) {
    return null;
  }

  try {
    return JSON.parse(tokenItem);
  } catch (error) {
    return tokenItem;
  }
};

const initialCreateFormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
};

const initialUpdateFormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  lat: '',
  log: '',
  status: 'active',
};

const formatDateLabel = (value) => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const buildUpdateFormData = (agent) => ({
  name: agent?.name || '',
  email: agent?.email || '',
  phone: agent?.phone || '',
  address: agent?.address || '',
  password: '',
  lat: agent?.lat || '',
  log: agent?.log || '',
  status: agent?.status || 'active',
});

const statusPillClassName = (status) =>
  String(status).toLowerCase() === 'active' ? 'active' : 'inactive';

const Responder = () => {
  const dispatch = useDispatch();
  const token = getStoredToken();
  const {
    loading,
    error,
    createResponderUserItem,
    responderAgents,
    responderAgentDetails,
    responderProfile,
    updatedResponderAgent,
  } = useSelector((state) => state.responder);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState(initialCreateFormState);
  const [updateFormData, setUpdateFormData] = useState(initialUpdateFormState);

  useEffect(() => {
    if (!token) {
      return;
    }

    dispatch(getResponderProfile({ token }));
  }, [dispatch, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(getResponderAgents({ token, search: searchTerm.trim(), page: currentPage }));
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, dispatch, searchTerm, token]);

  const agentList = responderAgents?.agents || [];
  const agentPagination = responderAgents?.pagination || {};
  const selectedAgent = responderAgentDetails?.agent || null;
  const assignedCases = responderAgentDetails?.assigned_cases?.rows || [];
  const profile = responderProfile?.profile || {};
  const stats = responderProfile?.stats || {};
  const totalAgents = toMetricNumber(stats?.total_agents);
  const activeAgents = toMetricNumber(stats?.active_agents);
  const inactiveAgents = Math.max(totalAgents - activeAgents, 0);
  const openIncidents = toMetricNumber(stats?.open_incidents);
  const closedIncidents = toMetricNumber(stats?.closed_incidents);

  useEffect(() => {
    const apiCurrentPage = Number(agentPagination?.current_page);

    if (
      Number.isFinite(apiCurrentPage) &&
      apiCurrentPage > 0 &&
      apiCurrentPage !== currentPage
    ) {
      setCurrentPage(apiCurrentPage);
    }
  }, [agentPagination?.current_page, currentPage]);

  useEffect(() => {
    if (!token || !selectedAgentId || currentView === 'list') {
      return;
    }

    dispatch(getResponderAgentDetails({ token, id: selectedAgentId }));
  }, [currentView, dispatch, selectedAgentId, token]);

  useEffect(() => {
    if (!selectedAgent?.id) {
      return;
    }

    setUpdateFormData(buildUpdateFormData(selectedAgent));
  }, [selectedAgent]);

  useEffect(() => {
    if (!token || !createResponderUserItem?.user?.id) {
      return;
    }

    setShowCreateForm(false);
    setCreateFormData(initialCreateFormState);
    setSelectedAgentId(createResponderUserItem.user.id);
    setCurrentView('details');
    dispatch(getResponderAgents({ token, search: searchTerm.trim(), page: currentPage }));
    dispatch(getResponderProfile({ token }));
    dispatch(getResponderAgentDetails({ token, id: createResponderUserItem.user.id }));
  }, [createResponderUserItem, currentPage, dispatch, searchTerm, token]);

  useEffect(() => {
    if (!token || !updatedResponderAgent?.agent?.id) {
      return;
    }

    setCurrentView('details');
    dispatch(getResponderAgents({ token, search: searchTerm.trim(), page: currentPage }));
    dispatch(getResponderProfile({ token }));
    dispatch(getResponderAgentDetails({ token, id: updatedResponderAgent.agent.id }));
  }, [currentPage, dispatch, searchTerm, token, updatedResponderAgent]);

  const summaryCards = useMemo(
    () =>
      [
        {
          key: 'total_agents',
          title: 'Total Agents',
          value: totalAgents,
          helperText: `${activeAgents} active`,
          chartData: [
            { label: 'Inactive', value: inactiveAgents },
            { label: 'Active', value: activeAgents },
          ],
          chartColor: '#2E3192',
          imageBase: Pad,
          image: Com,
        },
        {
          key: 'active_agents',
          title: 'Active Agents',
          value: activeAgents,
          helperText: `${inactiveAgents} inactive`,
          chartData: [
            { label: 'Inactive', value: inactiveAgents },
            { label: 'Active', value: activeAgents },
          ],
          chartColor: '#15AC77',
          imageBase: Act2,
          image: Act,
        },
        {
          key: 'open_incidents',
          title: 'Open Incidents',
          value: openIncidents,
          helperText: `${closedIncidents} closed`,
          chartData: [
            { label: 'Closed', value: closedIncidents },
            { label: 'Open', value: openIncidents },
          ],
          chartColor: '#FE9431',
          imageBase: Org2,
          image: Org,
        },
        {
          key: 'closed_incidents',
          title: 'Closed Incidents',
          value: closedIncidents,
          helperText: `${openIncidents} open`,
          chartData: [
            { label: 'Open', value: openIncidents },
            { label: 'Closed', value: closedIncidents },
          ],
          chartColor: '#FE5B65',
          imageBase: Pink2,
          image: Pink,
        },
      ],
    [activeAgents, closedIncidents, inactiveAgents, openIncidents, totalAgents]
  );

  const handleCreateInputChange = (event) => {
    const { name, value } = event.target;
    setCreateFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdateInputChange = (event) => {
    const { name, value } = event.target;
    setUpdateFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    await dispatch(createResponderUser({ token, ...createFormData }));
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    if (!token || !selectedAgentId) {
      return;
    }

    await dispatch(updateResponderAgent({ token, id: selectedAgentId, ...updateFormData }));
  };

  const handleAgentDetailsView = (agent) => {
    if (!agent?.id) {
      return;
    }

    setSelectedAgentId(agent.id);
    setCurrentView('details');
  };

  const handleAgentEditView = (agent) => {
    if (!agent?.id) {
      return;
    }

    setSelectedAgentId(agent.id);
    setUpdateFormData(buildUpdateFormData(agent));
    setCurrentView('edit');
  };

  const handleSearchChange = (event) => {
    setCurrentPage(1);
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (page) => {
    const lastPage = Number(agentPagination?.last_page) || 1;

    if (page < 1 || page > lastPage || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  };

  const renderStateMessage = (title, description) => (
    <div
      className="text-center py-5 mt-4"
      style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '20px' }}
    >
      <h5 style={{ color: '#14181F' }}>{title}</h5>
      <p className="mb-0" style={{ color: '#707A8F' }}>
        {description}
      </p>
    </div>
  );

  const renderSummaryCards = () => (
    <div className="mb-4">
      <CardCarousel cards={summaryCards} />
    </div>
  );

  const renderCreateForm = () => {
    if (!showCreateForm) {
      return null;
    }

    return (
      <div
        className="p-4 mb-4"
        style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '20px' }}
      >
        <div className="d-flex align-items-center mb-3">
          <FontAwesomeIcon icon={faUserShield} className="mr-2" style={{ color: '#2E3192' }} />
          <h5 className="mb-0">Create Responder Agent</h5>
        </div>

        <form onSubmit={handleCreateSubmit}>
          <div className="row">
            <div className="col-md-6">
              <label>Name</label>
              <input
                name="name"
                value={createFormData.name}
                onChange={handleCreateInputChange}
                placeholder="Agent name"
                required
              />
            </div>
            <div className="col-md-6">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={createFormData.email}
                onChange={handleCreateInputChange}
                placeholder="agent@example.com"
                required
              />
            </div>
            <div className="col-md-6">
              <label>Phone</label>
              <input
                name="phone"
                value={createFormData.phone}
                onChange={handleCreateInputChange}
                placeholder="+2348012345678"
                required
              />
            </div>
            <div className="col-md-6">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={createFormData.password}
                onChange={handleCreateInputChange}
                placeholder="Create a password"
                required
              />
            </div>
            <div className="col-12">
              <label>Address</label>
              <textarea
                name="address"
                value={createFormData.address}
                onChange={handleCreateInputChange}
                placeholder="Agent address"
                rows="3"
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 responder-form-footer">
            <small style={{ color: '#707A8F' }}>
              {createResponderUserItem?.message || 'Create a new responder user from this form.'}
            </small>
            <button className="ex-btn" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderListView = () => (
    <div className="py-3">
      <div className="d-block d-lg-flex justify-content-between align-items-center mb-4 responder-page-actions">
        <div>
          <h4 style={{ color: '#14181F' }} className="mb-1">
            Responder
          </h4>
          <p style={{ color: '#707A8F' }} className="mb-0">
            Manage responder agents, review profile metrics, and inspect assigned cases.
          </p>
        </div>
        <button
          className="ex-btn mt-3 mt-lg-0"
          type="button"
          style={{ height: controlHeight, display: 'inline-flex', alignItems: 'center' }}
          onClick={() => setShowCreateForm((current) => !current)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {showCreateForm ? 'Hide Form' : 'Create Agent'}
        </button>
      </div>
      {renderSummaryCards()}

      <div
        className="p-4"
        style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '20px' }}
      >
        {renderCreateForm()}

        <div className="d-block d-lg-flex justify-content-between align-items-center mb-4 responder-page-actions">
          <div>
            <h5 className="mb-1">Agents List</h5>
            <small style={{ color: '#707A8F' }}>
              {responderAgents?.message || 'All responder agents attached to this company.'}
            </small>
          </div>
          <div
            className="search-container mt-3 mt-lg-0 responder-search"
            style={{ width: '100%', maxWidth: '360px' }}
          >
            <div className="position-relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search agents..."
                className="form-control"
                style={{
                  height: controlHeight,
                  padding: '0 16px 0 40px',
                  border: '1px solid #E8E8E9',
                  backgroundColor: '#fff',
                  marginBottom: 0,
                }}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="position-absolute"
                style={{
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#707A8F',
                }}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 responder-list-meta">
          <small style={{ color: '#707A8F' }}>
            {profile?.company_name || 'Responder Company'}
          </small>
          <small style={{ color: '#707A8F' }}>
            {Number(agentPagination?.total) || agentList.length} total agent
            {(Number(agentPagination?.total) || agentList.length) === 1 ? '' : 's'}
          </small>
        </div>

        {!agentList.length ? (
          <div className="text-center py-4" style={{ color: '#707A8F' }}>
            No responder agents found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Open Cases</th>
                  <th>Closed Cases</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agentList.map((agent) => (
                  <tr
                    key={agent.id}
                    onClick={() => handleAgentDetailsView(agent)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: '600', color: '#14181F' }}>{agent.name}</div>
                      <small style={{ color: '#707A8F' }}>{agent.email}</small>
                    </td>
                    <td>{agent.phone || 'N/A'}</td>
                    <td>
                      <span className={statusPillClassName(agent.status)}>
                        {agent.status || 'N/A'}
                      </span>
                    </td>
                    <td>{agent.open_cases ?? 0}</td>
                    <td>{agent.closed_cases ?? 0}</td>
                    <td>{formatDateLabel(agent.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="fil-btn"
                        style={{
                          height: '40px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '13px',
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAgentEditView(agent);
                        }}
                      >
                        <FontAwesomeIcon icon={faPen} className="mr-2" />
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <Pagination
            currentPage={Number(agentPagination?.current_page) || currentPage}
            lastPage={Number(agentPagination?.last_page) || 1}
            onPageChange={handlePageChange}
            totalItems={Number(agentPagination?.total) || agentList.length}
            perPage={Number(agentPagination?.per_page) || agentList.length || 10}
          />
        </div>
      </div>
    </div>
  );

  const renderDetailView = () => {
    const isDetailLoading = loading && selectedAgentId && selectedAgent?.id !== selectedAgentId;

    return (
      <div className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-4 responder-page-actions">
          <button className="d-btn p-2" onClick={() => setCurrentView('list')}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          </button>
          <button
            className="ex-btn"
            style={{ height: controlHeight, display: 'inline-flex', alignItems: 'center' }}
            onClick={() => selectedAgent && handleAgentEditView(selectedAgent)}
            disabled={!selectedAgent}
          >
            <FontAwesomeIcon icon={faPen} className="mr-2" />
            Update Agent
          </button>
        </div>

        {isDetailLoading ? (
          renderStateMessage(
            'Loading agent details...',
            'Please wait while the responder agent profile is being prepared.'
          )
        ) : !selectedAgent ? (
          renderStateMessage(
            'No agent selected',
            'Choose an agent from the main table to view their details.'
          )
        ) : (
          <>
            <div
              className="p-4 mb-4"
              style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '20px' }}
            >
              <div className="d-block d-lg-flex justify-content-between align-items-start">
                <div>
                  <h4 className="mb-1 mb-4" style={{ color: '#14181F' }}>
                    {selectedAgent.name}
                  </h4>
                  <p className="mb-0" style={{ color: '#707A8F' }}>
                    {selectedAgent.email || 'No email address available'}
                  </p>
                </div>
                <span className={statusPillClassName(selectedAgent.status)}>
                  {selectedAgent.status || 'N/A'}
                </span>
              </div>

              <div className="row mt-4">
                <div className="col-md-4 mb-3">
                  <small style={{ color: '#707A8F' }}>Phone</small>
                  <div style={{ color: '#14181F', fontWeight: '600' }}>
                    {selectedAgent.phone || 'N/A'}
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <small style={{ color: '#707A8F' }}>Address</small>
                  <div style={{ color: '#14181F', fontWeight: '600' }}>
                    {selectedAgent.address || 'N/A'}
                  </div>
                </div>
                {/* <div className="col-md-4 mb-3">
                  <small style={{ color: '#707A8F' }}>Coordinates</small>
                  <div style={{ color: '#14181F', fontWeight: '600' }}>
                    {selectedAgent.lat || 'N/A'}, {selectedAgent.log || 'N/A'}
                  </div>
                </div> */}
                <div className="col-md-4 mb-3">
                  <small style={{ color: '#707A8F' }}>Created</small>
                  <div style={{ color: '#14181F', fontWeight: '600' }}>
                    {formatDateLabel(selectedAgent.created_at)}
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <small style={{ color: '#707A8F' }}>Updated</small>
                  <div style={{ color: '#14181F', fontWeight: '600' }}>
                    {formatDateLabel(selectedAgent.updated_at)}
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <small style={{ color: '#707A8F' }}>Assigned Cases</small>
                  <div style={{ color: '#14181F', fontWeight: '600' }}>
                    {selectedAgent.total_assigned_cases ?? assignedCases.length}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-4"
              style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '20px' }}
            >
              <div className="d-block d-lg-flex justify-content-between align-items-center mb-4 responder-page-actions">
                <div>
                  <h5 className="mb-1">Assigned Cases</h5>
                  <small style={{ color: '#707A8F' }}>
                    Cases currently assigned to this responder agent.
                  </small>
                </div>
                <div className="d-flex responder-summary-pills" style={{ gap: '10px' }}>
                  <div
                    className="p-3"
                    style={{
                      borderRadius: '16px',
                      background: '#FE943112',
                      border: '1px solid #FE943120',
                      minWidth: '120px',
                    }}
                  >
                    <small style={{ color: '#707A8F' }}>Open Cases</small>
                    <h4 className="mb-0 mt-2" style={{ color: '#FE9431' }}>
                      {selectedAgent.open_cases ?? 0}
                    </h4>
                  </div>
                  <div
                    className="p-3"
                    style={{
                      borderRadius: '16px',
                      background: '#29A5DE12',
                      border: '1px solid #29A5DE20',
                      minWidth: '120px',
                    }}
                  >
                    <small style={{ color: '#707A8F' }}>Closed Cases</small>
                    <h4 className="mb-0 mt-2" style={{ color: '#29A5DE' }}>
                      {selectedAgent.closed_cases ?? 0}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Emergency ID</th>
                      <th>Device Number</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedCases.length ? (
                      assignedCases.map((incident) => (
                        <tr key={incident.id}>
                          <td>{incident.emergency_id || 'N/A'}</td>
                          <td>{incident.device_number || 'N/A'}</td>
                          <td>{incident.type || 'N/A'}</td>
                          <td>{incident.severity || 'N/A'}</td>
                          <td>{incident.incident_status || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center" style={{ color: '#707A8F' }}>
                          No assigned cases found for this agent.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderEditView = () => (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4 responder-page-actions">
        <button className="d-btn" onClick={() => setCurrentView('details')}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to details
        </button>
      </div>

      <div
        className="p-4"
        style={{ background: '#fff', border: '1px solid #E8E8E9', borderRadius: '20px' }}
      >
        <div className="d-flex align-items-center mb-3">
          <FontAwesomeIcon icon={faPen} className="mr-2" style={{ color: '#2E3192' }} />
          <h5 className="mb-0">Update Responder Agent</h5>
        </div>

        <form onSubmit={handleUpdateSubmit}>
          <div className="row">
            <div className="col-md-6">
              <label>Name</label>
              <input
                name="name"
                value={updateFormData.name}
                onChange={handleUpdateInputChange}
                placeholder="Agent name"
                required
              />
            </div>
            <div className="col-md-6">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={updateFormData.email}
                onChange={handleUpdateInputChange}
                placeholder="agent@example.com"
                required
              />
            </div>
            <div className="col-md-6">
              <label>Phone</label>
              <input
                name="phone"
                value={updateFormData.phone}
                onChange={handleUpdateInputChange}
                placeholder="+2348012345678"
                required
              />
            </div>
            <div className="col-md-6">
              <label>Status</label>
              <select
                name="status"
                value={updateFormData.status}
                onChange={handleUpdateInputChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-6">
              <label>Latitude</label>
              <input
                name="lat"
                value={updateFormData.lat}
                onChange={handleUpdateInputChange}
                placeholder="6.5961"
              />
            </div>
            <div className="col-md-6">
              <label>Longitude</label>
              <input
                name="log"
                value={updateFormData.log}
                onChange={handleUpdateInputChange}
                placeholder="3.349"
              />
            </div>
            <div className="col-md-12">
              <label>Address</label>
              <textarea
                name="address"
                value={updateFormData.address}
                onChange={handleUpdateInputChange}
                placeholder="Agent address"
                rows="3"
                required
              />
            </div>
            <div className="col-md-12">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={updateFormData.password}
                onChange={handleUpdateInputChange}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 responder-form-footer">
            <small style={{ color: '#707A8F' }}>
              {updatedResponderAgent?.message || 'Update the selected responder agent and save the changes.'}
            </small>
            <button className="ex-btn" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!token) {
    return renderStateMessage(
      'No active session found',
      'Please sign in again before viewing responder data.'
    );
  }

  if (loading && !profile?.id && !agentList.length) {
    return renderStateMessage(
      'Loading responder data...',
      'Please wait while the profile and agent list are being prepared.'
    );
  }

  if (error && !profile?.id && !agentList.length) {
    return renderStateMessage(
      'Unable to load responder data',
      typeof error === 'string' ? error : error?.message || 'Something went wrong.'
    );
  }

  return (
    <>
      {currentView === 'list' ? renderListView() : null}
      {currentView === 'details' ? renderDetailView() : null}
      {currentView === 'edit' ? renderEditView() : null}

      {error ? (
        <div className="mt-3 text-danger" style={{ fontSize: '14px' }}>
          {typeof error === 'string' ? error : error?.message || 'Something went wrong.'}
        </div>
      ) : null}
    </>
  );
};

export default Responder;
