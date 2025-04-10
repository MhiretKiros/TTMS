"use client";
import { useState, useEffect } from 'react';
import { FuelRequest } from '../../types/fuelTypes';
import { FuelApi } from '../../api/fuelApi';
import { SearchBar } from '../SearchBar';
import styles from './styles.module.css';

interface FuelRequestFormProps {
  travelRequestId?: number;
  defaultValues?: Partial<Omit<FuelRequest, 'id' | 'status' | 'dateRequested'>>;
  onSuccess: () => void;
  onRequestComplete?: (requestId: string) => void;
  onSearchResultSelect?: (request: FuelRequest) => void;
}

export const FuelRequestForm = ({ 
  travelRequestId, 
  defaultValues, 
  onSuccess,
  onRequestComplete, 
  onSearchResultSelect 
}: FuelRequestFormProps) => {
  const [formData, setFormData] = useState<Omit<FuelRequest, 'id' | 'status' | 'dateRequested'>>({
    serviceNumber: '',
    workLocation: '',
    travelerName: '',
    requiredService: '',
    travelDistance: 0,
    vehicleType: '',
    licensePlate: '',
    assignedDriver: '',
    tripExplanation: '',
    requestedFuelAmount: 0,
    authorizerName: '',
    accountNumber: '',
    ...defaultValues
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FuelRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(!!defaultValues);

  useEffect(() => {
    if (defaultValues) {
      setFormData(prev => ({
        ...prev,
        ...defaultValues
      }));
      setIsReadOnly(true);
    }
  }, [defaultValues]);

  useEffect(() => {
    if (searchQuery.trim() && !isReadOnly) {
      const timer = setTimeout(() => {
        FuelApi.searchRequests(searchQuery).then(setSearchResults);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, isReadOnly]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (travelRequestId) {
        // Submit with travel request ID
        await FuelApi.createRequestForTravel(travelRequestId, formData);
        onSuccess();
      } else if (onRequestComplete) {
        // Original standalone form behavior
        const createdRequest = await FuelApi.createRequest(formData);
        onRequestComplete(createdRequest.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Fuel Request for Fieldwork</h2>
      
      {!isReadOnly && (
        <div className="mb-6">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search service requests..."
          />
          {searchResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {searchResults.map(request => (
                <div 
                  key={request.id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  onClick={() => {
                    onSearchResultSelect?.(request);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <div className="font-medium">{request.serviceNumber} - {request.travelerName}</div>
                  <div className="text-sm text-gray-500">{request.workLocation} • {request.vehicleType}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={styles.formGroup}>
            <label>Service Number</label>
            <input
              type="text"
              value={formData.serviceNumber}
              onChange={(e) => !isReadOnly && setFormData({...formData, serviceNumber: e.target.value})}
              required
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Work Location</label>
            <input
              type="text"
              value={formData.workLocation}
              onChange={(e) => !isReadOnly && setFormData({...formData, workLocation: e.target.value})}
              required
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Traveler Name</label>
            <input
              type="text"
              value={formData.travelerName}
              onChange={(e) => !isReadOnly && setFormData({...formData, travelerName: e.target.value})}
              required
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Required Service</label>
            <input
              type="text"
              value={formData.requiredService}
              onChange={(e) => !isReadOnly && setFormData({...formData, requiredService: e.target.value})}
              required
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Travel Distance (km)</label>
            <input
              type="number"
              value={formData.travelDistance || ''}
              onChange={(e) => !isReadOnly && setFormData({...formData, travelDistance: Number(e.target.value)})}
              required
              min="0"
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Vehicle Type</label>
            <input
              type="text"
              value={formData.vehicleType}
              onChange={(e) => !isReadOnly && setFormData({...formData, vehicleType: e.target.value})}
              required
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>License Plate</label>
            <input
              type="text"
              value={formData.licensePlate}
              onChange={(e) => !isReadOnly && setFormData({...formData, licensePlate: e.target.value})}
              required
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Assigned Driver</label>
            <input
              type="text"
              value={formData.assignedDriver}
              onChange={(e) => !isReadOnly && setFormData({...formData, assignedDriver: e.target.value})}
              required
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={`${styles.formGroup} md:col-span-2`}>
            <label>Trip Explanation</label>
            <textarea
              value={formData.tripExplanation}
              onChange={(e) => !isReadOnly && setFormData({...formData, tripExplanation: e.target.value})}
              rows={3}
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Requested Fuel Amount</label>
            <input
              type="number"
              value={formData.requestedFuelAmount || ''}
              onChange={(e) => setFormData({...formData, requestedFuelAmount: Number(e.target.value)})}
              required
              min="0"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Authorizer Name</label>
            <input
              type="text"
              value={formData.authorizerName}
              onChange={(e) => setFormData({...formData, authorizerName: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${styles.submitButton} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};