// c:\Users\biruk\Desktop\TMS\TMS-frontendd\src\app\contexts\NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface InspectedBus {
  organizationCar?: {
    plateNumber: string;
    // Add other relevant properties if needed
  };
  // Add other bus properties if needed
}

interface AssignedRouteInfo {
  plateNumber: string;
  // Add other relevant properties if needed
}

interface NewlyRegisteredCar {
  plateNumber: string; // Or any unique identifier
  // Add other relevant properties if needed
}

interface NotificationContextType {
  unassignedInspectedBusesCount: number;
  newRegisteredCarsCount: number;
  isLoadingNotifications: boolean;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

async function fetchAllInspectedBuses(): Promise<InspectedBus[]> {
  // Ensure this URL is correct and your backend is running
  const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/service-buses');
  if (!res.ok) throw new Error('Failed to fetch inspected vehicles');
  const data = await res.json();
  return (data.cars || data.organizationCarList || []).filter(
    (bus: any) => bus.organizationCar && bus.organizationCar.plateNumber
  );
}

async function fetchAllAssignedRoutes(): Promise<AssignedRouteInfo[]> {
  // Ensure this URL is correct and your backend is running
  const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/assigned-routes');
  if (!res.ok) throw new Error('Failed to fetch assigned routes');
  const data = await res.json();
  return data.assignedRoutes || data || [];
}

// Placeholder: Replace with your actual API call for newly registered cars
async function fetchAllNewlyRegisteredCars(): Promise<NewlyRegisteredCar[]> {
  // Example: const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/newly-registered');
  // if (!res.ok) throw new Error('Failed to fetch newly registered cars');
  // const data = await res.json();
  // return data.newCars || data || [];
  console.warn("fetchAllNewlyRegisteredCars is using placeholder data. Implement actual API call.");
  return Promise.resolve([]); // Replace with actual fetch
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inspectedBuses, setInspectedBuses] = useState<InspectedBus[]>([]);
  const [assignedRoutes, setAssignedRoutes] = useState<AssignedRouteInfo[]>([]);
  const [newlyRegisteredCars, setNewlyRegisteredCars] = useState<NewlyRegisteredCar[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  const fetchData = async () => {
    setIsLoadingNotifications(true);
    try {
      const [busesData, routesData, newCarsData] = await Promise.all([
        fetchAllInspectedBuses(),
        fetchAllAssignedRoutes(),
        fetchAllNewlyRegisteredCars(), // Fetch new cars
      ]);
      setInspectedBuses(busesData);
      setAssignedRoutes(routesData);
      setNewlyRegisteredCars(newCarsData);
    } catch (error) {
      console.error("Error fetching notification data:", error);
      // Optionally, set an error state here to display in UI
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchData();
    // You might want to add a polling mechanism or WebSocket for real-time updates
    // const intervalId = setInterval(fetchData, 60000); // Example: Refresh every 60 seconds
    // return () => clearInterval(intervalId);
  }, []);

  const unassignedInspectedBusesCount = useMemo(() => {
    if (isLoadingNotifications) return 0; // Don't calculate if still loading
    const assignedPlateNumbers = new Set(assignedRoutes.map(route => route.plateNumber));
    return inspectedBuses.filter(bus => bus.organizationCar && !assignedPlateNumbers.has(bus.organizationCar.plateNumber)).length;
  }, [inspectedBuses, assignedRoutes, isLoadingNotifications]);

  const newRegisteredCarsCount = useMemo(() => {
    if (isLoadingNotifications) return 0;
    return newlyRegisteredCars.length;
  }, [newlyRegisteredCars, isLoadingNotifications]);

  return (
    <NotificationContext.Provider value={{ unassignedInspectedBusesCount, newRegisteredCarsCount, isLoadingNotifications, refreshNotifications: fetchData }}>
      {children}
    </NotificationContext.Provider>
  );
};
