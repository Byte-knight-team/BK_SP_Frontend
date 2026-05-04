// src/apis/staff/customers.js

/*
  Temporary dummy customer API.
  Later, replace only this file with real backend API calls.
*/

let dummyCustomers = [
  {
    id: 1,
    fullName: "Kasun Perera",
    email: "kasun.perera@gmail.com",
    phone: "0771234567",
    active: true,
    createdAt: "2026-04-20T10:30:00",
    addresses: [
      {
        id: 101,
        label: "Home",
        addressLine: "No 12, Colombo Road",
        city: "Colombo",
      },
    ],
  },
  {
    id: 2,
    fullName: "Nimal Silva",
    email: "nimal.silva@gmail.com",
    phone: "0719876543",
    active: false,
    createdAt: "2026-04-22T14:15:00",
    addresses: [
      {
        id: 102,
        label: "Office",
        addressLine: "No 45, Galle Road",
        city: "Mount Lavinia",
      },
    ],
  },
  {
    id: 3,
    fullName: "Amaya Fernando",
    email: "amaya.fernando@gmail.com",
    phone: "0752223344",
    active: true,
    createdAt: "2026-04-25T09:45:00",
    addresses: [],
  },
];

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCustomersAPI() {
  await delay();

  return dummyCustomers.map((customer) => ({
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    active: customer.active,
    createdAt: customer.createdAt,
  }));
}

export async function getCustomerByIdAPI(id) {
  await delay();

  const customer = dummyCustomers.find(
    (customerItem) => customerItem.id === Number(id)
  );

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
}

export async function activateCustomerAPI(id) {
  await delay();

  dummyCustomers = dummyCustomers.map((customer) =>
    customer.id === Number(id) ? { ...customer, active: true } : customer
  );

  return {
    message: "Customer activated successfully",
    active: true,
  };
}

export async function deactivateCustomerAPI(id) {
  await delay();

  dummyCustomers = dummyCustomers.map((customer) =>
    customer.id === Number(id) ? { ...customer, active: false } : customer
  );

  return {
    message: "Customer deactivated successfully",
    active: false,
  };
}