import { customerApiFetch } from '../apiHelper';

export const getCustomerMenu = async (branchId) => {
  return customerApiFetch(`/api/v1/menu/customer?branchId=${branchId}`);
};

export const getMenuItemReviews = async (menuItemId, page = 0, size = 10) => {
  return customerApiFetch(`/api/v1/menu-items/${menuItemId}/reviews?page=${page}&size=${size}`);
};