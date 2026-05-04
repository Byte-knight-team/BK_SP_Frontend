import { customerAuthFetch } from '../apiHelper';

export const listCustomerOrders = async ({ active, type }) => {
  const params = new URLSearchParams({ active: String(active) });

  if (type && type !== 'ALL') {
    params.set('type', type);
  }

  return customerAuthFetch(`/api/v1/orders?${params.toString()}`);
};

export const getCustomerOrder = async (orderId) => {
  return customerAuthFetch(`/api/v1/orders/${orderId}`);
};

export const cancelCustomerOrder = async (orderId, cancellationReason) => {
  return customerAuthFetch(`/api/v1/orders/${orderId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ cancellationReason }),
  });
};

export const submitCustomerReview = async (orderId, payload) => {
  return customerAuthFetch(`/api/v1/orders/${orderId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};