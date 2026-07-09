import { customerApiFetch } from '../apiHelper';

export const sendCustomerOtp = async (phone) => {
  const response = await customerApiFetch('/api/v1/auth/customer/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });

  return response;
};

export const verifyCustomerOtp = async ({ phone, code, sessionId }) => {
  return customerApiFetch('/api/v1/auth/customer/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code, sessionId }),
  });
};

export const loginCustomer = async (credentials) => {
  return customerApiFetch('/api/v1/auth/customer/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const registerCustomer = async (payload) => {
  return customerApiFetch('/api/v1/auth/customer/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const forgotPasswordCustomer = async (email) => {
  return customerApiFetch('/api/v1/auth/customer/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPasswordCustomer = async (token, newPassword) => {
  return customerApiFetch('/api/v1/auth/customer/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
};