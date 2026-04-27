import { customerAuthFetch } from '../apiHelper';

export const calculateCheckout = async (payload) => {
  return customerAuthFetch('/api/v1/checkout/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const placeCustomerOrder = async (payload) => {
  return customerAuthFetch('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateCustomerPayment = async (orderId, payload) => {
  return customerAuthFetch(`/api/v1/orders/${orderId}/payment`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};