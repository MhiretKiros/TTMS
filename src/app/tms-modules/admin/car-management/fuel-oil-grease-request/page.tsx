'use client';
import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiLoader, FiSend, FiEdit, FiList, FiXCircle } from 'react-icons/fi';
import { fetchFuelRequests, headMechanicReview, nezekReview } from './services';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const FUEL_REQUEST_API_URL = `${API_BASE_URL}/api/fuel-requests`;

interface RequestFillDetails {
  measurement: string;
  amount: string;
  price: string;
}

interface ItemSectionData {
  type: string;
  requested: RequestFillDetails;
  filled: RequestFillDetails;
  details: string;
}

interface FuelOilGreaseFormData {
  id?: string | number;
  requestDate: string;
  carType: string;
  plateNumber: string;
  kmReading: string;
  shortExplanation: string;
  fuel: ItemSectionData | null;
  motorOil: ItemSectionData | null;
  brakeFluid: ItemSectionData | null;
  steeringFluid: ItemSectionData;
  grease: ItemSectionData;
  mechanicName: string;
  headMechanicName: string;
  headMechanicApproved: boolean | null;
  nezekOfficialName: string;
  nezekOfficialStatus: 'pending' | 'approved' | 'rejected';
  isFulfilled: boolean;
  status?: string;
}

type Role = 'Mechanic' | 'HeadMechanic' | 'NezekOfficial';

const initialRequestFillDetails: RequestFillDetails = {
  measurement: '',
  amount: '',
  price: '',
};

const createInitialItemSectionData = (type: string): ItemSectionData => ({
  type,
  requested: { ...initialRequestFillDetails },
  filled: { ...initialRequestFillDetails },
  details: '',
});

const initialFormData: FuelOilGreaseFormData = {
  requestDate: new Date().toISOString().split('T')[0],
  carType: '',
  plateNumber: '',
  kmReading: '',
  shortExplanation: '',
  fuel: null,
  motorOil: null,
  brakeFluid: null,
  steeringFluid: createInitialItemSectionData('steeringFluid'),
  grease: createInitialItemSectionData('grease'),
  mechanicName: '',
  headMechanicName: '',
  headMechanicApproved: null,
  nezekOfficialName: '',
  nezekOfficialStatus: 'pending',
  isFulfilled: false,
};

interface RequestFillColumnProps {
  title: string;
  data: RequestFillDetails;
  onChange: (field: keyof RequestFillDetails, value: string) => void;
  isReadOnly: boolean;
  itemKey: string;
  fieldPrefix: string;
}

const RequestFillColumn: React.FC<RequestFillColumnProps> = ({ title, data, onChange, isReadOnly, itemKey, fieldPrefix }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof RequestFillDetails, value);
  };

  // Calculate total amount
  const totalAmount =
    (parseFloat(data.amount) || 0) * (parseFloat(data.price) || 0);

  return (
    <div className="p-3 border border-gray-200 rounded-md">
      <h4 className="text-md font-semibold mb-2">{title}</h4>
      <div className="space-y-2">
        <div>
          <label htmlFor={`${itemKey}.${fieldPrefix}.measurement`} className="block text-sm font-medium text-gray-700">Measurement</label>
          <input
            type="text"
            id={`${itemKey}.${fieldPrefix}.measurement`}
            name="measurement"
            value={data.measurement}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor={`${itemKey}.${fieldPrefix}.amount`} className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id={`${itemKey}.${fieldPrefix}.amount`}
            name="amount"
            value={data.amount}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor={`${itemKey}.${fieldPrefix}.price`} className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id={`${itemKey}.${fieldPrefix}.price`}
            name="price"
            value={data.price}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Amount</label>
          <input
            type="number"
            value={totalAmount}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed"
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );
};

const FuelOilGreaseRequestPage = () => {
  const [formData, setFormData] = useState<FuelOilGreaseFormData>(initialFormData);
  const [currentRole, setCurrentRole] = useState<Role>('Mechanic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);
  const [mechanicView, setMechanicView] = useState<'newRequest' | 'pendingFulfillment'>('newRequest');
  const [pendingFulfillmentList, setPendingFulfillmentList] = useState<FuelOilGreaseFormData[]>([]);
  const [isPendingFulfillmentListLoading, setIsPendingFulfillmentListLoading] = useState(false);
  const [requestsList, setRequestsList] = useState<FuelOilGreaseFormData[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | number | null>(null);
  const [mechanicName, setMechanicName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role?.toUpperCase();
        
        // Map role to currentRole
        switch(role) {
          case 'INSPECTOR':
            setCurrentRole('Mechanic');
            break;
          case 'HEAD_OF_MECHANIC':
            setCurrentRole('HeadMechanic');
            break;
          case 'NEZEK':
            setCurrentRole('NezekOfficial');
            break;
          default:
            setCurrentRole('Mechanic');
        }

        // Set mechanic name if available
        if (user.name) {
          setMechanicName(user.name);
          setFormData(prev => ({ ...prev, mechanicName: user.name }));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setCurrentRole('Mechanic');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const transformFetchedDataToFormData = (data: any): FuelOilGreaseFormData => {
    const transformDetails = (details: any): RequestFillDetails => ({
      measurement: details?.measurement?.toString() || '',
      amount: details?.amount?.toString() || '',
      price: details?.price?.toString() || '',
    });

    const transformItem = (itemData: any): ItemSectionData => ({
      type: itemData?.type?.toString() || '',
      requested: transformDetails(itemData?.requested),
      filled: transformDetails(itemData?.filled),
      details: itemData?.details?.toString() || '',
    });

    console.log('API response:', data); // Debug log

    return {
      id: data.id,
      requestDate: data.requestDate ? new Date(data.requestDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      carType: data.carType?.toString() || '',
      plateNumber: data.plateNumber?.toString() || '',
      kmReading: data.kmReading?.toString() || '',
      shortExplanation: data.shortExplanation?.toString() || '',
      fuel: data.fuel ? transformItem(data.fuel) : null,
      motorOil: data.motorOil ? transformItem(data.motorOil) : null,
      brakeFluid: data.brakeFluid ? transformItem(data.brakeFluid) : null,
      steeringFluid: data.steeringFluid ? transformItem(data.steeringFluid) : createInitialItemSectionData('steeringFluid'),
      grease: data.grease ? transformItem(data.grease) : createInitialItemSectionData('grease'),
      mechanicName: data.mechanicName?.toString() || '',
      headMechanicName: data.headMechanicName?.toString() || '',
      headMechanicApproved: data.headMechanicApproved === null ? null : data.headMechanicApproved, // Preserve null for pending
      nezekOfficialName: data.nezekOfficialName?.toString() || '',
      nezekOfficialStatus: data.nezekOfficialStatus?.toLowerCase() || 'pending',
      isFulfilled: data.isFulfilled || false,
      status: data.status?.toUpperCase() || undefined,
    };
  };

  const fetchFuelOilGreaseRequests = async () => {
    setIsListLoading(true);
    setError(null);
    try {
      let data;
      if (currentRole === 'Mechanic') {
        if (!mechanicName) {
          setRequestsList([]);
          setIsListLoading(false);
          return;
        }
        data = await fetchFuelRequests('Mechanic', mechanicName);
      } else {
        data = await fetchFuelRequests(currentRole);
      }
      console.log('Fetched requests:', data); // Debug log
      setRequestsList(Array.isArray(data) ? data.map(transformFetchedDataToFormData) : []);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while loading requests.');
      setRequestsList([]);
    } finally {
      setIsListLoading(false);
    }
  };

  const fetchPendingFulfillmentRequests = async () => {
    setIsPendingFulfillmentListLoading(true);
    setError(null);
    try {
      if (!mechanicName) {
        setPendingFulfillmentList([]);
        setIsPendingFulfillmentListLoading(false);
        return;
      }
      const data = await fetchFuelRequests('Mechanic', mechanicName);
      const pending = Array.isArray(data)
        ? data.filter((req: any) =>
            req.nezekOfficialStatus?.toLowerCase() === 'approved' &&
            !req.isFulfilled
          )
        : [];
      setPendingFulfillmentList(pending.map(transformFetchedDataToFormData));
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while loading pending fulfillment requests.');
      setPendingFulfillmentList([]);
    } finally {
      setIsPendingFulfillmentListLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    
    if (currentRole === 'Mechanic') {
      if (mechanicView === 'pendingFulfillment') {
        fetchPendingFulfillmentRequests();
        setRequestsList([]);
      } else {
        setPendingFulfillmentList([]);
        if (selectedRequestId) handleClearSelection();
      }
    } else {
      fetchFuelOilGreaseRequests();
      setPendingFulfillmentList([]);
    }
  }, [currentRole, mechanicView, mechanicName, loading]);

  const handleSelectRequest = (request: FuelOilGreaseFormData) => {
    setSelectedRequestId(request.id!);
    const transformedData = transformFetchedDataToFormData(request);
    setFormData(transformedData);
    setError(null);
    setSuccessMessage(null);
    console.log('Selected request formData:', transformedData); // Debug log
  };

  const handleClearSelection = () => {
    setSelectedRequestId(null);
    setFormData(initialFormData);
    setError(null);
    setSuccessMessage(null);
  };

  const getIsFieldReadOnly = (fieldName?: string): boolean => {
    if ((currentRole === 'HeadMechanic' || currentRole === 'NezekOfficial') && !selectedRequestId) return true;
    if (currentRole === 'Mechanic' && mechanicView === 'pendingFulfillment' && !selectedRequestId) return true;

    const isRequestFulfilled = !!formData.isFulfilled;
    if (isRequestFulfilled) return true;

    if (currentRole === 'Mechanic') {
      if (mechanicView === 'newRequest') {
        const hasBeenProcessedByOthers = formData.id && (formData.headMechanicApproved !== null || formData.nezekOfficialStatus !== 'pending');
        if (hasBeenProcessedByOthers) return true;
        if (fieldName?.includes('filled.')) return true;
        return false;
      } else {
        const isApprovedForFulfillment = formData.nezekOfficialStatus === 'approved';
        if (!isApprovedForFulfillment) return true;
        if (fieldName?.includes('filled.')) return false;
        return true;
      }
    }

    if (currentRole === 'HeadMechanic') {
      if (fieldName === 'headMechanicName' || fieldName === 'submitButton') {
        return formData.nezekOfficialStatus !== 'pending' || formData.headMechanicApproved !== null || formData.status !== 'PENDING';
      }
      return true;
    }

    if (currentRole === 'NezekOfficial') {
      if (
        fieldName === 'nezekOfficialName' ||
        fieldName === 'submitButton' ||
        fieldName?.includes('filled.') ||
        fieldName?.endsWith('.details')
      ) {
        return !(formData.headMechanicApproved === true && formData.nezekOfficialStatus === 'pending' && formData.status === 'CHECKED');
      }
      return true;
    }

    return true;
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemTypeChange = (
    itemKey: 'fuel' | 'motorOil' | 'brakeFluid',
    type: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [itemKey]: type ? createInitialItemSectionData(type) : null,
    }));
  };

  const handleItemSubFieldChange = (
    itemKey: 'fuel' | 'motorOil' | 'brakeFluid' | 'steeringFluid' | 'grease',
    section: 'requested' | 'filled',
    field: keyof RequestFillDetails,
    value: string
  ) => {
    setFormData(prev => {
      const item = prev[itemKey];
      if (!item) return prev;
      const updatedItem = {
        ...item,
        [section]: {
          ...item[section],
          [field]: value,
        },
      };
      return { ...prev, [itemKey]: updatedItem };
    });
  };

  const handleItemDetailsChange = (
    itemKey: 'fuel' | 'motorOil' | 'brakeFluid' | 'steeringFluid' | 'grease',
    value: string
  ) => {
    setFormData(prev => {
      const item = prev[itemKey];
      if (!item) return prev;
      return { ...prev, [itemKey]: { ...item, details: value } };
    });
  };

  const parseItemDataForSubmission = (item: ItemSectionData | null): any => {
    if (!item) return null;
    const parseDetails = (details: RequestFillDetails) => ({
      measurement: details.measurement,
      amount: parseFloat(details.amount) || 0,
      price: parseFloat(details.price) || 0,
    });
    return {
      type: item.type,
      requested: parseDetails(item.requested),
      filled: parseDetails(item.filled),
      details: item.details,
    };
  };

  const handleSubmit = async (e?: React.FormEvent, customData?: FuelOilGreaseFormData) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const dataToSubmit = customData || formData;
    const nezekStatus = dataToSubmit.nezekOfficialStatus.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED';

    const payloadForSubmission = {
      ...(dataToSubmit.id && { id: dataToSubmit.id }),
      requestDate: dataToSubmit.requestDate,
      carType: dataToSubmit.carType,
      plateNumber: dataToSubmit.plateNumber,
      kmReading: parseFloat(dataToSubmit.kmReading) || 0,
      shortExplanation: dataToSubmit.shortExplanation,
      fuel: parseItemDataForSubmission(dataToSubmit.fuel),
      motorOil: parseItemDataForSubmission(dataToSubmit.motorOil),
      brakeFluid: parseItemDataForSubmission(dataToSubmit.brakeFluid),
      steeringFluid: parseItemDataForSubmission(dataToSubmit.steeringFluid),
      grease: parseItemDataForSubmission(dataToSubmit.grease),
      mechanicName: dataToSubmit.mechanicName,
      headMechanicName: dataToSubmit.headMechanicName,
      headMechanicApproved: dataToSubmit.headMechanicApproved,
      nezekOfficialName: dataToSubmit.nezekOfficialName,
      nezekOfficialStatus: nezekStatus,
      isFulfilled: dataToSubmit.isFulfilled,
      status: dataToSubmit.status,
    };

    const isNewRequest = currentRole === 'Mechanic' && mechanicView === 'newRequest' && !dataToSubmit.id;
    const method = isNewRequest ? 'POST' : 'PUT';
    let url = FUEL_REQUEST_API_URL;
    let endpoint = isNewRequest ? '' : `/${dataToSubmit.id}`;
    if (currentRole === 'HeadMechanic' && dataToSubmit.id) {
      endpoint = `/${dataToSubmit.id}/head-mechanic-review`;
    } else if (currentRole === 'NezekOfficial' && dataToSubmit.id) {
      endpoint = `/${dataToSubmit.id}/nezek-review`;
    } else if (currentRole === 'Mechanic' && mechanicView === 'pendingFulfillment' && dataToSubmit.id) {
      endpoint = `/${dataToSubmit.id}/fulfill`;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${FUEL_REQUEST_API_URL}${endpoint}`, {
        method: method,
        headers: headers,
        body: JSON.stringify(payloadForSubmission),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(`Access Denied: Your current role ('${currentRole}') does not have permission for this action.`);
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const savedRequest = await response.json();
      const transformedSavedRequest = transformFetchedDataToFormData(savedRequest);

      if (isNewRequest) {
        setSuccessMessage(`Fuel request submitted for review! ID: ${savedRequest.id}`);
        handleClearSelection();
      } else {
        if (currentRole === 'Mechanic' && mechanicView === 'pendingFulfillment') {
          setSuccessMessage(`Request ID ${savedRequest.id} fulfilled successfully!`);
          handleClearSelection();
        } else {
          setFormData(transformedSavedRequest);
          setSelectedRequestId(transformedSavedRequest.id!);
          setSuccessMessage(`Request ID ${savedRequest.id} updated successfully! (Role: ${currentRole})`);
        }
      }

      if (currentRole === 'Mechanic') {
        if (mechanicView === 'pendingFulfillment') fetchPendingFulfillmentRequests();
      } else {
        fetchFuelOilGreaseRequests();
      }
    } catch (err: any) {
      console.error('Error processing request:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItemSection = (
    itemKey: 'fuel' | 'motorOil' | 'brakeFluid' | 'steeringFluid' | 'grease',
    title: string,
    options?: { value: string; label: string }[],
    isFixedItem: boolean = false
  ) => {
    const itemData = formData[itemKey];
    const isReadOnlyForTypeSelect = getIsFieldReadOnly(`${itemKey}.type`);
    const isReadOnlyForRequested = getIsFieldReadOnly(`${itemKey}.requested.amount`);
    const isReadOnlyForFilled = getIsFieldReadOnly(`${itemKey}.filled.amount`);
    const isReadOnlyForDetails = getIsFieldReadOnly(`${itemKey}.details`);

    console.log(`Rendering ${itemKey} dropdown:`, {
      type: itemData?.type,
      isReadOnlyForTypeSelect,
      options: options?.map(opt => opt.value) || [],
    });
    
    return (
      <div className="p-4 border border-gray-300 rounded-lg bg-white shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        {options && !isFixedItem && (
          <div className="mb-4">
            <label htmlFor={`${itemKey}-type`} className="block text-sm font-medium text-gray-700">Select Type</label>
            <select
              id={`${itemKey}-type`}
              value={itemData?.type || ''}
              onChange={(e) => handleItemTypeChange(itemKey as 'fuel' | 'motorOil' | 'brakeFluid', e.target.value)}
              disabled={isReadOnlyForTypeSelect}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select --</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {(itemData || isFixedItem) && (itemData || formData[itemKey]) && (
          <div className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <RequestFillColumn
                title="Requested"
                data={(itemData || formData[itemKey])!.requested}
                onChange={(field, value) => handleItemSubFieldChange(itemKey, 'requested', field, value)}
                isReadOnly={isReadOnlyForRequested}
                itemKey={itemKey}
                fieldPrefix="requested"
              />
              <RequestFillColumn
                title="Filled"
                data={(itemData || formData[itemKey])!.filled}
                onChange={(field, value) => handleItemSubFieldChange(itemKey, 'filled', field, value)}
                isReadOnly={isReadOnlyForFilled}
                itemKey={itemKey}
                fieldPrefix="filled"
              />
            </div>
            <div>
              <label htmlFor={`${itemKey}.details`} className="block text-sm font-medium text-gray-700">Details / Remarks</label>
              <textarea
                id={`${itemKey}.details`}
                rows={3}
                value={(itemData || formData[itemKey])!.details}
                onChange={(e) => handleItemDetailsChange(itemKey, e.target.value)}
                readOnly={isReadOnlyForDetails}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTable = (list: FuelOilGreaseFormData[], isLoading: boolean, onRowClick: (req: FuelOilGreaseFormData) => void, tableTitle: string, showFulfilledStatus: boolean = false) => {
    if (isLoading) {
      return <div className="flex justify-center items-center p-10"><FiLoader className="animate-spin text-3xl text-blue-500" /> <span className="ml-2">Loading requests...</span></div>;
    }
    if (list.length === 0) {
      return <p className="text-center text-gray-500 py-5">No requests found or matching current filters.</p>;
    }

    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate No.</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mechanic</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HM Approved</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nezek Status</th>
              {showFulfilledStatus && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfilled</th>}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.map((req) => (
              <tr
                key={req.id}
                onClick={() => onRowClick(req)}
                className={`hover:bg-gray-100 cursor-pointer ${selectedRequestId === req.id ? 'bg-blue-100' : ''} transition-colors duration-150`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.plateNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.mechanicName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {req.headMechanicApproved === true ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span> :
                  //  req.headMechanicApproved === false ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span> :
                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${req.nezekOfficialStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      req.nezekOfficialStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {req.nezekOfficialStatus}
                  </span>
                </td>
                {showFulfilledStatus && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {req.isFulfilled ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Yes</span> :
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">No</span>}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={(e) => { e.stopPropagation(); onRowClick(req); }} className="text-blue-600 hover:text-blue-900 flex items-center">
                    <FiEdit className="mr-1"/> View/Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-grow">
          Vehicle Fuel, Oil & Grease Request
          {currentRole === 'Mechanic' && mechanicView === 'newRequest' && !formData.id && ' (New Request)'}
          {currentRole === 'Mechanic' && mechanicView === 'newRequest' && formData.id && ` (Editing Draft ID: ${formData.id})`}
          {currentRole === 'Mechanic' && mechanicView === 'pendingFulfillment' && selectedRequestId && ` (Fulfilling ID: ${selectedRequestId})`}
          {currentRole === 'HeadMechanic' && selectedRequestId && ` (Reviewing ID: ${selectedRequestId})`}
          {currentRole === 'NezekOfficial' && selectedRequestId && ` (Reviewing ID: ${selectedRequestId})`}
        </h1>
        <div className="text-right">
          <label htmlFor="requestDate" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="requestDate"
            name="requestDate"
            value={formData.requestDate}
            onChange={handleGeneralChange}
            readOnly={getIsFieldReadOnly('requestDate')}
            className="mt-1 w-full md:w-auto border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>


      {currentRole === 'Mechanic' && (
        <div className="my-6 p-4 bg-white shadow rounded-lg flex space-x-2">
          <button
            onClick={() => { setMechanicView('newRequest'); handleClearSelection(); }}
            disabled={mechanicView === 'newRequest'}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${mechanicView === 'newRequest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Create New Request
          </button>
          <button
            onClick={() => { setMechanicView('pendingFulfillment'); handleClearSelection(); }}
            disabled={mechanicView === 'pendingFulfillment'}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${mechanicView === 'pendingFulfillment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Pending Fulfillment <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-yellow-200 text-yellow-800">{pendingFulfillmentList.length}</span>
          </button>
        </div>
      )}

      {error && (
        <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center justify-between">
          <FiAlertCircle className="mr-2" /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <FiXCircle size={18}/>
          </button>
        </div>
      )}
      {successMessage && !error && (
        <div className="my-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md flex items-center">
          <FiCheckCircle className="mr-2" /> {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-500 hover:text-green-700">
            <FiXCircle size={18}/>
          </button>
        </div>
      )}

      {currentRole !== 'Mechanic' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-semibold text-gray-700">Requests for Review</h2>
            <button
              onClick={fetchFuelOilGreaseRequests}
              disabled={isListLoading}
              className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center transition-colors duration-150"
            >
              {isListLoading ? <FiLoader className="animate-spin mr-2" /> : <FiList className="mr-2" />} Refresh List
            </button>
          </div>
          {renderTable(requestsList, isListLoading, handleSelectRequest, "Requests for Review", true)}
        </div>
      )}

      {currentRole === 'Mechanic' && mechanicView === 'pendingFulfillment' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-semibold text-gray-700">Requests Pending Fulfillment</h2>
            <button
              onClick={fetchPendingFulfillmentRequests}
              disabled={isPendingFulfillmentListLoading}
              className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center transition-colors duration-150"
            >
              {isPendingFulfillmentListLoading ? <FiLoader className="animate-spin mr-2" /> : <FiList className="mr-2" />} Refresh List
            </button>
          </div>
          {renderTable(pendingFulfillmentList, isPendingFulfillmentListLoading, handleSelectRequest, "Pending Fulfillment by Mechanic")}
        </div>
      )}

      {(currentRole === 'Mechanic' && mechanicView === 'newRequest') ||
       (currentRole === 'Mechanic' && mechanicView === 'pendingFulfillment' && selectedRequestId !== null) ||
       ((currentRole === 'HeadMechanic' || currentRole === 'NezekOfficial') && selectedRequestId !== null) ? (
        <form onSubmit={handleSubmit}>
          {selectedRequestId && (currentRole !== 'Mechanic' || (currentRole === 'Mechanic' && mechanicView === 'pendingFulfillment')) && (
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={handleClearSelection} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                <FiXCircle className="mr-1"/> Close Form / Deselect Request
              </button>
            </div>
          )}
          <div className="p-6 border border-gray-300 rounded-lg mb-6 bg-white shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Request Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">Plate Number</label>
                <input type="text" name="plateNumber" id="plateNumber" value={formData.plateNumber} onChange={handleGeneralChange} readOnly={getIsFieldReadOnly('plateNumber')} className="mt-1 block w-full input-class" required />
              </div>
              <div>
                <label htmlFor="carType" className="block text-sm font-medium text-gray-700">Car Type</label>
                <input type="text" name="carType" id="carType" value={formData.carType} onChange={handleGeneralChange} readOnly={getIsFieldReadOnly('carType')} className="mt-1 block w-full input-class" required />
              </div>
              <div>
                <label htmlFor="kmReading" className="block text-sm font-medium text-gray-700">KM Reading</label>
                <input type="number" name="kmReading" id="kmReading" value={formData.kmReading} onChange={handleGeneralChange} readOnly={getIsFieldReadOnly('kmReading')} className="mt-1 block w-full input-class" required />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="shortExplanation" className="block text-sm font-medium text-gray-700">Short Explanation / Reason for Request</label>
              <textarea name="shortExplanation" id="shortExplanation" rows={3} value={formData.shortExplanation} onChange={handleGeneralChange} readOnly={getIsFieldReadOnly('shortExplanation')} className="mt-1 block w-full input-class" required />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {renderItemSection('fuel', 'Fuel Types', [
              { value: 'petroleum', label: 'Petroleum' },
              { value: 'diesel', label: 'Diesel' },
            ])}
            {renderItemSection('motorOil', 'Motor Oil', [
              { value: 'num30', label: 'Number 30' },
              { value: 'num40', label: 'Number 40' },
            ])}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {renderItemSection('brakeFluid', 'Brake Fluid (Gear Oil)', [
              { value: 'num90', label: 'Gear Oil No. 90' },
              { value: 'num140', label: 'Gear Oil No. 140' },
              { value: 'atf', label: 'ATF' },
            ])}
            {renderItemSection('steeringFluid', 'Steering Fluid', undefined, true)}
          </div>
          <div className="mb-6">
            {renderItemSection('grease', 'Grease', undefined, true)}
          </div>

          <div className="p-6 border border-gray-300 rounded-lg mt-6 bg-white shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Action / Approval</h2>
            {currentRole === 'Mechanic' && mechanicView === 'newRequest' && (
              <div>
                <label htmlFor="mechanicName" className="block text-sm font-medium text-gray-700">Mechanic Name</label>
                <input type="text" name="mechanicName" id="mechanicName" value={formData.mechanicName} onChange={handleGeneralChange} readOnly={getIsFieldReadOnly('mechanicName')} className="mt-1 block w-full md:w-1/2 input-class" required />
                <button type="submit" disabled={isLoading || getIsFieldReadOnly('submitButton')} className="mt-4 btn-primary flex items-center transition-colors duration-150">
                  {isLoading ?
                    <><FiLoader className="animate-spin mr-2" /> Submitting...</> :
                    <><FiSend className="mr-2" /> {formData.id ? 'Update Draft' : 'Submit New Request'}</>
                  }
                </button>
              </div>
            )}
            {currentRole === 'Mechanic' && mechanicView === 'pendingFulfillment' && selectedRequestId && !formData.isFulfilled && (
              <div>
                <p className="text-sm text-gray-600 mb-2">You are now fulfilling this approved request. Please enter the "Filled" details above.</p>
                <button type="submit" disabled={isLoading || getIsFieldReadOnly('submitButton')} className="mt-4 btn-primary flex items-center transition-colors duration-150">
                  {isLoading ? <><FiLoader className="animate-spin mr-2" /> Saving Fulfillment...</> : <><FiCheckCircle className="mr-2" /> Save Fulfillment Details</>}
                </button>
              </div>
            )}
            {currentRole === 'HeadMechanic' && selectedRequestId && !formData.isFulfilled && (
              <div>
                <label htmlFor="headMechanicName" className="block text-sm font-medium text-gray-700">Head of Mechanic Name</label>
                <input type="text" name="headMechanicName" id="headMechanicName" value={formData.headMechanicName} onChange={handleGeneralChange} readOnly={getIsFieldReadOnly('headMechanicName')} className="mt-1 block w-full md:w-1/2 input-class" required />
                <div className="mt-4 space-x-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const updatedForm = { ...formData, headMechanicApproved: true };
                      setFormData(updatedForm);
                      await handleSubmit(undefined, updatedForm);
                    }}
                    disabled={isLoading || formData.headMechanicApproved !== null || formData.status !== 'PENDING'}
                    className="btn-success flex items-center transition-colors duration-150"
                  >
                    {isLoading && formData.headMechanicApproved !== true ? <FiLoader className="animate-spin mr-2" /> : null}
                    Approve Request
                  </button>
                </div>
                {formData.headMechanicApproved !== null && <p className="mt-2 text-sm">Status by Head Mechanic: {formData.headMechanicApproved ? "Approved" : "Rejected"}</p>}
              </div>
            )}
            {currentRole === 'NezekOfficial' && selectedRequestId && !formData.isFulfilled && (
              <div>
                <label htmlFor="nezekOfficialName" className="block text-sm font-medium text-gray-700">NEZEK Official Name</label>
                <input
                  type="text"
                  name="nezekOfficialName"
                  id="nezekOfficialName"
                  value={formData.nezekOfficialName}
                  onChange={handleGeneralChange}
                  readOnly={getIsFieldReadOnly('nezekOfficialName')}
                  className="mt-1 block w-full md:w-1/2 input-class"
                  required
                />
                <div className="mt-4 space-x-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const updatedForm = { ...formData, nezekOfficialStatus: 'approved' as const };
                      setFormData(updatedForm);
                      await handleSubmit(undefined, updatedForm);
                    }}
                    disabled={isLoading || formData.nezekOfficialStatus !== 'pending' || formData.headMechanicApproved !== true || formData.status !== 'CHECKED'}
                    className="btn-success flex items-center transition-colors duration-150"
                  >
                    {isLoading && formData.nezekOfficialStatus !== 'approved' ? <FiLoader className="animate-spin mr-2" /> : null}
                    Approve & Finalize
                  </button>
                </div>
                {(formData.nezekOfficialStatus !== 'pending' || formData.headMechanicApproved !== true || formData.status !== 'CHECKED') && !isLoading && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.nezekOfficialStatus !== 'pending'
                      ? `Final Status: ${formData.nezekOfficialStatus}`
                      : formData.headMechanicApproved !== true
                      ? 'Cannot take action: Request must be approved by Head Mechanic first.'
                      : formData.status !== 'CHECKED'
                      ? 'Cannot take action: Request must be in CHECKED status.'
                      : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </form>
      ) : null}
      <style jsx global>{`
        .input-class {
          border: 1px solid #D1D5DB;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding: 0.5rem 0.75rem;
        }
        .input-class:focus {
          outline: 2px solid transparent;
          --tw-ring-color: #3B82F6;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px var(--tw-ring-color);
        }
        .input-class[readonly] {
          background-color: #F3F4F6;
          cursor: not-allowed;
        }
        .btn-primary {
          background-color: #2563EB;
          color: white;
          font-weight: bold;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #1D4ED8;
        }
        .btn-primary:disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }
        .btn-success {
          background-color: #16A34A;
          color: white;
          font-weight: bold;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
        }
        .btn-success:hover:not(:disabled) {
          background-color: #15803D;
        }
        .btn-success:disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }
        .btn-danger {
          background-color: #DC2626;
          color: white;
          font-weight: bold;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
        }
        .btn-danger:hover:not(:disabled) {
          background-color: #B91C1C;
        }
        .btn-danger:disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default FuelOilGreaseRequestPage;