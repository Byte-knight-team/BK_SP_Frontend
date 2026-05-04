import { customerApiFetch } from '../apiHelper';

export const getCustomerMenu = async (branchId) => {
  return customerApiFetch(`/api/v1/menu/customer?branchId=${branchId}`);
};