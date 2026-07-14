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

export const createProfilePicturePresignUrl = async (fileName, contentType) => {
  return customerAuthFetch('/api/v1/customer/profile/picture/presign', {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType }),
  });
};

export const updateProfilePictureKey = async (objectKey) => {
  return customerAuthFetch('/api/v1/customer/profile/picture', {
    method: 'PUT',
    body: JSON.stringify({ objectKey }),
  });
};

export const removeProfilePicture = async () => {
  return customerAuthFetch('/api/v1/customer/profile/picture', {
    method: 'DELETE',
  });
};

export const requestEmailVerification = async () => {
  return customerAuthFetch('/api/v1/customer/request-email-verification', {
    method: 'POST',
  });
};

export const verifyEmailToken = async (token) => {
  return customerAuthFetch(`/api/v1/customer/verify-email?token=${token}`, {
    method: 'POST',
  });
};