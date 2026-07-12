import { customerAuthFetch } from '../apiHelper';

export const getActiveReservationBranches = async () => {
  return customerAuthFetch('/api/v1/customer/reservations/branches');
};

export const previewReservationCharge = async (branchId, guestCount, startTime, endTime) => {
  return customerAuthFetch(`/api/v1/customer/reservations/preview-charge?branchId=${branchId}&guestCount=${guestCount}&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`);
};

export const createReservationRequest = async (requestData) => {
  return customerAuthFetch('/api/v1/customer/reservations', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
};

export const getMyReservations = async (page = 0, size = 15, tab = 'requests') => {
  return customerAuthFetch(`/api/v1/customer/reservations?page=${page}&size=${size}&tab=${tab}`);
};

export const getReservationById = async (id) => {
  return customerAuthFetch(`/api/v1/customer/reservations/${id}`);
};

export const cancelReservation = async (id, reason) => {
  return customerAuthFetch(`/api/v1/customer/reservations/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
};

export const payReservation = async (id, transactionReference) => {
  return customerAuthFetch(`/api/v1/customer/reservations/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ transactionReference }),
  });
};
