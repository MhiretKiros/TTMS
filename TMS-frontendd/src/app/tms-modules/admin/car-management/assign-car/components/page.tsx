// c:\Users\hp\Desktop\TMS-2\TMS-frontendd\src\app\tms-modules\admin\car-management\assign-car\components\transfer-form\page.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { useReactToPrint, PrintContextConsumer } from 'react-to-print';
import PrintableTransferForm from '../transfer-form/PrintableTransferForm'; // Import the printable component, added .tsx extension
import { FiPrinter } from 'react-icons/fi'; // Import the printer icon

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Car {
  id: string;
  plateNumber: string;
  model: string;
  status: string;
  isRentCar?: boolean;
}

export interface FormData { // Export FormData so PrintableTransferForm can use it
  transferDate: string;
  transferNumber: string;
  oldPlateNumber: string;
  oldKmReading: string;
  designatedOfficial: string;
  driverName: string;
  transferReason: string;
  oldFuelLiters: string;
  newPlateNumber: string;
  newKmReading: string;
  currentDesignatedOfficial: string;
  newFuelLiters: string;
  verifyingBodyName: string;
  authorizingOfficerName: string;
  assignmentHistoryId: string;
}

interface CarTransferFormProps {
  initialData?: Partial<FormData>;
  onClose?: () => void;
  onSuccess?: () => void;
}
 
const CarTransferForm: React.FC<CarTransferFormProps> = ({ 
  initialData = {}, 
  onClose, 
  onSuccess 
}) => {
  const printableComponentRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    transferDate: getTodayDateString(),
    transferNumber: '',
    oldPlateNumber: initialData.oldPlateNumber || '',
    oldKmReading: initialData.oldKmReading || '',
    designatedOfficial: initialData.designatedOfficial || '',
    driverName: initialData.driverName || '',
    transferReason: '',
    oldFuelLiters: '',
    newPlateNumber: '',
    newKmReading: '',
    currentDesignatedOfficial: '',
    newFuelLiters: '',
    verifyingBodyName: '',
    authorizingOfficerName: '',
    assignmentHistoryId: initialData.assignmentHistoryId?.toString() || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isPrintableReady, setIsPrintableReady] = useState(false); // Track if printable content ref is set

  // Define pageStyle for printing
  const pageStyle = `
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      /* Add any other print-specific styles here */
    }
  `;

  // Setup react-to-print
  const handlePrint = useReactToPrint({
    content: () => {
      console.log('[CarTransferForm] useReactToPrint content() called. printableComponentRef.current:', printableComponentRef.current);
      if (!printableComponentRef.current) {
        console.error('[CarTransferForm] Error in useReactToPrint content(): printableComponentRef.current is null. This should ideally be caught before calling handlePrint.');
        Swal.fire({
          title: 'Print Error',
          text: 'The form content is not available for printing. The component to print might not have rendered correctly. Please try again or refresh the page.',
          icon: 'error',
        });
        return null; // Explicitly return null if content is not available
      }
      return printableComponentRef.current;
    },
    documentTitle: `Vehicle-Transfer-Form-${formData.transferNumber || 'New'}-${formData.transferDate}`,
    pageStyle: pageStyle,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => { // It's good practice for onBeforeGetContent to return a Promise
        console.log('[CarTransferForm] onBeforeGetContent: printableComponentRef.current is', printableComponentRef.current);
        if (!printableComponentRef.current) {
          console.warn('[CarTransferForm] onBeforeGetContent: Ref is null. This indicates the content was not ready when printing was initiated.');
          // It's too late here to prevent the print if ref is null, content() will return null.
          // This callback is more for preparing content just before it's grabbed.
        }
        // You could potentially add a small delay here if needed for CSS to apply, etc.
        resolve();
      });
    },
    onPrintError: (errorType, error) => {
      console.error('[CarTransferForm] react-to-print onPrintError:', errorType, error);
      Swal.fire('Print Error', `Could not print the form. Error type: ${errorType}. Check console for details.`, 'error');
    }
  });

 
  // Fetch available cars when component mounts
  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        const [regularCarsResponse, rentCarsResponse] = await Promise.all([
          axios.get('${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/approved'),
          axios.get('${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/approved')
        ]);

        const regularCars: Car[] = regularCarsResponse.data?.carList?.map((car: any) => ({
          id: car.id.toString(),
          plateNumber: car.plateNumber,
          model: car.model,
          status: car.status,
          isRentCar: false
        })) || [];

        const rentCars: Car[] = rentCarsResponse.data?.rentCarList?.map((car: any) => ({
          id: `rent-${car.id}`, // Ensure unique ID for rent cars if IDs might overlap
          plateNumber: car.plateNumber,
          model: car.model,
          status: car.status,
          isRentCar: true
        })) || [];

        setAvailableCars([...regularCars, ...rentCars]);
      } catch (error) {
        console.error('Error fetching available cars:', error);
        Swal.fire('Error', 'Could not fetch available cars.', 'error');
      }
    };

    fetchAvailableCars();
  }, []);

  useEffect(() => {
    // This effect runs after the component mounts and updates.
    // Check if the ref to the printable component has been populated.
    // This effect will run when formData or isPrintableReady changes.
    // After CarTransferForm re-renders (e.g., due to formData change),
    // PrintableTransferForm (child) also re-renders, and its ref should be assigned.
    // Then, this effect runs and checks the current state of printableComponentRef.current.
    if (printableComponentRef.current) {
      if (!isPrintableReady) {
        console.log('[CarTransferForm] useEffect (deps: formData, isPrintableReady): Ref available, setting isPrintableReady to true. Ref:', printableComponentRef.current);
        setIsPrintableReady(true);
      }
    } else {
      if (isPrintableReady) {
        console.warn('[CarTransferForm] useEffect (deps: formData, isPrintableReady): Ref became null unexpectedly, setting isPrintableReady to false.');
        setIsPrintableReady(false);
      } else {
        console.log('[CarTransferForm] useEffect (deps: formData, isPrintableReady): Ref is still null, isPrintableReady is false. Waiting for ref.');
      }
    }
  }, [formData, isPrintableReady]); // Dependencies: formData (causes PrintableTransferForm to re-render)
                                   // and isPrintableReady (to manage this state correctly).
  // Filter cars based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      setFilteredCars(
        availableCars.filter(car => 
          car.plateNumber.toLowerCase().includes(term) ||
          car.model.toLowerCase().includes(term)
      ));
    } else {
      setFilteredCars(availableCars); // Show all available cars if search term is empty
    }
  }, [searchTerm, availableCars]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewPlateNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setShowDropdown(true);
    // Update formData.newPlateNumber directly as user types.
    // If a car is selected from dropdown, selectCar will overwrite this.
    setFormData(prev => ({ ...prev, newPlateNumber: newSearchTerm }));
  };

  const selectCar = (car: Car) => {
    setFormData(prev => ({ ...prev, newPlateNumber: car.plateNumber }));
    setSearchTerm(car.plateNumber); // Update search term to reflect selection
    setShowDropdown(false);
  };

  const updateCarStatus = async (plateNumber: string, status: string, isRentCar: boolean = false) => {
    const endpoint = isRentCar 
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/status/${plateNumber}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/status/${plateNumber}`;
    
    try {
      await axios.put(endpoint, { status });
    } catch (error) {
      console.error(`Error updating ${isRentCar ? 'rent car' : 'car'} status for ${plateNumber} to ${status}:`, error);
      throw error; // Re-throw to be caught by handleSubmit
    }
  };

  const updateAssignmentHistory = async () => {
    try {
      const newCar = availableCars.find(car => car.plateNumber === formData.newPlateNumber);
      if (!newCar) {
        // This case should ideally be prevented by form validation or selection logic
        throw new Error('Selected new car not found in the available cars list.');
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/assignments/update/${formData.assignmentHistoryId}`,
        { 
          status: 'Completed', // Or 'Transferred' if that's more appropriate
          carIds: [newCar.id], 
          plateNumbers: newCar.plateNumber,
          allCarModels: newCar.model,
          numberOfCar: "1/1" // This might need to be dynamic if multiple cars can be assigned
        }
      );
    } catch (error) {
      console.error('Error updating assignment history:', error);
      throw error; // Re-throw to be caught by handleSubmit
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation example (you can expand this)
    if (!formData.newPlateNumber) {
        Swal.fire('Validation Error', 'New Plate Number is required.', 'warning');
        setIsSubmitting(false);
        return;
    }
    if (!formData.assignmentHistoryId) {
        Swal.fire('Error', 'Assignment History ID is missing. Cannot proceed.', 'error');
        setIsSubmitting(false);
        return;
    }


    try {
      // 1. Save the transfer record
      const transferPayload = {
        ...formData,
        // Ensure numeric fields are numbers if backend expects them
        oldKmReading: formData.oldKmReading ? parseFloat(formData.oldKmReading) : null,
        oldFuelLiters: formData.oldFuelLiters ? parseFloat(formData.oldFuelLiters) : null,
        newKmReading: formData.newKmReading ? parseFloat(formData.newKmReading) : null,
        newFuelLiters: formData.newFuelLiters ? parseFloat(formData.newFuelLiters) : null,
        assignmentHistoryId: parseInt(formData.assignmentHistoryId) 
      };
      
      const transferResponse = await axios.post('${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transfers', transferPayload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (transferResponse.status !== 200 && transferResponse.status !== 201) {
        // Axios throws for non-2xx, but good to have explicit check if needed
        throw new Error(`Failed to save transfer info. Status: ${transferResponse.status}`);
      }

      const newCar = availableCars.find(car => car.plateNumber === formData.newPlateNumber);
      if (!newCar) {
        // This should ideally not happen if selection logic is robust
        throw new Error('Selected car for transfer not found in available cars list after submission.');
      }
      
      const oldCar = availableCars.find(car => car.plateNumber === formData.oldPlateNumber);
      // oldCar might not be in `availableCars` if its status was already something else,
      // so handle its potential undefined state gracefully for isRentCar.
      // The backend should handle cases where oldPlateNumber might not be found or its type.

      // 2. Update the assignment history with new car information
      await updateAssignmentHistory();

      // 3. Update the old car status to "In_transfer" or "Available"
      // Consider what the final status of the old car should be.
      // If it's immediately available for reassignment, "Available" might be better.
      // If "In_transfer" is a temporary state before it becomes "Available", that's also fine.
      if (formData.oldPlateNumber) { // Only update if there was an old plate number
        await updateCarStatus(formData.oldPlateNumber, 'In_transfer', oldCar?.isRentCar);
      }


      // 4. Update the new car status to "Assigned"
      await updateCarStatus(formData.newPlateNumber, 'Assigned', newCar.isRentCar);

      Swal.fire({
        title: 'Success!',
        text: 'Transfer completed successfully and vehicle statuses updated.',
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });

      if (onSuccess) onSuccess();
      // Optionally, reset form or close modal here
      // if (onClose) onClose(); 

    } catch (error: any) {
      console.error('Error during transfer process:', error);
      
      let errorMessage = 'An unexpected error occurred during the transfer.';
      if (error.response) {
        // Axios error with response from server
        errorMessage = error.response.data?.message || error.response.data?.error || JSON.stringify(error.response.data) || 'Error response from server.';
      } else if (error.request) {
        // Axios error where request was made but no response received
        errorMessage = 'No response from server. Please check your network connection.';
      } else if (error.message) {
        // Other errors (e.g., setup error, client-side logic error)
        errorMessage = error.message;
      }

      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={printableComponentRef} // Attach the ref to the main container of the form
      className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8 border border-gray-200"
    >
      <div className="flex justify-between items-center p-8 pb-4">
        <h2 className="text-3xl font-bold text-blue-600">Vehicle Transfer Form</h2>
        {/* Moved Print button to the header of the form for better UX */}
        <button
            onClick={() => {
              console.log('[CarTransferForm] Print button clicked. Checking ref immediately:', printableComponentRef.current, 'isPrintableReady:', isPrintableReady);
              if (!printableComponentRef.current || !isPrintableReady) {
                  Swal.fire(
                      'Print Unavailable',
                      'The content to print is not ready yet. This can happen if the form has just loaded. Please wait a moment and try again. If the problem persists, there might be an issue rendering the print layout.',
                      'warning'
                  );
                  return;
              }
              handlePrint(); // Call the actual print handler
            }}
            disabled={isSubmitting || !isPrintableReady} // Disable if submitting or printable content not confirmed ready
            title={!isPrintableReady ? "The printable form is still loading. Please wait a moment." : "Print Transfer Form"}
            className={`no-print px-4 py-2 text-white rounded-md shadow transition-colors text-sm flex items-center gap-2 ${isPrintableReady && !isSubmitting ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
        >
            <FiPrinter className="h-4 w-4" />
            {isPrintableReady ? 'Print Form' : 'Preparing Print...'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
        <input 
          type="hidden" 
          name="assignmentHistoryId" 
          value={formData.assignmentHistoryId} 
        />

        {/* Transfer Date and Number Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }}>
            <div className="form-group">
              <label htmlFor="transferDate" className="text-sm font-medium text-gray-700 mb-2 block">Transfer Date:</label>
              <input
                type="date"
                id="transferDate"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleChange}
                className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
              />
            </div>            
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <div className="form-group">
              <label htmlFor="transferNumber" className="text-sm font-medium text-gray-700 mb-2 block">Transfer Number:</label>
              <input
                type="text"
                id="transferNumber"
                name="transferNumber"
                value={formData.transferNumber}
                onChange={handleChange}
                className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                placeholder="e.g., TRN-2023-001"
                required
              />
            </div>
          </motion.div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Original Vehicle Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldPlateNumber" className="text-sm font-medium text-gray-700 mb-1 block">Old Plate Number:</label><input type="text" id="oldPlateNumber" name="oldPlateNumber" value={formData.oldPlateNumber} onChange={handleChange} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" readOnly /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldKmReading" className="text-sm font-medium text-gray-700 mb-1 block">Old KM Reading:</label><input type="number" id="oldKmReading" name="oldKmReading" value={formData.oldKmReading} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" placeholder="e.g., 12345" min="0" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="designatedOfficial" className="text-sm font-medium text-gray-700 mb-1 block">The Designated Official:</label><input type="text" id="designatedOfficial" name="designatedOfficial" value={formData.designatedOfficial} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="driverName" className="text-sm font-medium text-gray-700 mb-1 block">Driver's Name:</label><input type="text" id="driverName" name="driverName" value={formData.driverName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2"><div className="form-group"><label htmlFor="transferReason" className="text-sm font-medium text-gray-700 mb-1 block">Transfer Reason:</label><textarea id="transferReason" name="transferReason" value={formData.transferReason} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all min-h-[100px] resize-vertical" placeholder="Reason for vehicle transfer..." required /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldFuelLiters" className="text-sm font-medium text-gray-700 mb-1 block">Old Fuel (Liters):</label><input type="number" step="0.1" id="oldFuelLiters" name="oldFuelLiters" value={formData.oldFuelLiters} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" placeholder="e.g., 45.5" min="0" /></div></motion.div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Assigned Substitute Vehicle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}>
              <div className="form-group relative">
                <label htmlFor="newPlateNumberSearch" className="text-sm font-medium text-gray-700 mb-1 block">New Plate Number:</label>
                <input
                  type="text"
                  id="newPlateNumberSearch" // Changed ID to avoid conflict if newPlateNumber is also a hidden input
                  name="newPlateNumberSearch" // Use a different name for search input
                  value={searchTerm} // Display value is search term
                  onChange={handleNewPlateNumberChange}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click on dropdown
                  className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                  placeholder="Search or type plate no..."
                  autoComplete="off"
                  required // Make selection required
                />
                {showDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCars.length > 0 ? (
                      filteredCars.map((car) => (
                        <div
                          key={car.id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                          // Use onMouseDown to ensure it fires before onBlur hides the dropdown
                          onMouseDown={() => selectCar(car)}
                        >
                          <span>{car.plateNumber}</span>
                          <span className="text-sm text-gray-500">{car.model} ({car.isRentCar ? 'Rent' : 'Regular'})</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No available cars match your search.</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="newKmReading" className="text-sm font-medium text-gray-700 mb-1 block">New KM Reading:</label><input type="number" id="newKmReading" name="newKmReading" value={formData.newKmReading} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" placeholder="e.g., 500" min="0" required /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="currentDesignatedOfficial" className="text-sm font-medium text-gray-700 mb-1 block">Current Designated Official:</label><input type="text" id="currentDesignatedOfficial" name="currentDesignatedOfficial" value={formData.currentDesignatedOfficial} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" required /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="newFuelLiters" className="text-sm font-medium text-gray-700 mb-1 block">New Fuel (Liters):</label><input type="number" step="0.1" id="newFuelLiters" name="newFuelLiters" value={formData.newFuelLiters} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" placeholder="e.g., 50.0" min="0" required /></div></motion.div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Verification & Authorization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="verifyingBodyName" className="text-sm font-medium text-gray-700 mb-1 block">Verifying Body Name:</label><input type="text" id="verifyingBodyName" name="verifyingBodyName" value={formData.verifyingBodyName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" required /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="authorizingOfficerName" className="text-sm font-medium text-gray-700 mb-1 block">Authorizing Officer Name:</label><input type="text" id="authorizingOfficerName" name="authorizingOfficerName" value={formData.authorizingOfficerName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" required /></div></motion.div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          {onClose && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-medium text-gray-700 transition-all bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Cancel
              </button>
            </motion.div>
          )}
          {/* The print button was moved to the top, but if you want one here too, uncomment:
           <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="button" 
              onClick={handlePrint}
              disabled={isSubmitting} 
              className="px-6 py-2 rounded-lg font-medium text-white transition-all bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 flex items-center gap-2"
            >
              <FiPrinter className="h-4 w-4" /> Print
            </button>
          </motion.div>
          */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium text-white transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#3c8dbc] hover:bg-[#367fa9]'} focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:ring-opacity-50`}
            >
              {isSubmitting ? 'Processing...' : 'Submit Transfer'}
            </button>
          </motion.div>
        </div>
      </form>
      {/* Hidden component for printing */}
      {/* If you intend to print the entire visible form (CarTransferForm), then the printableComponentRef
          should ONLY be on the main motion.div of CarTransferForm. This hidden PrintableTransferForm
          should not use the same ref if it's not the primary target for printing the whole page.
          If this component is exclusively for a different, dedicated print layout, it would need its own ref and print trigger. */}
      <div style={{ display: "none" }}>
        {/* <PrintableTransferForm ref={printableComponentRef} data={formData} /> */}
        {/* If PrintableTransferForm is not being used or printed separately, you can remove it or ensure it doesn't use printableComponentRef */}
        <PrintableTransferForm data={formData} /> 
      </div>
    </motion.div>
  );
};

export default CarTransferForm;
