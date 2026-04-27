import { customerApiFetch, customerAuthFetch } from '../apiHelper';

export const startQrSession = async (payload) => {
  return customerApiFetch('/api/v1/qr-sessions/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const endQrSession = async (sessionId) => {
  return customerAuthFetch(`/api/v1/qr-sessions/${sessionId}/end`, {
    method: 'PUT',
  });
};