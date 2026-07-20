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



export const createPaymentIntent = async (amount, orderId, reservationId) => {
  return customerAuthFetch('/api/v1/customer/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ amount, orderId, reservationId }),
  });
};