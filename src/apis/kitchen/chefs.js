const chefsStats = {
  totalChefs: 10,
  availableChefs: 5,
  busyChefs: 5,
  averagePrepTimeInMinutes: 15,
};

const dummyChefs = [
  { 
    name: "Isuru Udara", 
    role: "Executive Chef", 
    status: "Available", 
    mealsAssigned: 42, 
    avgPrepTime: "11m 40s", 
  },
  { 
    name: "Kamal Perera", 
    role: "Sous Chef", 
    status: "Busy", 
    mealsAssigned: 28, 
    avgPrepTime: "14m 15s", 
  },
  { 
    name: "Amal Silva", 
    role: "Line Cook", 
    status: "Offline", 
    mealsAssigned: 0, 
    avgPrepTime: "N/A", 
  },
  { 
    name: "Nimal J.", 
    role: "Pastry Chef", 
    status: "Available", 
    mealsAssigned: 12, 
    avgPrepTime: "18m 05s", 
  }
];


export const getChefsStatsAPI = async () => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   `https://mpc2e51a3b857d0cbb58.free.beeceptor.com/chefs-stats`,
    // );
    // const data = await response.json();
    // return {data, error: null};
    return { data: chefsStats, error: null };
  } catch (error) {
    console.error("Error fetching chefs stats:", error);
    return { data: null, error: error };
  }
};

export const getChefsAPI = async () => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   `https://mpc2e51a3b857d0cbb58.free.beeceptor.com/chefs`,
    // );
    // const data = await response.json();
    // return {data, error: null};
    return { data: dummyChefs, error: null };
  } catch (error) {
    console.error("Error fetching chefs:", error);
    return { data: null, error: error };
  }
};


