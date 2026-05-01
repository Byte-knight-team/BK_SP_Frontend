import { customerAuthFetch } from '../apiHelper';

export const getCustomerProfile = async () => {
  return customerAuthFetch('/api/v1/customer/profile');
};

export const updateCustomerProfile = async (payload) => {
  return customerAuthFetch('/api/v1/customer/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const updateCustomerPassword = async (payload) => {
  return customerAuthFetch('/api/v1/customer/profile/password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};