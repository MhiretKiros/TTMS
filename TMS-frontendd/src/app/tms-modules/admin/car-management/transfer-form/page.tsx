"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
 import axios from 'axios';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface FormData {
  transferDate: string;
  transferNumber: string; // Changed from 'number'
  oldPlateNumber: string; // Changed from 'plateNumber'
  oldKmReading: string; // Changed from 'kmReading'
  designatedOfficial: string;
  driverName: string; // Changed from 'driversName'
  transferReason: string;
  oldFuelLiters: string; // Changed from 'fuelAmount'
  newPlateNumber: string; // Changed from 'substitutePlateNumber'
  newKmReading: string; // Changed from 'substituteKmReading'
  currentDesignatedOfficial: string; // Changed from 'substituteDesignatedOfficial'
  newFuelLiters: string; // Changed from 'substituteFuelAmount'
  verifyingBodyName: string;
  authorizingOfficerName: string;
}

const VehicleTransferForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    transferDate: getTodayDateString(), // Keep pre-filling date
    transferNumber: '', // Changed from 'number'
    oldPlateNumber: '', // Changed from 'plateNumber'
    oldKmReading: '', // Changed from 'kmReading'
    designatedOfficial: '',
    driverName: '', // Changed from 'driversName'
    transferReason: '',
    oldFuelLiters: '', // Changed from 'fuelAmount'
    newPlateNumber: '', // Changed from 'substitutePlateNumber'
    newKmReading: '', // Changed from 'substituteKmReading'
    currentDesignatedOfficial: '', // Changed from 'substituteDesignatedOfficial'
    newFuelLiters: '', // Changed from 'substituteFuelAmount'
    verifyingBodyName: '',
    authorizingOfficerName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    alert(formData.oldPlateNumber);
    const response = await axios.post('${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transfers', formData, {
      headers: {
        'Content-Type': 'application/json',
        // Authorization header removed as requested
      }
    });

    if (response.status === 200 || response.status === 201) {
      alert('Transfer info saved successfully!');
      // console.log(response.data); // Uncomment if you want to inspect the response
    } else {
      console.error('Failed to save transfer info. Status:', response.status);
      alert('Failed to save transfer info');
    }
  } catch (error: any) {
    if (error.response) {
      console.error('Server responded with an error:', error.response.data);
      alert('Server error: ' + error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
      alert('No response from server.');
    } else {
      console.error('Error setting up request:', error.message);
      alert('An unexpected error occurred.');
    }
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8 border border-gray-200"
    >
      {/* Moved title outside the form and made it larger */}
      <h2 className="text-3xl font-bold text-blue-600 p-8 pb-4">Vehicle Transfer Form</h2>
      <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
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
              <label htmlFor="transferNumber" className="text-sm font-medium text-gray-700 mb-2 block">Transfer Number:</label> {/* Label updated */}
              <input
                type="text"
                id="transferNumber" // ID updated
                name="transferNumber" // Corrected: Should match state key 'transferNumber'
                value={formData.transferNumber} // Corrected: Should match state key 'transferNumber'
                onChange={handleChange}
                className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                placeholder="e.g., Form #123"
              />
            </div>
          </motion.div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Original Vehicle Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldPlateNumber" className="text-sm font-medium text-gray-700 mb-1 block">Old Plate Number:</label><input type="text" id="oldPlateNumber" name="oldPlateNumber" value={formData.oldPlateNumber} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldKmReading" className="text-sm font-medium text-gray-700 mb-1 block">Old KM Reading:</label><input type="number" id="oldKmReading" name="oldKmReading" value={formData.oldKmReading} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div> {/* Name/ID/Label updated */}
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="designatedOfficial" className="text-sm font-medium text-gray-700 mb-1 block">The Designated Official:</label><input type="text" id="designatedOfficial" name="designatedOfficial" value={formData.designatedOfficial} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="driverName" className="text-sm font-medium text-gray-700 mb-1 block">Driver's Name:</label><input type="text" id="driverName" name="driverName" value={formData.driverName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div> {/* Name/ID/Label updated */}
            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2"><div className="form-group"><label htmlFor="transferReason" className="text-sm font-medium text-gray-700 mb-1 block">Transfer Reason:</label><textarea id="transferReason" name="transferReason" value={formData.transferReason} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all min-h-[100px] resize-vertical" /></div></motion.div> {/* Name/ID/Label updated */}
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="oldFuelLiters" className="text-sm font-medium text-gray-700 mb-1 block">Old Fuel:</label><input type="text" id="oldFuelLiters" name="oldFuelLiters" value={formData.oldFuelLiters} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div> {/* Name/ID/Label updated, added step */}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Assigned Substitute Vehicle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="newPlateNumber" className="text-sm font-medium text-gray-700 mb-1 block">New Plate Number:</label><input type="text" id="newPlateNumber" name="newPlateNumber" value={formData.newPlateNumber} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div> {/* Name/ID/Label updated */}
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="newKmReading" className="text-sm font-medium text-gray-700 mb-1 block">New KM Reading:</label><input type="number" id="newKmReading" name="newKmReading" value={formData.newKmReading} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="currentDesignatedOfficial" className="text-sm font-medium text-gray-700 mb-1 block">Current Designated Official:</label><input type="text" id="currentDesignatedOfficial" name="currentDesignatedOfficial" value={formData.currentDesignatedOfficial} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div> {/* Name/ID/Label updated */}
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="newFuelLiters" className="text-sm font-medium text-gray-700 mb-1 block">New Fuel:</label><input type="text" id="newFuelLiters" name="newFuelLiters" value={formData.newFuelLiters} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div> {/* Name/ID/Label updated, added step */}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 pt-4 pb-2 border-b border-gray-300 mb-6">Verification & Authorization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="verifyingBodyName" className="text-sm font-medium text-gray-700 mb-1 block">Verifying Body Name:</label><input type="text" id="verifyingBodyName" name="verifyingBodyName" value={formData.verifyingBodyName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
            <motion.div whileHover={{ scale: 1.02 }}><div className="form-group"><label htmlFor="authorizingOfficerName" className="text-sm font-medium text-gray-700 mb-1 block">Authorizing Officer Name:</label><input type="text" id="authorizingOfficerName" name="authorizingOfficerName" value={formData.authorizingOfficerName} onChange={handleChange} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all" /></div></motion.div>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex justify-end pt-4"
        >
          <button
            type="submit"
            className="px-8 py-3 rounded-xl font-bold text-white transition-all bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Submit
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default VehicleTransferForm;
