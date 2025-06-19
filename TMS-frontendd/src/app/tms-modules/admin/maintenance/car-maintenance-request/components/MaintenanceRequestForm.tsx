'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTool, FiUser, FiAlertCircle, FiSend, FiCheckCircle, 
  FiPlus, FiMinus, FiSearch, FiX, FiFileText, FiList, 
  FiUpload, FiTrash2, FiDownload, FiEye
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import axios from 'axios';
import { MaintenanceRequest } from '../api/handlers';
import RequestsTable from './RequestsTable';

const API_BASE_URL = 'http://localhost:8080/api/maintenance-requests';

interface MaintenanceRequestFormProps {
  requestId?: number;
  actorType: 'driver' | 'distributor' | 'maintenance';
  onSuccess?: () => void;
  onCancel?: () => void;
  onRowClick?: (request: { id: number }) => void;
}

interface Signature {
  role: string;
  name: string;
  signature: string;
  date: string;
}

const defectCategories = [
  "Engine", "Transmission", "Brakes", "Suspension", 
  "Electrical", "Body", "Interior", "Tires", "Other"
];

export default function MaintenanceRequestForm({ requestId, actorType, onSuccess }: MaintenanceRequestFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [formData, setFormData] = useState({
    plateNumber: '',
    vehicleType: '',
    reportingDriver: '',
    categoryWorkProcess: '',
    kilometerReading: '',
    defectDetails: '',
    mechanicDiagnosis: '',
    requestingPersonnel: '',
    authorizingPersonnel: '',
    status: 'PENDING' as 'PENDING' | 'CHECKED' | 'REJECTED' | 'INSPECTION' | 'COMPLETED' | 'APPROVED',
    attachments: [''],
    physicalContent: [''],
    notes: [''],
    carImages: [] as (File | string)[],
    signatures: [
      { role: 'Driver', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
      { role: 'Mechanic', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
      { role: 'Supervisor', name: '', signature: '', date: new Date().toISOString().split('T')[0] }
    ]
  });

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [filePreviews, setFilePreviews] = useState<Array<{ url: string; type: 'image' | 'pdf' | 'other' }>>([]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        let data;
        if (actorType === 'driver') {
          data = await axios.get(`${API_BASE_URL}/driver`).then(res => res.data);
        } else if (actorType === 'distributor') {
          data = await axios.get(`${API_BASE_URL}/distributor`).then(res => res.data);
        } else if (actorType === 'maintenance') {
          data = await axios.get(`${API_BASE_URL}/maintenance`).then(res => res.data);
        }
        
        setRequests(data);
        setFilteredRequests(data);
        
        if (requestId) {
          const request = data.find((r: MaintenanceRequest) => r.id === requestId) || 
                         await axios.get(`${API_BASE_URL}/${requestId}`).then(res => res.data);
          if (request) {
            setSelectedRequest(request);
            populateFormData(request);
          }
        }
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Failed to load requests');
      }
    };
    
    if (actorType !== 'driver' || activeTab === 'view') {
      loadRequests();
    }
  }, [requestId, actorType, activeTab]);

  const populateFormData = (request: MaintenanceRequest) => {
    setFormData({
      plateNumber: request.plateNumber,
      vehicleType: request.vehicleType,
      reportingDriver: request.reportingDriver,
      categoryWorkProcess: request.categoryWorkProcess,
      kilometerReading: request.kilometerReading.toString(),
      defectDetails: request.defectDetails,
      mechanicDiagnosis: request.mechanicDiagnosis || '',
      requestingPersonnel: request.requestingPersonnel || '',
      authorizingPersonnel: request.authorizingPersonnel || '',
      status: request.status,
      attachments: request.attachments || [''],
      physicalContent: request.physicalContent || [''],
      notes: request.notes || [''],
      carImages: request.carImages || [],
      signatures: request.signatures?.map(sig => ({
        role: sig.role,
        name: sig.name,
        signature: sig.signature,
        date: sig.date
      })) || [
        { role: 'Driver', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
        { role: 'Mechanic', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
        { role: 'Supervisor', name: '', signature: '', date: new Date().toISOString().split('T')[0] }
      ]
    });

    // Set file previews if there are existing images
    if (request.carImages && request.carImages.length > 0) {
      const previews = request.carImages.map((image: string) => ({
        url: image,
        type: image.endsWith('.pdf') ? 'pdf' : 'image'
      }));
      setFilePreviews(previews);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleDynamicFieldChange = (
    fieldType: 'attachments' | 'physicalContent' | 'notes', 
    index: number, 
    value: string
  ) => {
    setFormData(prev => {
      const updatedFields = [...prev[fieldType]];
      updatedFields[index] = value;
      return { ...prev, [fieldType]: updatedFields };
    });
  };

  const addDynamicField = (fieldType: 'attachments' | 'physicalContent' | 'notes') => {
    setFormData(prev => ({
      ...prev,
      [fieldType]: [...prev[fieldType], '']
    }));
  };

  const removeDynamicField = (fieldType: 'attachments' | 'physicalContent' | 'notes', index: number) => {
    if (formData[fieldType].length > 1) {
      setFormData(prev => {
        const updatedFields = [...prev[fieldType]];
        updatedFields.splice(index, 1);
        return { ...prev, [fieldType]: updatedFields };
      });
    }
  };

  const handleSignatureChange = (index: number, field: keyof Signature, value: string) => {
    setFormData(prev => {
      const updatedSignatures = [...prev.signatures];
      updatedSignatures[index] = {
        ...updatedSignatures[index],
        [field]: value
      };
      return { ...prev, signatures: updatedSignatures };
    });

    const errorKey = `signature${field}${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleCarFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => 
        (file.type.startsWith('image/') || file.type === 'application/pdf') && 
        file.size <= 5 * 1024 * 1024
      );

      if (validFiles.length !== newFiles.length) {
        Swal.fire({
          title: 'Invalid Files',
          text: 'Some files were invalid (must be images or PDFs <5MB)',
          icon: 'warning'
        });
      }

      if (validFiles.length > 0) {
        const newPreviews = validFiles.map(file => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 
                file.type === 'application/pdf' ? 'pdf' : 'other'
        }));

        setFilePreviews(prev => [...prev, ...newPreviews]);
        setFormData(prev => ({
          ...prev,
          carImages: [...prev.carImages, ...validFiles]
        }));
      }
    }
  };

  const removeCarFile = (index: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this file?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        setFilePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews.splice(index, 1);
          return newPreviews;
        });
        setFormData(prev => {
          const newImages = [...prev.carImages];
          newImages.splice(index, 1);
          return { ...prev, carImages: newImages };
        });
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
    if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.reportingDriver.trim()) newErrors.reportingDriver = 'Reporting driver is required';
    if (!formData.categoryWorkProcess) newErrors.categoryWorkProcess = 'Category is required';
    if (!formData.kilometerReading) newErrors.kilometerReading = 'Kilometer reading is required';
    if (!formData.defectDetails.trim()) newErrors.defectDetails = 'Defect details are required';
    
    if (formData.plateNumber.length > 20) newErrors.plateNumber = 'Plate number too long';
    if (formData.vehicleType.length > 50) newErrors.vehicleType = 'Vehicle type too long';
    if (formData.reportingDriver.length > 50) newErrors.reportingDriver = 'Driver name too long';
    if (formData.defectDetails.length > 500) newErrors.defectDetails = 'Defect details too long';
    if (formData.mechanicDiagnosis.length > 500) newErrors.mechanicDiagnosis = 'Diagnosis too long';



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const requestData = {
        plateNumber: formData.plateNumber,
        vehicleType: formData.vehicleType,
        reportingDriver: formData.reportingDriver,
        categoryWorkProcess: formData.categoryWorkProcess,
        kilometerReading: parseFloat(formData.kilometerReading),
        defectDetails: formData.defectDetails,
        mechanicDiagnosis: formData.mechanicDiagnosis,
        requestingPersonnel: formData.requestingPersonnel,
        authorizingPersonnel: formData.authorizingPersonnel,
        status: 'PENDING',
        attachments: formData.attachments.filter(Boolean),
        physicalContent: formData.physicalContent.filter(Boolean),
        notes: formData.notes.filter(Boolean),
        signatures: formData.signatures
      };

      let result;
      if (requestId) {
        result = await axios.put(`${API_BASE_URL}/${requestId}`, requestData).then(res => res.data);
        setRequests(prev => prev.map(req => req.id === requestId ? result : req));
      } else {
        result = await axios.post(API_BASE_URL, requestData).then(res => res.data);
        setRequests(prev => [...prev, result]);
      }

      showSuccessAlert(
        'Success!', 
        `Maintenance request ${requestId ? 'updated' : 'submitted'} successfully!`
      );

      if (actorType === 'driver') {
        setActiveTab('view');
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || `Failed to ${requestId ? 'update' : 'submit'} request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'CHECKED' | 'REJECTED' | 'APPROVED' | 'COMPLETED') => {
    try {
      setIsApproving(true);
      await axios.patch(`${API_BASE_URL}/${id}/status?status=${status}`).then(res => res.data);
      
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status } : req
      ));
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null);
      }

      showSuccessAlert(
        'Success!', 
        `Request has been ${status.toLowerCase()} successfully`
      );
      
      // Refresh data
      const data = await axios.get(
        actorType === 'distributor' ? `${API_BASE_URL}/distributor` : 
        actorType === 'maintenance' ? `${API_BASE_URL}/maintenance` : 
        `${API_BASE_URL}/driver`
      ).then(res => res.data);
      
      setRequests(data);
      setFilteredRequests(data);
      closeModals();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsApproving(false);
    }
  };

  const handleAcceptanceSubmit = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsSubmitting(true);
      
      // First upload images if there are any
      if (formData.carImages.length > 0) {
        const formDataObj = new FormData();
        formData.carImages.forEach((file) => {
          if (file instanceof File) {
            formDataObj.append('files', file);
          }
        });
        
        await axios.post(`${API_BASE_URL}/${selectedRequest.id}/upload-images`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Then submit the acceptance data
      const acceptanceData = {
        attachments: formData.attachments.filter(Boolean),
        physicalContent: formData.physicalContent.filter(Boolean),
        notes: formData.notes.filter(Boolean),
        requestingPersonnel: formData.requestingPersonnel,
        authorizingPersonnel: formData.authorizingPersonnel,
        signatures: formData.signatures.map(sig => ({
          role: sig.role,
          name: sig.name,
          signature: sig.signature,
          date: sig.date
        }))
      };

      await axios.post(`${API_BASE_URL}/${selectedRequest.id}/acceptance`, acceptanceData);
      
      showSuccessAlert(
        'Success!', 
        'Acceptance form submitted successfully'
      );
      
      // Refresh data
      const data = await axios.get(`${API_BASE_URL}/driver`).then(res => res.data);
      setRequests(data);
      setFilteredRequests(data);
      closeModals();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to submit acceptance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessAlert = (title: string, message: string) => {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg'
      }
    });
  };

  const handleRowClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    if (actorType === 'driver' && request.status === 'APPROVED') {
      setShowAcceptanceModal(true);
    } else {
      setShowRequestModal(true);
    }
  };

  const closeModals = () => {
    setShowRequestModal(false);
    setShowAcceptanceModal(false);
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRequests(requests);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = requests.filter(request => {
        const fieldsToSearch = [
          request.plateNumber,
          request.vehicleType,
          request.reportingDriver,
          request.categoryWorkProcess,
          request.status
        ];
        
        return fieldsToSearch.some(field => field && field.toLowerCase().includes(query));
      });
      setFilteredRequests(filtered);
    }
  }, [searchQuery, requests]);

  const renderRequestForm = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {requestId ? 'Edit Maintenance Request' : 'New Maintenance Request'}
      </h2>
      
      {apiError && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{apiError}</span>
          </div>
        </div>
      )}
  
      {successMessage && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          <div className="flex items-center">
            <FiCheckCircle className="mr-2" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
  
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
            <input
              type="text"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.plateNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter plate number"
              maxLength={20}
            />
            {errors.plateNumber && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.plateNumber}
              </p>
            )}
          </div>
  
          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
            <input
              type="text"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter vehicle type"
              maxLength={50}
            />
            {errors.vehicleType && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.vehicleType}
              </p>
            )}
          </div>
  
          {/* Reporting Driver */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Driver *</label>
            <input
              type="text"
              name="reportingDriver"
              value={formData.reportingDriver}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.reportingDriver ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter driver name"
              maxLength={50}
            />
            {errors.reportingDriver && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.reportingDriver}
              </p>
            )}
          </div>
  
          {/* Category/Work Process */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category/Work Process *</label>
            <select
              name="categoryWorkProcess"
              value={formData.categoryWorkProcess}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.categoryWorkProcess ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
            >
              <option value="">Select category</option>
              {defectCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.categoryWorkProcess && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.categoryWorkProcess}
              </p>
            )}
          </div>
  
          {/* Kilometer Reading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kilometer Reading *</label>
            <input
              type="number"
              name="kilometerReading"
              value={formData.kilometerReading}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.kilometerReading ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter current km"
              min="0"
              step="0.1"
            />
            {errors.kilometerReading && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.kilometerReading}
              </p>
            )}
          </div>
  
          {/* Defect Details */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Defect Details *</label>
            <textarea
              name="defectDetails"
              value={formData.defectDetails}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.defectDetails ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Describe the defect"
              maxLength={500}
              rows={4}
            />
            {errors.defectDetails && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.defectDetails}
              </p>
            )}
          </div>
  
          {/* Mechanic Diagnosis */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mechanic Diagnosis</label>
            <textarea
              name="mechanicDiagnosis"
              value={formData.mechanicDiagnosis}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.mechanicDiagnosis ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter mechanic's diagnosis"
              maxLength={500}
              rows={4}
            />
            {errors.mechanicDiagnosis && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.mechanicDiagnosis}
              </p>
            )}
          </div>
  
          {/* Requesting Personnel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requesting Personnel</label>
            <input
              type="text"
              name="requestingPersonnel"
              value={formData.requestingPersonnel}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.requestingPersonnel ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter name"
              maxLength={50}
            />
            {errors.requestingPersonnel && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.requestingPersonnel}
              </p>
            )}
          </div>
  
          {/* Authorizing Personnel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Authorizing Personnel</label>
            <input
              type="text"
              name="authorizingPersonnel"
              value={formData.authorizingPersonnel}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.authorizingPersonnel ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter name"
              maxLength={50}
            />
            {errors.authorizingPersonnel && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.authorizingPersonnel}
              </p>
            )}
          </div>
        </div>
  
        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-medium transition-all ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#3c8dbc] hover:bg-[#367fa9]'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin" />
                {requestId ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                {requestId ? 'Update' : 'Submit'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderRequestModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <FiFileText className="mr-2" />
              Maintenance Request Details
            </h3>
            <button
              onClick={closeModals}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Plate Number</label>
                <div className="p-2 bg-gray-50 rounded-lg">{selectedRequest?.plateNumber}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle Type</label>
                <div className="p-2 bg-gray-50 rounded-lg">{selectedRequest?.vehicleType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Reporting Driver</label>
                <div className="p-2 bg-gray-50 rounded-lg">{selectedRequest?.reportingDriver}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <div className={`p-2 rounded-lg ${
                  selectedRequest?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedRequest?.status === 'CHECKED' ? 'bg-blue-100 text-blue-800' :
                  selectedRequest?.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  selectedRequest?.status === 'INSPECTION' ? 'bg-purple-100 text-purple-800' :
                  selectedRequest?.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedRequest?.status}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                <div className="p-2 bg-gray-50 rounded-lg">{selectedRequest?.categoryWorkProcess}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Kilometer Reading</label>
                <div className="p-2 bg-gray-50 rounded-lg">{selectedRequest?.kilometerReading}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Defect Details</label>
              <div className="p-2 bg-gray-50 rounded-lg whitespace-pre-line">{selectedRequest?.defectDetails}</div>
            </div>

            {selectedRequest?.mechanicDiagnosis && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Mechanic Diagnosis</label>
                <div className="p-2 bg-gray-50 rounded-lg whitespace-pre-line">{selectedRequest?.mechanicDiagnosis}</div>
              </div>
            )}

            {selectedRequest?.attachments && selectedRequest.attachments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Attachments</label>
                <div className="p-2 bg-gray-50 rounded-lg">
                  {selectedRequest.attachments.map((attachment, index) => (
                    <div key={index} className="mb-1">{attachment}</div>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest?.physicalContent && selectedRequest.physicalContent.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Physical Content</label>
                <div className="p-2 bg-gray-50 rounded-lg">
                  {selectedRequest.physicalContent.map((content, index) => (
                    <div key={index} className="mb-1">{content}</div>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest?.notes && selectedRequest.notes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                <div className="p-2 bg-gray-50 rounded-lg">
                  {selectedRequest.notes.map((note, index) => (
                    <div key={index} className="mb-1">{note}</div>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest?.carImages && selectedRequest.carImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Car Images</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {selectedRequest.carImages.map((image, index) => (
                    <div key={index} className="border rounded overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Car image ${index + 1}`} 
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest?.signatures && selectedRequest.signatures.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Signatures</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {selectedRequest.signatures.map((signature, index) => (
                    <div key={index} className="border p-3 rounded-lg">
                      <h4 className="font-medium text-gray-700">{signature.role}</h4>
                      <p className="text-sm">Name: {signature.name}</p>
                      <p className="text-sm">Signature: {signature.signature}</p>
                      <p className="text-sm">Date: {signature.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons for Distributor and Maintenance */}
          {actorType === 'distributor' && selectedRequest?.status === 'PENDING' && (
            <div className="mt-8 flex space-x-4">
              <button
                type="button"
                onClick={() => handleStatusChange(selectedRequest.id, 'CHECKED')}
                disabled={isApproving}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                  isApproving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <FiCheckCircle className="mr-2" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(selectedRequest.id, 'REJECTED')}
                disabled={isApproving}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                  isApproving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <FiAlertCircle className="mr-2" />
                Reject
              </button>
            </div>
          )}

          {actorType === 'maintenance' && selectedRequest?.status === 'CHECKED' && (
            <div className="mt-8 flex space-x-4">
              <button
                type="button"
                onClick={() => handleStatusChange(selectedRequest.id, 'APPROVED')}
                disabled={isApproving}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                  isApproving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <FiCheckCircle className="mr-2" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(selectedRequest.id, 'REJECTED')}
                disabled={isApproving}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                  isApproving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <FiAlertCircle className="mr-2" />
                Reject
              </button>
            </div>
          )}

          {actorType === 'maintenance' && selectedRequest?.status === 'INSPECTION' && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => handleStatusChange(selectedRequest.id, 'COMPLETED')}
                disabled={isApproving}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                  isApproving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <FiCheckCircle className="mr-2" />
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  const renderAcceptanceModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <FiTool className="mr-2" />
              Vehicle Acceptance Form
            </h3>
            <button
              onClick={closeModals}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="text-gray-500" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold mb-3">Request Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Plate Number</label>
                <div className="p-2 bg-white rounded-lg">{selectedRequest?.plateNumber}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle Type</label>
                <div className="p-2 bg-white rounded-lg">{selectedRequest?.vehicleType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Defect Category</label>
                <div className="p-2 bg-white rounded-lg">{selectedRequest?.categoryWorkProcess}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Kilometer Reading</label>
                <div className="p-2 bg-white rounded-lg">{selectedRequest?.kilometerReading}</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Defect Details</h4>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
              {selectedRequest?.defectDetails}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Upload Images</h4>
            <div className="flex flex-col items-start">
              <label className="mb-2 flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <FiUpload className="w-5 h-5 mr-2" />
                Upload Files
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCarFilesUpload}
                  className="hidden"
                  multiple
                />
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 w-full">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    {preview.type === 'image' ? (
                      <>
                        <img 
                          src={preview.url} 
                          alt={`File preview ${index + 1}`} 
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeCarFile(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : preview.type === 'pdf' ? (
                      <div className="h-48 flex flex-col items-center justify-center p-4">
                        <div className="bg-red-100 p-4 rounded-full mb-2">
                          <FiDownload className="w-8 h-8 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 text-center truncate w-full px-2">
                          {preview.url.split('/').pop()}
                        </span>
                        <div className="mt-2 flex space-x-2">
                          <a 
                            href={preview.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          >
                            <FiEye className="w-4 h-4" />
                          </a>
                          <a 
                            href={preview.url} 
                            download
                            className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                          >
                            <FiDownload className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => removeCarFile(index)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center p-4">
                        <div className="bg-gray-100 p-4 rounded-full mb-2">
                          <FiDownload className="w-8 h-8 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 text-center truncate w-full px-2">
                          {preview.url.split('/').pop()}
                        </span>
                        <div className="mt-2 flex space-x-2">
                          <a 
                            href={preview.url} 
                            download
                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          >
                            <FiDownload className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => removeCarFile(index)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Other Attachments */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Other Attachments</h4>
              <div className="space-y-3">
                <AnimatePresence>
                  {formData.attachments.map((attachment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={attachment}
                        onChange={(e) => handleDynamicFieldChange('attachments', index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter attachment description..."
                      />
                      {formData.attachments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDynamicField('attachments', index)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                      )}
                      {index === formData.attachments.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addDynamicField('attachments')}
                          className="p-2 text-green-500 hover:text-green-700 transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Physical Content */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Physical Content</h4>
              <div className="space-y-3">
                <AnimatePresence>
                  {formData.physicalContent.map((content, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={content}
                        onChange={(e) => handleDynamicFieldChange('physicalContent', index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter physical content..."
                      />
                      {formData.physicalContent.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDynamicField('physicalContent', index)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                      )}
                      {index === formData.physicalContent.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addDynamicField('physicalContent')}
                          className="p-2 text-green-500 hover:text-green-700 transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Notes</h4>
              <div className="space-y-3">
                <AnimatePresence>
                  {formData.notes.map((note, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => handleDynamicFieldChange('notes', index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter note..."
                      />
                      {formData.notes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDynamicField('notes', index)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                      )}
                      {index === formData.notes.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addDynamicField('notes')}
                          className="p-2 text-green-500 hover:text-green-700 transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Requesting Personnel</h4>
            <input
              type="text"
              name="requestingPersonnel"
              value={formData.requestingPersonnel}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Authorizing Personnel</h4>
            <input
              type="text"
              name="authorizingPersonnel"
              value={formData.authorizingPersonnel}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter authorizing personnel name"
            />
          </div>

          {/* Signatures Section */}
          <div className="mt-8 mb-10">
            <h4 className="text-xl font-semibold mb-6 text-gray-800">
              Vehicle Acceptance Signatures
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formData.signatures.map((signature, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h5 className="text-lg font-semibold mb-4 text-gray-800">{signature.role}</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={signature.name}
                        onChange={(e) => handleSignatureChange(index, 'name', e.target.value)}
                        className={`w-full p-2 border ${errors[`signatureName${index}`] ? 'border-red-500' : 'border-gray-300'} rounded`}
                        placeholder="Enter name"
                      />
                      {errors[`signatureName${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`signatureName${index}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signature *</label>
                      <input
                        type="text"
                        value={signature.signature}
                        onChange={(e) => handleSignatureChange(index, 'signature', e.target.value)}
                        className={`w-full p-2 border ${errors[`signatureValue${index}`] ? 'border-red-500' : 'border-gray-300'} rounded`}
                        placeholder="Enter signature"
                      />
                      {errors[`signatureValue${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`signatureValue${index}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        value={signature.date}
                        onChange={(e) => handleSignatureChange(index, 'date', e.target.value)}
                        className={`w-full p-2 border ${errors[`signatureDate${index}`] ? 'border-red-500' : 'border-gray-300'} rounded`}
                      />
                      {errors[`signatureDate${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`signatureDate${index}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={closeModals}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAcceptanceSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#3c8dbc] hover:bg-[#367fa9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c8dbc] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin" />
                  Submitting...
                </span>
              ) : 'Submit Acceptance'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderDriverView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 font-medium ${activeTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiPlus className="inline mr-2" />
          Add Request
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-4 py-2 font-medium ${activeTab === 'view' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiList className="inline mr-2" />
          View Requests
        </button>
      </div>

      {activeTab === 'add' ? (
        renderRequestForm()
      ) : (
        <>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">My Maintenance Requests</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 max-w-md mx-auto">
                <FiFileText className="mx-auto text-3xl mb-4 text-blue-500" />
                <h4 className="font-medium text-lg mb-2">No Requests Found</h4>
                <p className="mb-4">
                  {searchQuery.trim() === '' 
                    ? "You haven't submitted any maintenance requests yet."
                    : `No requests found matching "${searchQuery}"`}
                </p>
              </div>
            </div>
          ) : (
            <RequestsTable
              requests={filteredRequests}
              actorType={actorType}
              onRowClick={handleRowClick}
            />
          )}
        </>
      )}
    </div>
  );

  const renderDistributorView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Maintenance Requests</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 max-w-md mx-auto">
            <FiFileText className="mx-auto text-3xl mb-4 text-blue-500" />
            <h4 className="font-medium text-lg mb-2">No Requests Found</h4>
            <p className="mb-4">
              {searchQuery.trim() === '' 
                ? "There are no maintenance requests to review."
                : `No requests found matching "${searchQuery}"`}
            </p>
          </div>
        </div>
      ) : (
        <RequestsTable
          requests={filteredRequests}
          actorType={actorType}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );

  const renderMaintenanceView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Maintenance Assignments</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 max-w-md mx-auto">
            <FiTool className="mx-auto text-3xl mb-4 text-blue-500" />
            <h4 className="font-medium text-lg mb-2">No Assignments Found</h4>
            <p className="mb-4">
              {searchQuery.trim() === '' 
                ? "There are no maintenance assignments currently."
                : `No assignments found matching "${searchQuery}"`}
            </p>
          </div>
        </div>
      ) : (
        <RequestsTable
          requests={filteredRequests}
          actorType={actorType}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );

  return (
    <>
      {actorType === 'driver' ? renderDriverView() : 
       actorType === 'distributor' ? renderDistributorView() : 
       renderMaintenanceView()}
      
      <AnimatePresence>
        {showRequestModal && selectedRequest && renderRequestModal()}
        {showAcceptanceModal && selectedRequest && renderAcceptanceModal()}
      </AnimatePresence>
    </>
  );
}