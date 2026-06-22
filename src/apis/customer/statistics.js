import { customerAuthFetch } from '../apiHelper';

export const getCustomerStatistics = async () => {
  return customerAuthFetch('/api/v1/customer/statistics');
};
