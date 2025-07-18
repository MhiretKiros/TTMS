'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiUpload, FiTrash2, FiPlus, FiMinus, FiDownload, FiEye } from 'react-icons/fi';
import { createVehicleAcceptance, updateVehicleAcceptance, getVehicleAcceptanceByAssignment, updateAssignmentStatus, updateRentCarStatus, updateCarStatus } from '../api/vehicleAcceptanceApi';
import Swal from 'sweetalert2';
import { useNotification } from '@/app/contexts/NotificationContext';

interface Signature {
  role: string;
  name: string;
  signature: string;
  date: string;
}

interface VehicleData {
  id?: string;
  rentCarId?: string;
  plateNumber: string;
  carType: string;
  km: string;
  inspectionItems: Record<string, boolean>;
  attachments: string[];
  carImages: (File | string)[];
  physicalContent: string[];
  notes: string[];
  signatures: Signature[];
  assignmentHistoryId?: number;
}

interface VehicleAcceptanceFormProps {
  initialData?: Partial<VehicleData>;
  onClose: () => void;
  onSuccess?: () => void;
  assignmentHistoryId?: number;
  isCompletedStatus?: boolean;
  isApprovedStatus?: boolean;
  isWaitingStatus?: boolean;
}
const vehicleParts = [
  'Hood',                           // 0 (shortest)
  'Roof',                           // 1 (medium)
  'Air conditioning controls',      // 2 (longest)

  'Trunk lid',                      // 3 (shortest)
  'Left mirror',                    // 4 (medium)
  'Radio/navigation system',        // 5 (longest)

  'Right wheel', 
  'Right mirror',                   // 6 (shortest)                   // 7 (medium)
  'Front right parking light',      // 8 (longest)

  'Left wheel',                     // 9 (shortest)
  'Right rear door',                //10 (medium)
  'Front left parking light',       //11 (longest)

  'Left rear door', 
  'Right rear light',               //12 (shortest)                //13 (medium)
  'Front right headlight',          //14 (longest)

  'Seat belts', 
  'Left rear light',                //15 (shortest)                    //16 (medium)
  'Front left headlight',           //17 (longest)

  'Floor mats',                     //18 (shortest)
  'Spare wheel',                    //19 (medium)
  'Front right fog light',          //20 (longest)

  'Handbrake',                      //21 (shortest)
  'Tire condition',                 //22 (medium)
  'Front left fog light',           //23 (longest)

  'Dashboard',                      //24 (shortest)
  'Rear window',                    //25 (medium)
  'Front right turn signal',        //26 (longest)

  'Sun visors',                     //27 (shortest)
  'Rear bumper',                    //28 (medium)
  'Front left turn signal',         //29 (longest)

  'Left front door',
  'Right rear fender',              //30 (shortest)                //31 (medium)
  'Right front parking light',      //32 (longest)

  'Right front door',               //33 (shortest)
  'Left rear fender',               //34 (medium)
  'Right front headlight',          //35 (longest)

  'Left front fender',              //36 (shortest)
  'Left rear fender',               //37 (medium)
  'Instrument cluster',             //38 (longest)

  'Seats condition',
  'Right front fender',             //39 (shortest)                //40 (medium)
  'Steering column cover',          //41 (longest)

  'Windshield', 
  'Center console',                 //42 (shortest)                  //43 (medium)
  'Steering wheel',                 //44 (longest)

  'Front grille',
  'Front bumper',
  'Interior trim',                  //45 (shortest)
                     //46 (medium)
                     //47 (longest)

  'Headliner'                       //48 (shortest)
];


const VehicleAcceptanceForm: React.FC<VehicleAcceptanceFormProps> = ({ 
  initialData, 
  onClose,
  onSuccess,
  assignmentHistoryId,
  isCompletedStatus = false,
  isApprovedStatus = false
}) => {

  const { addNotification } = useNotification();
  const today = new Date().toISOString().split('T')[0];
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    plateNumber: '',
    carType: '',
    km: '',
    inspectionItems: vehicleParts.reduce((acc, part) => ({ ...acc, [part]: true }), {}),
    attachments: [''],
    carImages: [],
    physicalContent: [''],
    notes: [''],
    signatures: [
      { role: 'Various', name: '', signature: '', date: today },
      { role: 'Araser', name: '', signature: '', date: today },
      { role: 'Head of Proven', name: '', signature: '', date: today }
    ],
    assignmentHistoryId: assignmentHistoryId || initialData?.assignmentHistoryId
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filePreviews, setFilePreviews] = useState<Array<{ url: string; type: 'image' | 'pdf' | 'other' }>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadExistingData = async () => {
      if (assignmentHistoryId && !isCompletedStatus) {
        try {
          const { data, error } = await getVehicleAcceptanceByAssignment(assignmentHistoryId);
          if (error) throw new Error(error.message);
          
          if (data) {
            const formattedData = {
              ...data,
              carImages: data.carImages || [],
              attachments: data.attachments || [''],
              physicalContent: data.physicalContent || [''],
              notes: data.notes || [''],
              signatures: data.signatures || vehicleData.signatures,
              inspectionItems: {
                ...vehicleParts.reduce((acc, part) => ({ ...acc, [part]: true }), {}),
                ...data.inspectionItems
              }
            };
            setVehicleData(formattedData);
            
            // Set file previews based on existing files
            const previews = data.carImages.map((file: string) => {
              const isPdf = file.toLowerCase().endsWith('.pdf');
              return {
                url: file,
                type: isPdf ? 'pdf' : 'image'
              };
            });
            setFilePreviews(previews);
            
            setIsEditing(true);
          }
        } catch (error: any) {
          console.error('Error loading existing acceptance:', error);
          Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to load existing vehicle acceptance data',
            icon: 'error'
          });
        }
      }
    };

    if (initialData) {
      const mergedData = {
        ...vehicleData,
        ...initialData,
        inspectionItems: {
          ...vehicleParts.reduce((acc, part) => ({ ...acc, [part]: true }), {}),
          ...(initialData.inspectionItems || {})
        },
        attachments: initialData.attachments?.length ? [...initialData.attachments] : [''],
        carImages: initialData.carImages?.length ? [...initialData.carImages] : [],
        physicalContent: initialData.physicalContent?.length ? [...initialData.physicalContent] : [''],
        notes: initialData.notes?.length ? [...initialData.notes] : [''],
        signatures: initialData.signatures || vehicleData.signatures,
        assignmentHistoryId: initialData.assignmentHistoryId || assignmentHistoryId
      };
      setVehicleData(mergedData);

      // Set file previews for completed status
      if (initialData.carImages?.length) {
        const previews = initialData.carImages.map((file: string | File) => {
          if (typeof file === 'string') {
            const isPdf = file.toLowerCase().endsWith('.pdf');
            return {
              url: file,
              type: isPdf ? 'pdf' : 'image'
            };
          }
          return {
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type === 'application/pdf' ? 'pdf' : 'other'
          };
        });
        setFilePreviews(previews);
      }
      
      if (initialData.id) {
        setIsEditing(true);
      }
    } else {
      loadExistingData();
    }
  }, [initialData, assignmentHistoryId, isCompletedStatus]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!vehicleData.plateNumber.trim()) {
      newErrors.plateNumber = 'Plate number is required';
    } else if (!/^[A-Z0-9-]{3,10}$/i.test(vehicleData.plateNumber)) {
      newErrors.plateNumber = 'Invalid plate number format';
    }
    
    if (!vehicleData.carType.trim()) {
      newErrors.carType = 'Car type is required';
    }
    
    if (!vehicleData.km.trim()) {
      newErrors.km = 'KM is required';
    } else if (!/^\d+$/.test(vehicleData.km)) {
      newErrors.km = 'KM must be a number';
    }

    if (vehicleData.carImages.length === 0) {
      newErrors.carImages = 'At least one car image is required';
    }

    vehicleData.signatures.forEach((sig, index) => {
      if (!sig.name.trim()) {
        newErrors[`signatureName${index}`] = 'Name is required';
      }
      if (!sig.signature.trim()) {
        newErrors[`signatureValue${index}`] = 'Signature is required';
      }
      if (!sig.date) {
        newErrors[`signatureDate${index}`] = 'Date is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();

      const requestData = {
        plateNumber: vehicleData.plateNumber,
        carType: vehicleData.carType,
        km: vehicleData.km,
        inspectionItems: vehicleData.inspectionItems,
        attachments: vehicleData.attachments.filter(Boolean),
        physicalContent: vehicleData.physicalContent.filter(Boolean),
        notes: vehicleData.notes.filter(Boolean),
        signatures: vehicleData.signatures,
        assignmentHistoryId: vehicleData.assignmentHistoryId,
        existingImageUrls: isEditing ? 
          vehicleData.carImages.filter(img => typeof img === 'string') as string[] : 
          undefined,
        isCompletedStatus
      };

      formData.append('data', JSON.stringify(requestData));

      vehicleData.carImages.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });

      // First, handle the vehicle acceptance form submission
      const apiResponse = isEditing && !isCompletedStatus
        ? await updateVehicleAcceptance(vehicleData.id!, formData)
        : await createVehicleAcceptance(formData);

      if (apiResponse.error) {
        throw new Error(apiResponse.error.message || 'API request failed');
      }

      if (isCompletedStatus) {
        await updateCarOrRentCarStatus(vehicleData.plateNumber, 'In_transfer');
        
        if (vehicleData.assignmentHistoryId !== undefined) {
          await updateAssignmentStatus(vehicleData.assignmentHistoryId, 'In_transfer');
        } else {
          throw new Error('assignmentHistoryId is required for status update');
        }
      } else if(isApprovedStatus) {
        if (vehicleData.assignmentHistoryId !== undefined) {
          await updateAssignmentStatus(vehicleData.assignmentHistoryId, 'Completed');
        } else {
          throw new Error('assignmentHistoryId is required to mark as completed');
        }
      } else {
        if (vehicleData.assignmentHistoryId !== undefined) {
          await updateAssignmentStatus(vehicleData.assignmentHistoryId, 'In_transfer');
        } else {
          throw new Error('assignmentHistoryId is required to mark as completed');
        }
        await updateCarOrRentCarStatus(vehicleData.plateNumber, 'In_transfer');
      } 

      await Swal.fire({
        title: 'Success!',
        text: isCompletedStatus 
          ? 'Vehicle transfer initiated successfully' 
          : isEditing 
            ? 'Vehicle acceptance updated successfully'
            : 'Vehicle acceptance created successfully',
        icon: 'success'
      });

      if (isCompletedStatus) {
      try {
              await addNotification(
                `One vehicle is in transfer`,
                `/tms-modules/admin/car-management/assign-car`,
                'DISTRIBUTOR' // Role that should see this notification
              );
              
            } catch (notificationError) {
              console.error('Failed to add notification:', notificationError);
              // Optionally show error to user
            }
          }

      if (onSuccess) onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'An unexpected error occurred');
      
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Submission failed',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCarOrRentCarStatus = async (plateNumber: string, status: string) => {
    try {
      // Determine if this is a car or rent-car based on initialData
      // This assumes initialData contains either carId or rentCarId
      const isRentCar = initialData?.rentCarId !== undefined;
      
      if (isRentCar) {
        await updateRentCarStatus(plateNumber, status);
      } else {
        await updateCarStatus(plateNumber, status);
      }
    } catch (error: any) {
      console.error('Error updating vehicle status:', error);
      throw new Error(`Failed to update vehicle status: ${error.message}`);
    }
  };

  const handleSignatureChange = (index: number, field: keyof Signature, value: string) => {
    setVehicleData(prev => {
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

  const handleCheckboxToggle = (part: string) => {
    setVehicleData(prev => ({
      ...prev,
      inspectionItems: {
        ...prev.inspectionItems,
        [part]: !prev.inspectionItems[part]
      }
    }));
  };

  const handleDynamicFieldChange = (
    fieldType: 'attachments' | 'physicalContent' | 'notes', 
    index: number, 
    value: string
  ) => {
    setVehicleData(prev => {
      const updatedFields = [...prev[fieldType]];
      updatedFields[index] = value;
      return { ...prev, [fieldType]: updatedFields };
    });
  };

  const addDynamicField = (fieldType: 'attachments' | 'physicalContent' | 'notes') => {
    setVehicleData(prev => ({
      ...prev,
      [fieldType]: [...prev[fieldType], '']
    }));
  };

  const removeDynamicField = (fieldType: 'attachments' | 'physicalContent' | 'notes', index: number) => {
    if (vehicleData[fieldType].length > 1) {
      setVehicleData(prev => {
        const updatedFields = [...prev[fieldType]];
        updatedFields.splice(index, 1);
        return { ...prev, [fieldType]: updatedFields };
      });
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
        const newPreviews: Array<{ url: string; type: 'image' | 'pdf' | 'other' }> = [];
        const newImages: (File | string)[] = [...vehicleData.carImages];

        validFiles.forEach(file => {
          const preview = {
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type === 'application/pdf' ? 'pdf' : 'other'
          };
          newPreviews.push(preview);
          newImages.push(file);
        });

        setFilePreviews(prev => [...prev, ...newPreviews]);
        setVehicleData(prev => ({
          ...prev,
          carImages: newImages
        }));
        
        if (errors.carImages) {
          setErrors(prev => ({ ...prev, carImages: '' }));
        }
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
        setVehicleData(prev => {
          const newImages = [...prev.carImages];
          newImages.splice(index, 1);
          return { ...prev, carImages: newImages };
        });
        setFilePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews.splice(index, 1);
          return newPreviews;
        });
      }
    });
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'All unsaved changes will be lost',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No, keep editing'
    }).then((result) => {
      if (result.isConfirmed) {
        onClose();
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {submitError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Vehicle Information Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Plate Number *</label>
            <input
              type="text"
              name="plateNumber"
              value={vehicleData.plateNumber}
              onChange={handleInputChange}
              required
              className={`w-full p-2 border ${errors.plateNumber ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.plateNumber && <p className="mt-1 text-sm text-red-600">{errors.plateNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Car Type *</label>
            <input
              type="text"
              name="carType"
              value={vehicleData.carType}
              onChange={handleInputChange}
              required
              className={`w-full p-2 border ${errors.carType ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.carType && <p className="mt-1 text-sm text-red-600">{errors.carType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">KM *</label>
            <input
              type="text"
              name="km"
              value={vehicleData.km}
              onChange={handleInputChange}
              required
              className={`w-full p-2 border ${errors.km ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.km && <p className="mt-1 text-sm text-red-600">{errors.km}</p>}
          </div>
        </div>

        {/* Vehicle Parts Checklist */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Vehicle Parts Inspection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicleParts.map((part, index) => (
              <div key={index} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleCheckboxToggle(part)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center mr-2 border ${
                    vehicleData.inspectionItems[part] ? 'border-green-500' : 'border-red-500'
                  } bg-white`}
                >
                  {vehicleData.inspectionItems[part] ? (
                    <FiCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <FiX className="w-4 h-4 text-red-500" />
                  )}
                </button>
                <span className="text-gray-800">{part}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Files Upload Section - Updated to allow modifications in completed status */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
            Vehicle Files
          </h2>
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
            {errors.carImages && <p className="mt-1 text-sm text-red-600">{errors.carImages}</p>}
            
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

        {/* Dynamic Fields Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Other Attachments */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Other Attachments</h2>
            <div className="space-y-3">
              <AnimatePresence>
                {vehicleData.attachments.map((attachment, index) => (
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
                    {vehicleData.attachments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDynamicField('attachments', index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FiMinus className="w-5 h-5" />
                      </button>
                    )}
                    {index === vehicleData.attachments.length - 1 && (
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
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Physical Content</h2>
            <div className="space-y-3">
              <AnimatePresence>
                {vehicleData.physicalContent.map((content, index) => (
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
                    {vehicleData.physicalContent.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDynamicField('physicalContent', index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FiMinus className="w-5 h-5" />
                      </button>
                    )}
                    {index === vehicleData.physicalContent.length - 1 && (
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
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Notes</h2>
            <div className="space-y-3">
              <AnimatePresence>
                {vehicleData.notes.map((note, index) => (
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
                    {vehicleData.notes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDynamicField('notes', index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FiMinus className="w-5 h-5" />
                      </button>
                    )}
                    {index === vehicleData.notes.length - 1 && (
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

        {/* Signatures Section */}
        <div className="mt-8 mb-10">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Vehicle Acceptance Signatures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicleData.signatures.map((signature, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">{signature.role}</h4>
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

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Make sure it's the correct form before using it. Please MAKE SURE THIS IS THE CORRECT ISSUE BEFORE USE.
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8 border-t pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#3c8dbc] hover:bg-[#367fa9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c8dbc] transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Submitting...'}
              </span>
            ) : isEditing ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleAcceptanceForm;