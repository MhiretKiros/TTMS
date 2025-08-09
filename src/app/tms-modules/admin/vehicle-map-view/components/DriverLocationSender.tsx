'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { vehicleWebSocket } from '../utils/vehicleWebSocket';

interface DriverVehicleInfo {
  deviceImei: string;
  plateNumber: string;
}

export default function DriverLocationSender() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<DriverVehicleInfo | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Check if user is a driver and get their vehicle info
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === 'DRIVER') {
            const vehicleData = user.vehicle || user.assignedVehicle;
            if (vehicleData?.deviceImei) {
              setVehicleInfo({
                deviceImei: vehicleData.deviceImei,
                plateNumber: vehicleData.plateNumber || 'Unknown'
              });
              setIsActive(true);
            } else {
              setError('No vehicle information found for this driver');
            }
          }
        } catch (err) {
          console.error('Error parsing user data', err);
        }
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  const sendLocationUpdate = useCallback(async (position: GeolocationPosition) => {
    if (!vehicleInfo || !isMounted.current) return;

    const gpsData = {
      imei: vehicleInfo.deviceImei || 'gps004',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: position.coords.speed || 0,
      heading: position.coords.heading || 0,
      timestamp: new Date().toISOString()
    };

    try {
      const success = await vehicleWebSocket.sendGpsData(gpsData);
      if (!isMounted.current) return;

      if (success) {
        setLastSent(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError('Failed to send location update. Trying to reconnect...');
        await vehicleWebSocket.connect();
      }
    } catch (err) {
      if (!isMounted.current) return;
      setError(`Error sending location: ${err instanceof Error ? err.message : 'Unknown error'}`);
      await vehicleWebSocket.connect();
    }
  }, [vehicleInfo]);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const errorCallback: PositionErrorCallback = (positionError) => {
        let errorMessage = 'Geolocation error: ';
        switch(positionError.code) {
          case positionError.PERMISSION_DENIED:
            errorMessage += 'Permission denied';
            break;
          case positionError.POSITION_UNAVAILABLE:
            errorMessage += 'Position unavailable';
            break;
          case positionError.TIMEOUT:
            errorMessage += 'Request timed out';
            break;
          default:
            errorMessage += positionError.message || 'Unknown error';
        }
        reject(new Error(errorMessage));
      };

      navigator.geolocation.getCurrentPosition(
        resolve,
        errorCallback,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  // Setup geolocation tracking when active
  useEffect(() => {
    if (!isActive || !vehicleInfo || !isMounted.current) return;

    let watchId: number | null = null;
    let intervalId: NodeJS.Timeout;
    let isTrackingActive = true;

    const startTracking = async () => {
      try {
        // Initial position
        const position = await getCurrentPosition();
        if (isTrackingActive && isMounted.current) {
          await sendLocationUpdate(position);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to get initial position');
        }
      }

      // Periodic updates
      intervalId = setInterval(async () => {
        if (!isTrackingActive || !isMounted.current) return;
        
        try {
          const position = await getCurrentPosition();
          if (isTrackingActive && isMounted.current) {
            await sendLocationUpdate(position);
          }
        } catch (err) {
          if (isMounted.current) {
            setError(err instanceof Error ? err.message : 'Periodic update failed');
          }
        }
      }, 10000);

      // Continuous position watching (for better accuracy)
      watchId = navigator.geolocation.watchPosition(
        () => {}, // We don't use this for sending, just for better accuracy
        (positionError) => {
          if (isMounted.current) {
            let watchError = 'Watch error: ';
            switch(positionError.code) {
              case positionError.PERMISSION_DENIED:
                watchError += 'Permission denied';
                break;
              case positionError.POSITION_UNAVAILABLE:
                watchError += 'Position unavailable';
                break;
              case positionError.TIMEOUT:
                watchError += 'Request timed out';
                break;
              default:
                watchError += positionError.message || 'Unknown error';
            }
            setError(watchError);
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );

      if (isMounted.current) {
        setIsTracking(true);
      }
    };

    startTracking();

    return () => {
      isTrackingActive = false;
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (isMounted.current) {
        setIsTracking(false);
      }
    };
  }, [isActive, vehicleInfo, sendLocationUpdate, getCurrentPosition]);

  if (!isActive) {
    return null;
  }

  const handleDismissError = () => {
    setError(null);
  };

  const handleStopTracking = () => {
    setIsActive(false);
    setIsTracking(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-md text-sm max-w-xs z-50">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium mb-1">Driver Location Tracking</h3>
          {vehicleInfo && (
            <p className="text-xs text-gray-600 mb-2">
              Vehicle: {vehicleInfo.plateNumber} (IMEI: {vehicleInfo.deviceImei})
            </p>
          )}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>{isTracking ? 'Active' : 'Inactive'}</span>
          </div>
          {lastSent && (
            <p className="text-xs text-gray-500 mt-1">
              Last sent: {lastSent}
            </p>
          )}
        </div>
        <button
          onClick={handleStopTracking}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close tracking"
        >
          ×
        </button>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={handleDismissError}
            className="ml-2 text-red-700 hover:underline focus:outline-none"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}