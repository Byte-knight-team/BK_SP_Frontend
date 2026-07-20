import { customerAuthFetch } from '../apiHelper';

export const getActiveReservationBranches = async () => {
  return customerAuthFetch('/api/v1/customer/reservations/branches');
};

export const previewReservationCharge = async (branchId, guestCount, startTime, endTime) => {
  const startParam = typeof startTime === 'string' ? startTime : startTime.toISOString();
  const endParam = typeof endTime === 'string' ? endTime : endTime.toISOString();
  return customerAuthFetch(`/api/v1/customer/reservations/preview-charge?branchId=${branchId}&guestCount=${guestCount}&startTime=${startParam}&endTime=${endParam}`);
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


