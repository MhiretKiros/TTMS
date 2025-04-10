"use client";
import { useState, useEffect } from 'react';
import { FuelRequest, FuelReturn } from '../../types/fuelTypes';
import { FuelApi } from '../../api/fuelApi';
import styles from './styles.module.css';

interface FuelReturnFormProps {
  request?: FuelRequest;
  onReturnSubmit: (returnData: FuelReturn) => void;
}

export const FuelReturnForm = ({ request, onReturnSubmit }: FuelReturnFormProps) => {
  const [formData, setFormData] = useState<Omit<FuelReturn, 'id' | 'dateReturned'>>({
    requestId: request?.id || '',
    serviceDepartment: '',
    serviceNumber: request?.serviceNumber || '',
    requiredService: request?.requiredService || '',
    vehicleType: request?.vehicleType || '',
    licensePlate: request?.licensePlate || '',
    assignedDriver: request?.assignedDriver || '',
    departureTime: '',
    returnTime: '',
    dutyTravelKm: 0,
    garageKm: 0,
    assemblyName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setFormData(prev => ({
        ...prev,
        requestId: request.id,
        serviceNumber: request.serviceNumber,
        requiredService: request.requiredService,
        vehicleType: request.vehicleType,
        licensePlate: request.licensePlate,
        assignedDriver: request.assignedDriver
      }));
    }
  }, [request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await FuelApi.completeRequest(formData.requestId, formData);
      onReturnSubmit(result.return);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Fuel Return from Field</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={styles.formGroup}>
            <label>Service Department</label>
            <input
              type="text"
              value={formData.serviceDepartment}
              onChange={(e) => setFormData({...formData, serviceDepartment: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Service Number</label>
            <input
              type="text"
              value={formData.serviceNumber}
              onChange={(e) => setFormData({...formData, serviceNumber: e.target.value})}
              required
              readOnly
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Required Service</label>
            <input
              type="text"
              value={formData.requiredService}
              onChange={(e) => setFormData({...formData, requiredService: e.target.value})}
              required
              readOnly
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Vehicle Type</label>
            <input
              type="text"
              value={formData.vehicleType}
              onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
              required
              readOnly
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>License Plate</label>
            <input
              type="text"
              value={formData.licensePlate}
              onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
              required
              readOnly
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Assigned Driver</label>
            <input
              type="text"
              value={formData.assignedDriver}
              onChange={(e) => setFormData({...formData, assignedDriver: e.target.value})}
              required
              readOnly
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Departure Time</label>
            <input
              type="time"
              value={formData.departureTime}
              onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Return Time</label>
            <input
              type="time"
              value={formData.returnTime}
              onChange={(e) => setFormData({...formData, returnTime: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Duty Travel (km)</label>
            <input
              type="number"
              value={formData.dutyTravelKm || ''}
              onChange={(e) => setFormData({...formData, dutyTravelKm: Number(e.target.value)})}
              required
              min="0"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Garage (km)</label>
            <input
              type="number"
              value={formData.garageKm || ''}
              onChange={(e) => setFormData({...formData, garageKm: Number(e.target.value)})}
              required
              min="0"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Assembly Name</label>
            <input
              type="text"
              value={formData.assemblyName}
              onChange={(e) => setFormData({...formData, assemblyName: e.target.value})}
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !formData.requestId}
          className={`${styles.submitButton} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Processing...' : 'Complete Request'}
        </button>
      </form>
    </div>
  );
};