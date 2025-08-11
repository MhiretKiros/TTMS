'use client';
import { useNotification } from '@/app/contexts/NotificationContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTool, FiUser, FiAlertCircle, FiSend, FiCheckCircle, 
  FiPlus, FiMinus, FiSearch, FiX, FiFileText, FiList, 
  FiUpload, FiTrash2, FiDownload, FiEye, FiFile,
  FiPlusCircle, FiClipboard, FiArrowRight, FiDollarSign
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import axios from 'axios';
import { MaintenanceRequest } from '../api/handlers';
import RequestsTable from './RequestsTable';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/maintenance-requests`;
const CARS_API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/all`;
const CAR_STATUS_API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/status`;
 
interface MaintenanceRequestFormProps {
  requestId?: number;
  actorType: 'driver' | 'distributor' | 'maintenance' | 'inspector';
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

interface Car {
  id: number;
  plateNumber: string;
  model: string;
  bodyType: string;
  km: string;
  vehicleType: string;
  currentKilometer: number;
  status: string;
}

interface FilePreview {
  url: string;
  type: 'image' | 'pdf' | 'other';
}

interface FormData {
  plateNumber: string;
  vehicleType: string;
  reportingDriver: string;
  categoryWorkProcess: string;
  kilometerReading: string;
  defectDetails: string;
  mechanicDiagnosis: string;
  requestingPersonnel: string;
  authorizingPersonnel: string;
  fuelAmount: string;
  status: 'PENDING' | 'CHECKED' | 'REJECTED' | 'INSPECTION' | 'COMPLETED' | 'APPROVED' | 'FINISHED';
  attachments: string[];
  physicalContent: string[];
  notes: string[];
  carImages: (File | string)[];
  signatures: Signature[];
  returnFiles: (File | string)[];
  returnKilometerReading: string;
  returnNotes: string;
  returnFuelAmount: string;
  returnSignatures: Signature[];
}

const defectCategories = [
  "Engine", "Transmission", "Brakes", "Suspension", 
  "Electrical", "Body", "Interior", "Tires", "Other"
];

export default function MaintenanceRequestForm({ requestId, actorType, onSuccess }: MaintenanceRequestFormProps) {
  const router = useRouter();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    plateNumber: '',
    vehicleType: '',
    reportingDriver: '',
    categoryWorkProcess: '',
    kilometerReading: '',
    defectDetails: '',
    mechanicDiagnosis: '',
    requestingPersonnel: '',
    authorizingPersonnel: '',
    fuelAmount: '',
    status: 'PENDING',
    attachments: [''],
    physicalContent: [''],
    notes: [''],
    carImages: [],
    signatures: [
      { role: 'Driver', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
      { role: 'Mechanic', name: '', signature: '', date: new Date().toISOString().split('T')[0] }
    ],
    returnFiles: [],
    returnKilometerReading: '',
    returnNotes: '',
    returnFuelAmount: '',
    returnSignatures: [
      { role: 'Inspector', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
      { role: 'Driver', name: '', signature: '', date: new Date().toISOString().split('T')[0] }
    ]
  });

  const { addNotification } = useNotification();
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
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [returnFilePreviews, setReturnFilePreviews] = useState<FilePreview[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [carSearch, setCarSearch] = useState('');
  const [showCarDropdown, setShowCarDropdown] = useState(false);
  
  // Get driver name from localStorage
  const [driverName, setDriverName] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.name || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  useEffect(() => {
    const loadRequests = async () => {
      try {
        let data: MaintenanceRequest[] = [];
        if (actorType === 'driver') {
          const response = await axios.get<MaintenanceRequest[]>(`${API_BASE_URL}/driver`);
          data = response.data;
          // Filter requests for the current driver only
          data = data.filter((request) => 
            request.reportingDriver?.toLowerCase() === driverName.toLowerCase()
          );
          setRequests(data);
          setFilteredRequests(data);
        } else if (actorType === 'distributor') {
          const response = await axios.get<MaintenanceRequest[]>(`${API_BASE_URL}/distributor`);
          data = response.data;
          setRequests(data);
          setFilteredRequests(data);
        } else if (actorType === 'maintenance') {
          const response = await axios.get<MaintenanceRequest[]>(`${API_BASE_URL}/maintenance`);
          data = response.data;
          setRequests(data);
          setFilteredRequests(data);
        } else if (actorType === 'inspector') {
          const response = await axios.get<MaintenanceRequest[]>(`${API_BASE_URL}/inspector`);
          data = response.data;
          setRequests(data);
          setFilteredRequests(data);
        }
        
        if (requestId) {
          const request = data.find((r) => r.id === requestId) || 
                         (await axios.get<MaintenanceRequest>(`${API_BASE_URL}/${requestId}`)).data;
          if (request) {
            setSelectedRequest(request);
            populateFormData(request);
          }
        }
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Failed to load requests');
      }
    };
    
    loadRequests();
  }, [requestId, actorType, driverName]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get<{rentCarList: Car[]}>(CARS_API_URL);
        setCars(response.data.rentCarList);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      }
    };
    
    if (showRequestForm) {
      fetchCars();
    }
  }, [showRequestForm]);

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
      fuelAmount: request.fuelAmount?.toString() || '',
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
        { role: 'Mechanic', name: '', signature: '', date: new Date().toISOString().split('T')[0] }
      ],
      returnFiles: request.returnFiles || [],
      returnKilometerReading: request.returnKilometerReading?.toString() || '',
      returnNotes: request.returnNotes || '',
      returnFuelAmount: request.returnFuelAmount?.toString() || '',
      returnSignatures: request.returnSignatures?.map(sig => ({
        role: sig.role,
        name: sig.name,
        signature: sig.signature,
        date: sig.date
      })) || [
        { role: 'Inspector', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
        { role: 'Driver', name: '', signature: '', date: new Date().toISOString().split('T')[0] }
      ]
    });

    if (request.carImages && request.carImages.length > 0) {
      const previews: FilePreview[] = request.carImages.map((file: string) => ({
        url: `${API_BASE_URL}/files/${file}`,
        type: file.endsWith('.pdf') ? 'pdf' : 
              ['jpg', 'jpeg', 'png', 'gif'].some(ext => file.toLowerCase().endsWith(ext)) ? 'image' : 'other'
      }));
      setFilePreviews(previews);
    }

    if (request.returnFiles && request.returnFiles.length > 0) {
      const previews: FilePreview[] = request.returnFiles.map((file: string) => ({
        url: `${API_BASE_URL}/files/${file}`,
        type: file.endsWith('.pdf') ? 'pdf' : 
              ['jpg', 'jpeg', 'png', 'gif'].some(ext => file.toLowerCase().endsWith(ext)) ? 'image' : 'other'
      }));
      setReturnFilePreviews(previews);
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

  const handleSignatureChange = (index: number, field: keyof Signature, value: string, isReturn = false) => {
    setFormData(prev => {
      const signatureField = isReturn ? 'returnSignatures' : 'signatures';
      const updatedSignatures = [...prev[signatureField]];
      updatedSignatures[index] = {
        ...updatedSignatures[index],
        [field]: value
      };
      return { ...prev, [signatureField]: updatedSignatures };
    });

    const errorKey = `signature${field}${index}${isReturn ? 'Return' : ''}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>, isReturnFiles = false) => {
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
        const newPreviews: FilePreview[] = validFiles.map(file => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 
                file.type === 'application/pdf' ? 'pdf' : 'other'
        }));

        if (isReturnFiles) {
          setReturnFilePreviews(prev => [...prev, ...newPreviews]);
          setFormData(prev => ({
            ...prev,
            returnFiles: [...prev.returnFiles, ...validFiles]
          }));
        } else {
          setFilePreviews(prev => [...prev, ...newPreviews]);
          setFormData(prev => ({
            ...prev,
            carImages: [...prev.carImages, ...validFiles]
          }));
        }
      }
    }
  };


  const removeFile = (index: number, isReturnFile = false) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this file?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        if (isReturnFile) {
          setReturnFilePreviews(prev => {
            const newPreviews = [...prev];
            newPreviews.splice(index, 1);
            return newPreviews;
          });
          setFormData(prev => {
            const newFiles = [...prev.returnFiles];
            newFiles.splice(index, 1);
            return { ...prev, returnFiles: newFiles };
          });
        } else {
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

  const validateAcceptanceForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fuelAmount) newErrors.fuelAmount = 'Fuel amount is required';
    
    formData.signatures.forEach((sig, index) => {
      if (!sig.name.trim()) newErrors[`signatureName${index}`] = 'Name is required';
      if (!sig.signature.trim()) newErrors[`signatureValue${index}`] = 'Signature is required';
      if (!sig.date.trim()) newErrors[`signatureDate${index}`] = 'Date is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateReturnForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.returnKilometerReading) newErrors.returnKilometerReading = 'Return kilometer reading is required';
    if (!formData.returnFuelAmount) newErrors.returnFuelAmount = 'Return fuel amount is required';
    
    formData.returnSignatures.forEach((sig, index) => {
      if (!sig.name.trim()) newErrors[`signatureName${index}Return`] = 'Name is required';
      if (!sig.signature.trim()) newErrors[`signatureValue${index}Return`] = 'Signature is required';
      if (!sig.date.trim()) newErrors[`signatureDate${index}Return`] = 'Date is required';
    });

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

      let result: MaintenanceRequest;
      if (requestId) {
        const response = await axios.put<MaintenanceRequest>(`${API_BASE_URL}/${requestId}`, requestData);
        result = response.data;
        setRequests(prev => prev.map(req => req.id === requestId ? result : req));
      } else {
        const response = await axios.post<MaintenanceRequest>(API_BASE_URL, requestData);
        result = response.data;
        setRequests(prev => [...prev, result]);
      }

      showSuccessAlert(
        'Success!', 
        `Maintenance request ${requestId ? 'updated' : 'submitted'} successfully!`
      );

      setShowRequestForm(false);
      setFormData({
        plateNumber: '',
        vehicleType: '',
        reportingDriver: '',
        categoryWorkProcess: '',
        kilometerReading: '',
        defectDetails: '',
        mechanicDiagnosis: '',
        requestingPersonnel: '',
        authorizingPersonnel: '',
        fuelAmount: '',
        status: 'PENDING',
        attachments: [''],
        physicalContent: [''],
        notes: [''],
        carImages: [],
        signatures: [
          { role: 'Driver', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
          { role: 'Mechanic', name: '', signature: '', date: new Date().toISOString().split('T')[0] }
        ],
        returnFiles: [],
        returnKilometerReading: '',
        returnNotes: '',
        returnFuelAmount: '',
        returnSignatures: [
          { role: 'Inspector', name: '', signature: '', date: new Date().toISOString().split('T')[0] },
          { role: 'Driver', name: '', signature: '', date: new Date().toISOString().split('T')[0] }
        ]
      });
      setFilePreviews([]);
      setReturnFilePreviews([]);

      await addNotification(
        'New Automobile Vehicle Registered', 
        '/tms/admin/car-management/vehicle-inspection', 
        'INSPECTOR'
      );
    } catch (error: any) {
      setApiError(error.response?.data?.message || `Failed to ${requestId ? 'update' : 'submit'} request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'CHECKED' | 'REJECTED' | 'APPROVED' | 'COMPLETED' | 'FINISHED') => {
    try {
      setIsApproving(true);
      
      if (status === 'COMPLETED') {
        setShowReturnModal(true);
        return;
      }
      
      const response = await axios.patch<MaintenanceRequest>(`${API_BASE_URL}/${id}/status?status=${status}`);
      const updatedRequest = response.data;
      
      setRequests(prev => prev.map(req => 
        req.id === id ? updatedRequest : req
      ));
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(updatedRequest);
      }

      showSuccessAlert(
        'Success!', 
        `Request has been ${status.toLowerCase()} successfully`
      );
      
      if(status === 'APPROVED') {
        await addNotification(
          `New Maintenance Request Approved By Head Of Mechanic`,
          `/tms/admin/car-management/maintenance`,
          'INSPECTOR'
        );
      }

      if(status === 'CHECKED') {
        try {
          await addNotification(
            `New Maintenance Request Approved By Distributor`,
            `/tms/admin/car-management/maintenance`,
            'HEAD_OF_MECHANIC'
          );
        } catch (notificationError) {
          console.error('Failed to add notification:', notificationError);
        }
      }

      const responseData = await axios.get<MaintenanceRequest[]>(
        actorType === 'distributor' ? `${API_BASE_URL}/distributor` : 
        actorType === 'maintenance' ? `${API_BASE_URL}/maintenance` : 
        actorType === 'inspector' ? `${API_BASE_URL}/inspector` :
        `${API_BASE_URL}/driver`
      );
      
      setRequests(responseData.data);
      setFilteredRequests([]);
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
      
      if (formData.carImages.length > 0) {
        const formDataObj = new FormData();
        formData.carImages.forEach((file) => {
          if (file instanceof File) {
            formDataObj.append('files', file);
          }
        });
        
        await axios.post(`${API_BASE_URL}/${selectedRequest.id}/upload-files`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      const acceptanceData = {
        attachments: formData.attachments.filter(Boolean),
        physicalContent: formData.physicalContent.filter(Boolean),
        notes: formData.notes.filter(Boolean),
        requestingPersonnel: formData.requestingPersonnel,
        authorizingPersonnel: formData.authorizingPersonnel,
        fuelAmount: formData.fuelAmount,
        signatures: formData.signatures.map(sig => ({
          role: sig.role,
          name: sig.name,
          signature: sig.signature,
          date: sig.date
        }))
      };

      await axios.post(`${API_BASE_URL}/${selectedRequest.id}/acceptance`, acceptanceData);
      
      await axios.put(`${CAR_STATUS_API_URL}/${selectedRequest.plateNumber}`, {
        status: 'InMaintainance'
      });

      showSuccessAlert(
        'Success!', 
        'Acceptance form submitted successfully and car status updated'
      );

      try {
        await addNotification(
          `Vehicle ${selectedRequest.plateNumber} accepted successfully for maintenance`,
          `/tms/admin/car-management/approved-maintenance-requests`,
          'INSPECTOR'
        );
      } catch (notificationError) {
        console.error('Failed to add notification:', notificationError);
      }
      
      const response = await axios.get<MaintenanceRequest[]>(`${API_BASE_URL}/driver`);
      setRequests(response.data);
      setFilteredRequests([]);
      closeModals();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to submit acceptance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnSubmit = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsSubmitting(true);
      
      if (!validateReturnForm()) {
        setIsSubmitting(false);
        return;
      }

      const formDataObj = new FormData();
      
      const filesToUpload = formData.carImages.filter(file => file instanceof File) as File[];
      if (filesToUpload.length > 0) {
        filesToUpload.forEach(file => {
          formDataObj.append('files', file);
        });
        
        await axios.post(`${API_BASE_URL}/${selectedRequest.id}/upload-files`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      const returnFilesToUpload = formData.returnFiles.filter(file => file instanceof File) as File[];
      if (returnFilesToUpload.length > 0) {
        const returnFormData = new FormData();
        returnFilesToUpload.forEach(file => {
          returnFormData.append('files', file);
        });
        
        await axios.post(`${API_BASE_URL}/${selectedRequest.id}/upload-return-files`, returnFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      const returnData = {
        returnKilometerReading: parseFloat(formData.returnKilometerReading),
        returnNotes: formData.returnNotes,
        returnFuelAmount: parseFloat(formData.returnFuelAmount),
        returnSignatures: formData.returnSignatures.map(sig => ({
          role: sig.role,
          name: sig.name,
          signature: sig.signature,
          date: sig.date
        }))
      };

      await axios.post(`${API_BASE_URL}/${selectedRequest.id}/complete-return`, returnData);
      
      await axios.put(`${CAR_STATUS_API_URL}/${selectedRequest.plateNumber}`, {
        status: 'Available'
      });

      showSuccessAlert(
        'Success!', 
        'Vehicle return process completed successfully'
      );
      
      try {
        await addNotification(
          `Vehicle ${selectedRequest.plateNumber} returned successfully from maintenance`,
          `/tms/admin/car-management/maintenance`,
          'DRIVER'
        );
      } catch (notificationError) {
        console.error('Failed to add notification:', notificationError);
      }

      const response = await axios.get<MaintenanceRequest[]>(
        actorType === 'driver' ? `${API_BASE_URL}/driver` :
        actorType === 'distributor' ? `${API_BASE_URL}/distributor` :
        actorType === 'maintenance' ? `${API_BASE_URL}/maintenance` :
        `${API_BASE_URL}/inspector`
      );
      
      setRequests(response.data);
      if (actorType === 'driver') {
        setFilteredRequests(response.data.filter((req) => 
          req.reportingDriver.toLowerCase() === searchQuery.toLowerCase()
        ));
      } else {
        setFilteredRequests(response.data);
      }
      
      closeModals();
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Failed to complete return process');
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
    if (actorType === 'inspector' && request.status === 'COMPLETED') {
      setShowReturnModal(true);
    } else if ((actorType === 'driver' && request.status === 'APPROVED') || 
               (actorType === 'inspector' && request.status === 'APPROVED')) {
      setShowAcceptanceModal(true);
    } else {
      setShowRequestModal(true);
    }
  };

  const closeModals = () => {
    setShowRequestModal(false);
    setShowAcceptanceModal(false);
    setShowReturnModal(false);
  };

  const handleCarSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarSearch(value);
    setShowCarDropdown(true);
    
    const matchedCar = cars.find(car => car.plateNumber === value);
    if (matchedCar) {
      setFormData(prev => ({
        ...prev,
        plateNumber: matchedCar.plateNumber,
        vehicleType: matchedCar.model || matchedCar.bodyType || '',
        kilometerReading: matchedCar.km ? matchedCar.km.toString() : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        plateNumber: value,
        vehicleType: '',
        kilometerReading: ''
      }));
    }
  };

  const selectCar = (car: Car) => {
    setFormData(prev => ({
      ...prev,
      plateNumber: car.plateNumber,
      vehicleType: car.model || car.bodyType || '',
      kilometerReading: car.km ? car.km.toString() : ''
    }));
    setCarSearch(car.plateNumber);
    setShowCarDropdown(false);
  };

  const handleDriverSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim() === '') {
      setFilteredRequests([]);
    } else {
      const exactMatch = requests.find(request => 
        request.reportingDriver.toLowerCase() === value.toLowerCase()
      );
      
      setFilteredRequests(exactMatch ? [exactMatch] : []);
    }
  };

  // ... [rest of the component code remains the same, just with proper type annotations]

  const renderRequestForm = () => (
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
            <h2 className="text-2xl font-semibold text-gray-800">
              {requestId ? 'Edit Maintenance Request' : 'New Maintenance Request'}
            </h2>
            <button
              onClick={() => setShowRequestForm(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="text-gray-500" />
            </button>
          </div>
          
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
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
                <input
                  type="text"
                  name="plateNumber"
                  value={carSearch}
                  onChange={handleCarSearchChange}
                  onFocus={() => setShowCarDropdown(true)}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.plateNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                  placeholder="Search plate number"
                  maxLength={20}
                />
                {showCarDropdown && carSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {cars
                      .filter(car => 
                        car.plateNumber.toLowerCase().includes(carSearch.toLowerCase()) &&
                        car.status !== 'Maintenance'
                      )
                      .map(car => (
                        <div
                          key={car.plateNumber}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => selectCar(car)}
                        >
                          {car.plateNumber} - {car.model || car.bodyType} (Current km: {car.km || 'N/A'})
                        </div>
                      ))}
                  </div>
                )}
                {errors.plateNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.plateNumber}
                  </p>
                )}
              </div>
      
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                <input
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                  placeholder="Vehicle type will auto-fill"
                  maxLength={50}
                  readOnly
                />
                {errors.vehicleType && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.vehicleType}
                  </p>
                )}
              </div>
      
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
      
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilometer Reading *</label>
                <input
                  type="number"
                  name="kilometerReading"
                  value={formData.kilometerReading}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.kilometerReading ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                  placeholder="Current km will auto-fill"
                  min="0"
                  step="0.1"
                  
                />
                {errors.kilometerReading && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.kilometerReading}
                  </p>
                )}
              </div>
      
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
      
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
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
      </motion.div>
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
                  selectedRequest?.status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
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
                <label className="block text-sm font-medium text-gray-500 mb-1">Files</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 w-full">
                  {selectedRequest.carImages.map((file, index) => {
                    const isImage = ['jpg', 'jpeg', 'png', 'gif'].some(ext => 
                      file.toLowerCase().endsWith(ext));
                    const isPDF = file.toLowerCase().endsWith('.pdf');
                    
                    return (
                      <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                        {isImage ? (
                          <>
                            <img 
                              src={`${API_BASE_URL}/files/${file}`}
                              alt={`File ${index + 1}`}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-image.jpg';
                              }}
                            />
                            <div className="p-1 bg-gray-100 flex justify-between">
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-xs"
                              >
                                View
                              </a>
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                download
                                className="text-green-500 hover:text-green-700 text-xs"
                              >
                                Download
                              </a>
                            </div>
                          </>
                        ) : isPDF ? (
                          <div className="h-48 flex flex-col items-center justify-center p-2">
                            <FiFile className="text-red-500 text-3xl mb-1" />
                            <span className="text-xs text-center truncate w-full px-1">
                              {file}
                            </span>
                            <div className="mt-2 flex space-x-2">
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                              >
                                <FiEye className="w-4 h-4" />
                              </a>
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                download
                                className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                              >
                                <FiDownload className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="h-48 flex flex-col items-center justify-center p-2">
                            <FiFile className="text-gray-500 text-3xl mb-1" />
                            <span className="text-xs text-center truncate w-full px-1">
                              {file}
                            </span>
                            <div className="mt-2 flex space-x-2">
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                download
                                className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                              >
                                <FiDownload className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedRequest?.signatures && selectedRequest.signatures.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Signatures</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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

            {selectedRequest?.returnFiles && selectedRequest.returnFiles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Return Files</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 w-full">
                  {selectedRequest.returnFiles.map((file, index) => {
                    const isImage = ['jpg', 'jpeg', 'png', 'gif'].some(ext => 
                      file.toLowerCase().endsWith(ext));
                    const isPDF = file.toLowerCase().endsWith('.pdf');
                    
                    return (
                      <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                        {isImage ? (
                          <>
                            <img 
                              src={`${API_BASE_URL}/files/${file}`}
                              alt={`Return file ${index + 1}`}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-image.jpg';
                              }}
                            />
                            <div className="p-1 bg-gray-100 flex justify-between">
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-xs"
                              >
                                View
                              </a>
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                download
                                className="text-green-500 hover:text-green-700 text-xs"
                              >
                                Download
                              </a>
                            </div>
                          </>
                        ) : isPDF ? (
                          <div className="h-48 flex flex-col items-center justify-center p-2">
                            <FiFile className="text-red-500 text-3xl mb-1" />
                            <span className="text-xs text-center truncate w-full px-1">
                              {file}
                            </span>
                            <div className="mt-2 flex space-x-2">
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                              >
                                <FiEye className="w-4 h-4" />
                              </a>
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                download
                                className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                              >
                                <FiDownload className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="h-48 flex flex-col items-center justify-center p-2">
                            <FiFile className="text-gray-500 text-3xl mb-1" />
                            <span className="text-xs text-center truncate w-full px-1">
                              {file}
                            </span>
                            <div className="mt-2 flex space-x-2">
                              <a 
                                href={`${API_BASE_URL}/files/${file}`}
                                download
                                className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                              >
                                <FiDownload className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedRequest?.returnKilometerReading && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Return Kilometer Reading</label>
                <div className="p-2 bg-gray-50 rounded-lg">{selectedRequest.returnKilometerReading}</div>
              </div>
            )}

            {selectedRequest?.returnNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Return Notes</label>
                <div className="p-2 bg-gray-50 rounded-lg whitespace-pre-line">{selectedRequest.returnNotes}</div>
              </div>
            )}

            {selectedRequest?.returnFuelAmount && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Return Fuel Amount</label>
                <div className="p-2 bg-gray-50 rounded-lg">{selectedRequest.returnFuelAmount}</div>
              </div>
            )}

            {selectedRequest?.returnSignatures && selectedRequest.returnSignatures.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Return Signatures</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {selectedRequest.returnSignatures.map((signature, index) => (
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

          {actorType === 'distributor' && selectedRequest?.status === 'PENDING' && (
            <div className="mt-8 flex space-x-4">
              <button
                type="button"
                disabled={isApproving}
               onClick={() => {
               if (selectedRequest && selectedRequest.id !== undefined) {
               handleStatusChange(selectedRequest.id, 'CHECKED');
                }
                }}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                  isApproving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <FiCheckCircle className="mr-2" />
                Approve
              </button>
              {/* <button
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
              </button> */}
            </div>
          )}

          {actorType === 'maintenance' && selectedRequest?.status === 'CHECKED' && (
            <div className="mt-8 flex space-x-4">
              <button
                type="button"
                onClick={() => {
                if (selectedRequest && selectedRequest.id !== undefined) {
                 handleStatusChange(selectedRequest.id, 'APPROVED');
                  }
                 }}
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
              {/* <button
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
              </button> */}
            </div>
          )}

          {actorType === 'inspector' && selectedRequest?.status === 'COMPLETED' && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowReturnModal(true)}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all bg-green-600 hover:bg-green-700`}
              >
                <FiArrowRight className="mr-2" />
                Complete Vehicle Return
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Amount *</label>
                <input
                  type="number"
                  name="fuelAmount"
                  value={formData.fuelAmount}
                  onChange={handleChange}
                  className={`w-full p-2 border ${errors.fuelAmount ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter fuel amount"
                  min="0"
                  step="0.1"
                />
                {errors.fuelAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.fuelAmount}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Upload Files</h4>
            <div className="flex flex-col items-start">
              <label className="mb-2 flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <FiUpload className="w-5 h-5 mr-2" />
                Upload Files (Images/PDFs)
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFilesUpload(e, false)}
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
                          onClick={() => removeFile(index, false)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : preview.type === 'pdf' ? (
                      <div className="h-48 flex flex-col items-center justify-center p-4">
                        <div className="bg-red-100 p-4 rounded-full mb-2">
                          <FiFile className="w-8 h-8 text-red-600" />
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
                            onClick={() => removeFile(index, false)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center p-4">
                        <div className="bg-gray-100 p-4 rounded-full mb-2">
                          <FiFile className="w-8 h-8 text-gray-600" />
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
                            onClick={() => removeFile(index, false)}
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

          <div className="mt-8 mb-10">
            <h4 className="text-xl font-semibold mb-6 text-gray-800">
              Vehicle Acceptance Signatures
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.signatures.map((signature, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h5 className="text-lg font-semibold mb-4 text-gray-800">{signature.role}</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={signature.name}
                        onChange={(e) => handleSignatureChange(index, 'name', e.target.value, false)}
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
                        onChange={(e) => handleSignatureChange(index, 'signature', e.target.value, false)}
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
                        onChange={(e) => handleSignatureChange(index, 'date', e.target.value, false)}
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
            {actorType !== 'driver' && (
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
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );


 const renderReturnModal = () => (
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
              Vehicle Completion Form
            </h3>
            <button
              onClick={closeModals}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="text-gray-500" />
            </button>
          </div>

          {/* Display existing acceptance data (read-only) */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold mb-3">Acceptance Information</h4>
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
                <label className="block text-sm font-medium text-gray-500 mb-1">Initial Kilometer Reading</label>
                <div className="p-2 bg-white rounded-lg">{selectedRequest?.kilometerReading}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Initial Fuel Amount</label>
                <div className="p-2 bg-white rounded-lg">{selectedRequest?.fuelAmount}</div>
              </div>
            </div>
          </div>

          {/* Display existing defect details (read-only) */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Defect Details</h4>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
              {selectedRequest?.defectDetails}
            </div>
          </div>

          {/* Display existing files (read-only) */}
          {selectedRequest?.carImages && selectedRequest.carImages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Initial Files</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 w-full">
                {selectedRequest.carImages.map((file, index) => {
                  const isImage = ['jpg', 'jpeg', 'png', 'gif'].some(ext => 
                    file.toLowerCase().endsWith(ext));
                  const isPDF = file.toLowerCase().endsWith('.pdf');
                  
                  return (
                    <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                      {isImage ? (
                        <>
                          <img 
                            src={`${API_BASE_URL}/files/${file}`}
                            alt={`File ${index + 1}`}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className="p-1 bg-gray-100 flex justify-between">
                            <a 
                              href={`${API_BASE_URL}/files/${file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                              View
                            </a>
                            <a 
                              href={`${API_BASE_URL}/files/${file}`}
                              download
                              className="text-green-500 hover:text-green-700 text-xs"
                            >
                              Download
                            </a>
                          </div>
                        </>
                      ) : isPDF ? (
                        <div className="h-48 flex flex-col items-center justify-center p-2">
                          <FiFile className="text-red-500 text-3xl mb-1" />
                          <span className="text-xs text-center truncate w-full px-1">
                            {file}
                          </span>
                          <div className="mt-2 flex space-x-2">
                            <a 
                              href={`${API_BASE_URL}/files/${file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                            >
                              <FiEye className="w-4 h-4" />
                            </a>
                            <a 
                              href={`${API_BASE_URL}/files/${file}`}
                              download
                              className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                            >
                              <FiDownload className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center p-2">
                          <FiFile className="text-gray-500 text-3xl mb-1" />
                          <span className="text-xs text-center truncate w-full px-1">
                            {file}
                          </span>
                          <div className="mt-2 flex space-x-2">
                            <a 
                              href={`${API_BASE_URL}/files/${file}`}
                              download
                              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                            >
                              <FiDownload className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Display existing signatures (read-only) */}
          {selectedRequest?.signatures && selectedRequest.signatures.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Acceptance Signatures</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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

        

          {/* Return-specific fields */}
          <div className="mt-8 mb-10">
            <h4 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
              Return Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Kilometer Reading *</label>
                <input
                  type="number"
                  name="returnKilometerReading"
                  value={formData.returnKilometerReading}
                  onChange={handleChange}
                  className={`w-full p-2 border ${errors.returnKilometerReading ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter return kilometer reading"
                  min="0"
                  step="0.1"
                />
                {errors.returnKilometerReading && (
                  <p className="mt-1 text-sm text-red-600">{errors.returnKilometerReading}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Fuel Amount *</label>
                <input
                  type="number"
                  name="returnFuelAmount"
                  value={formData.returnFuelAmount}
                  onChange={handleChange}
                  className={`w-full p-2 border ${errors.returnFuelAmount ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter return fuel amount"
                  min="0"
                  step="0.1"
                />
                {errors.returnFuelAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.returnFuelAmount}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Notes</label>
              <textarea
                name="returnNotes"
                value={formData.returnNotes}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional notes for the return"
                rows={3}
              />
            </div>

            {/* Return Files - Additional files specific to return */}
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Return Files</h4>
              <div className="flex flex-col items-start">
                <label className="mb-2 flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <FiUpload className="w-5 h-5 mr-2" />
                  Upload Return Files (Images/PDFs)
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFilesUpload(e, true)}
                    className="hidden"
                    multiple
                  />
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 w-full">
                  {returnFilePreviews.map((preview, index) => (
                    <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                      {preview.type === 'image' ? (
                        <>
                          <img 
                            src={preview.url} 
                            alt={`Return file preview ${index + 1}`} 
                            className="w-full h-48 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index, true)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : preview.type === 'pdf' ? (
                        <div className="h-48 flex flex-col items-center justify-center p-4">
                          <div className="bg-red-100 p-4 rounded-full mb-2">
                            <FiFile className="w-8 h-8 text-red-600" />
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
                              onClick={() => removeFile(index, true)}
                              className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center p-4">
                          <div className="bg-gray-100 p-4 rounded-full mb-2">
                            <FiFile className="w-8 h-8 text-gray-600" />
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
                              onClick={() => removeFile(index, true)}
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

            {/* Return Signatures */}
            <div className="mt-8">
              <h4 className="text-xl font-semibold mb-6 text-gray-800">
                Return Signatures
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.returnSignatures.map((signature, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <h5 className="text-lg font-semibold mb-4 text-gray-800">{signature.role}</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={signature.name}
                          onChange={(e) => handleSignatureChange(index, 'name', e.target.value, true)}
                          className={`w-full p-2 border ${errors[`signatureName${index}Return`] ? 'border-red-500' : 'border-gray-300'} rounded`}
                          placeholder="Enter name"
                        />
                        {errors[`signatureName${index}Return`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`signatureName${index}Return`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Signature *</label>
                        <input
                          type="text"
                          value={signature.signature}
                          onChange={(e) => handleSignatureChange(index, 'signature', e.target.value, true)}
                          className={`w-full p-2 border ${errors[`signatureValue${index}Return`] ? 'border-red-500' : 'border-gray-300'} rounded`}
                          placeholder="Enter signature"
                        />
                        {errors[`signatureValue${index}Return`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`signatureValue${index}Return`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          value={signature.date}
                          onChange={(e) => handleSignatureChange(index, 'date', e.target.value, true)}
                          className={`w-full p-2 border ${errors[`signatureDate${index}Return`] ? 'border-red-500' : 'border-gray-300'} rounded`}
                        />
                        {errors[`signatureDate${index}Return`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`signatureDate${index}Return`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              onClick={handleReturnSubmit}
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
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheckCircle className="mr-2" />
                  Complete Return
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderDriverView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            My Maintenance Requests
            {driverName && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                (Driver: {driverName})
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            View your maintenance requests or add a new request
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRequestForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm bg-white"
        >
          <FiPlusCircle
            className="w-12 h-12 p-1 rounded-full text-[#3c8dbc] transition-colors duration-200 hover:bg-[#3c8dbc] hover:text-white"
          />
        </motion.button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 max-w-md mx-auto">
            <FiFileText className="mx-auto text-3xl mb-4 text-blue-500" />
            <h4 className="font-medium text-lg mb-2">No Requests Found</h4>
            <p className="mb-4">
              You don't have any maintenance requests yet.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRequestForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm bg-white mx-auto"
            >
              <FiPlusCircle
                className="w-12 h-12 p-1 rounded-full text-[#3c8dbc] transition-colors duration-200 hover:bg-[#3c8dbc] hover:text-white"
              />
              <span className="text-[#3c8dbc] font-semibold">Add New Request</span>
            </motion.button>
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

  const renderInspectorView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Vehicle Inspections</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search approved requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 max-w-md mx-auto">
            <FiClipboard className="mx-auto text-3xl mb-4 text-blue-500" />
            <h4 className="font-medium text-lg mb-2">No Inspections Found</h4>
            <p className="mb-4">
              {searchQuery.trim() === '' 
                ? "There are no approved requests to inspect."
                : `No approved requests found matching "${searchQuery}"`}
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
       actorType === 'maintenance' ? renderMaintenanceView() :
       renderInspectorView()}
      
      <AnimatePresence>
        {showRequestForm && renderRequestForm()}
        {showRequestModal && selectedRequest && renderRequestModal()}
        {showAcceptanceModal && selectedRequest && renderAcceptanceModal()}
        {showReturnModal && selectedRequest && renderReturnModal()}
      </AnimatePresence>
    </>
  );
}



