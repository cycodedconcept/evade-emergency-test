import axios from 'axios';
import { CALL_AGENT_URL } from '../config/constant';

const pickFirstString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

export const buildAgentCallPayload = (incident) => {
  const rawIncidentId = incident?.incident_id ?? incident?.id ?? incident?.raw?.id ?? null;
  const normalizedIncidentId = Number(rawIncidentId);

  return {
    deviceid: pickFirstString(
      incident?.device_number,
      incident?.deviceid,
      incident?.raw?.deviceid
    ),
    incident_id: Number.isFinite(normalizedIncidentId) ? normalizedIncidentId : rawIncidentId,
    agent_phone: pickFirstString(
      incident?.actions?.call_number,
      incident?.assigned_phone,
      incident?.agent_phone
    ),
    agent_name:
      pickFirstString(
        incident?.actions?.agent_name,
        incident?.actions?.call_name,
        incident?.assigned_name,
        incident?.agent_name,
        incident?.responder_name
      ) || 'Responder Agent',
  };
};

export const triggerAgentCall = async (incident) => {
  const payload = buildAgentCallPayload(incident);

  if (!payload.deviceid || payload.incident_id === null || payload.incident_id === undefined || !payload.agent_phone) {
    throw new Error('Missing call details for this incident.');
  }

  const response = await axios.post(CALL_AGENT_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};
