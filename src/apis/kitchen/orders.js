export const ordersData = [
  {
    status: "Pending",
    time: "10:45 AM",
    id: "#ORD-001",
    itemCount: 3,
  },
  {
    status: "Pending",
    time: "10:50 AM",
    id: "#ORD-002",
    itemCount: 1,
  },
  {
    status: "Pending",
    time: "10:55 AM",
    id: "#ORD-003",
    itemCount: 5,
  },
  {
    status: "Preparing",
    time: "11:00 AM",
    id: "#ORD-004",
    itemCount: 2,
  },
  {
    status: "Preparing",
    time: "11:05 AM",
    id: "#ORD-005",
    itemCount: 4,
  },
  {
    status: "Preparing",
    time: "11:10 AM",
    id: "#ORD-006",
    itemCount: 1,
  },
  {
    status: "Completed",
    time: "11:15 AM",
    id: "#ORD-007",
    itemCount: 3,
  },
  {
    status: "Completed",
    time: "11:20 AM",
    id: "#ORD-008",
    itemCount: 2,
  },
  {
    status: "Completed",
    time: "11:25 AM",
    id: "#ORD-009",
    itemCount: 5,
  },
  {
    status: "On Hold",
    time: "11:30 AM",
    id: "#ORD-010",
    itemCount: 2,
  },
  {
    status: "On Hold",
    time: "11:35 AM",
    id: "#ORD-011",
    itemCount: 4,
  },
  {
    status: "On Hold",
    time: "11:40 AM",
    id: "#ORD-012",
    itemCount: 1,
  },
  {
    status: "Pending",
    time: "10:45 AM",
    id: "#ORD-013",
    itemCount: 3,
  },
  {
    status: "Pending",
    time: "10:50 AM",
    id: "#ORD-014",
    itemCount: 1,
  },
  {
    status: "Pending",
    time: "10:55 AM",
    id: "#ORD-015",
    itemCount: 5,
  },
  {
    status: "Preparing",
    time: "11:00 AM",
    id: "#ORD-016",
    itemCount: 2,
  },
  {
    status: "Pending",
    time: "10:55 AM",
    id: "#ORD-015",
    itemCount: 5,
  },
  {
    status: "Pending",
    time: "10:55 AM",
    id: "#ORD-015",
    itemCount: 5,
  },
  {
    status: "Pending",
    time: "10:55 AM",
    id: "#ORD-015",
    itemCount: 5,
  },
  {
    status: "Pending",
    time: "10:55 AM",
    id: "#ORD-015",
    itemCount: 5,
  },
  {
    status: "Pending",
    time: "10:55 AM",
    id: "#ORD-015",
    itemCount: 5,
  },
];

export const getOrdersAPI = async (orderStatus, limit = null) => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   `https://mpc2e51a3b857d0cbb58.free.beeceptor.com/orders?status=${orderStatus}&limit=${limit}`,
    // );
    // const data = await response.json();
    // return {data, error: null};
    const filteredOrdersData = ordersData.filter(
      (order) => order.status === orderStatus,
    );
    if (limit) {
      filteredOrdersData.splice(limit);
    }
    return { data: filteredOrdersData, error: null };
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return { data: null, error: error };
  }
};
