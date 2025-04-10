"use client";
import { useState, useEffect } from 'react';
import { FuelRequest, TravelRequest } from '../../types/fuelTypes';
import { FuelApi, TravelApi } from '../../api/fuelApi';
import { SearchBar } from '../SearchBar';
import styles from './styles.module.css';

interface FuelRequestFormProps {
  travelRequest?: TravelRequest;
  onRequestComplete: (requestId: string) => void;
  onSearchResultSelect?: (request: TravelRequest) => void;
  isManager?: boolean;
}

export const FuelRequestForm = ({ 
  travelRequest, 
  onRequestComplete, 
  onSearchResultSelect,
  isManager = false 
}: FuelRequestFormProps) => {
  const [formData, setFormData] = useState<Omit<FuelRequest, 'id' | 'status' | 'dateRequested'>>({
    serviceNumber: '',
    travelers: [''],
    startingPlace: '',
    destinationPlace: '',
    startingDate: '',
    endingDate: '',
    travelDistance: 0,
    vehicleType: '',
    licensePlate: '',
    assignedDriver: '',
    tripExplanation: '',
    requestedFuelAmount: 0,
    authorizerName: '',
    accountNumber: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TravelRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (travelRequest) {
      setFormData(prev => ({
        ...prev,
        serviceNumber: isManager ? '' : `FUEL-${travelRequest.id}-${new Date().getTime()}`,
        travelers: travelRequest.travelers.map(t => t.name),
        startingPlace: travelRequest.startingPlace,
        destinationPlace: travelRequest.destinationPlace,
        startingDate: travelRequest.startingDate.split('T')[0],
        endingDate: travelRequest.returnDate?.split('T')[0] || '',
        travelDistance: travelRequest.travelDistance || calculateDistance(),
        vehicleType: travelRequest.assignedCarType || '',
        licensePlate: travelRequest.vehicleDetails || '',
        assignedDriver: travelRequest.assignedDriver || '',
        tripExplanation: travelRequest.travelReason,
        requestedFuelAmount: prev.requestedFuelAmount,
        authorizerName: prev.authorizerName,
        accountNumber: prev.accountNumber
      }));
    }
  }, [travelRequest, isManager]);

  const calculateDistance = () => {
    return 100; // Default value
  };

  useEffect(() => {
    if (searchQuery.trim() && onSearchResultSelect) {
      const timer = setTimeout(() => {
        TravelApi.searchRequests(searchQuery).then(setSearchResults);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, onSearchResultSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const createdRequest = await FuelApi.createRequest({
        ...formData,
        serviceNumber: formData.serviceNumber || `FUEL-${Date.now()}`
      });
      onRequestComplete(createdRequest.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTravelerChange = (index: number, value: string) => {
    const newTravelers = [...formData.travelers];
    newTravelers[index] = value;
    setFormData({...formData, travelers: newTravelers});
  };

  const addTraveler = () => {
    setFormData({...formData, travelers: [...formData.travelers, '']});
  };

  const removeTraveler = (index: number) => {
    if (formData.travelers.length <= 1) return;
    const newTravelers = [...formData.travelers];
    newTravelers.splice(index, 1);
    setFormData({...formData, travelers: newTravelers});
  };

  const isFieldDisabled = (fieldName: keyof typeof formData) => {
    if (isManager) {
      const editableFields: (keyof typeof formData)[] = [
        'requestedFuelAmount',
        'authorizerName',
        'accountNumber',
        'serviceNumber'
      ];
      return !editableFields.includes(fieldName);
    }
    return !!travelRequest;
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Fuel Request</h2>
      
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
                  onSearchResultSelect(request);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={styles.formGroup}>
            <label>Service Number *</label>
            <input
              type="text"
              value={formData.serviceNumber}
              onChange={(e) => setFormData({...formData, serviceNumber: e.target.value})}
              disabled={!isManager}
              required
            />
          </div>
          
          <div className={`${styles.formGroup} md:col-span-2`}>
            <label>Travelers *</label>
            <div className="space-y-2">
              {formData.travelers.map((traveler, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={traveler}
                    onChange={(e) => handleTravelerChange(index, e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-md ${isFieldDisabled('travelers') ? 'bg-gray-100 border-gray-200' : 'border-gray-300'}`}
                    disabled={isFieldDisabled('travelers')}
                    required
                  />
                  {!isFieldDisabled('travelers') && formData.travelers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTraveler(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {!isFieldDisabled('travelers') && (
                <button
                  type="button"
                  onClick={addTraveler}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  + Add another traveler
                </button>
              )}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Starting Place *</label>
            <input
              type="text"
              value={formData.startingPlace}
              onChange={(e) => setFormData({...formData, startingPlace: e.target.value})}
              disabled={isFieldDisabled('startingPlace')}
              className={isFieldDisabled('startingPlace') ? 'bg-gray-100' : ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Destination Place *</label>
            <input
              type="text"
              value={formData.destinationPlace}
              onChange={(e) => setFormData({...formData, destinationPlace: e.target.value})}
              disabled={isFieldDisabled('destinationPlace')}
              className={isFieldDisabled('destinationPlace') ? 'bg-gray-100' : ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Starting Date *</label>
            <input
              type="date"
              value={formData.startingDate}
              onChange={(e) => setFormData({...formData, startingDate: e.target.value})}
              disabled={isFieldDisabled('startingDate')}
              className={isFieldDisabled('startingDate') ? 'bg-gray-100' : ''}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Ending Date</label>
            <input
              type="date"
              value={formData.endingDate}
              onChange={(e) => setFormData({...formData, endingDate: e.target.value})}
              disabled={isFieldDisabled('endingDate')}
              min={formData.startingDate}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Travel Distance (km) *</label>
            <input
              type="number"
              value={formData.travelDistance || ''}
              onChange={(e) => setFormData({...formData, travelDistance: Number(e.target.value)})}
              disabled={isFieldDisabled('travelDistance')}
              required
              min="0"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Vehicle Type *</label>
            <input
              type="text"
              value={formData.vehicleType}
              onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
              disabled={isFieldDisabled('vehicleType')}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>License Plate *</label>
            <input
              type="text"
              value={formData.licensePlate}
              onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
              disabled={isFieldDisabled('licensePlate')}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Assigned Driver *</label>
            <input
              type="text"
              value={formData.assignedDriver}
              onChange={(e) => setFormData({...formData, assignedDriver: e.target.value})}
              disabled={isFieldDisabled('assignedDriver')}
              required
            />
          </div>
          
          <div className={`${styles.formGroup} md:col-span-2`}>
            <label>Trip Explanation</label>
            <textarea
              value={formData.tripExplanation}
              onChange={(e) => setFormData({...formData, tripExplanation: e.target.value})}
              disabled={isFieldDisabled('tripExplanation')}
              rows={3}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Requested Fuel Amount (Liters) *</label>
            <input
              type="number"
              value={formData.requestedFuelAmount || ''}
              onChange={(e) => setFormData({...formData, requestedFuelAmount: Number(e.target.value)})}
              required
              min="0"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Authorizer Name *</label>
            <input
              type="text"
              value={formData.authorizerName}
              onChange={(e) => setFormData({...formData, authorizerName: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Account Number *</label>
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
          {isSubmitting ? 'Submitting...' : 'Submit Fuel Request'}
        </button>
      </form>
    </div>
  );
};