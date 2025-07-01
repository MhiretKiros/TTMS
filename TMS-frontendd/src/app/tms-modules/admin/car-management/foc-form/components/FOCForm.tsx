'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FiDownload, FiSave, FiAlertCircle, FiCheckCircle, FiLoader, FiPlus, FiTrash2 } from 'react-icons/fi';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FOCReportPDF from './FOCReportPDF';

const API_BASE_URL = 'http://localhost:8080';

interface FOCFormData {
  plateNumber: string;
  receivedBy: string;
  assignedOfficial: string;
  driverName: string;
  entryKm: number;
  entryFuel: number;
  KmDrivenInWorkShop: number;
  purposeAndDestination: string;
  oilUsed: {
    type: string;
    amount: number;
  }[];
  fuelUsed: number;
  exitDate: string;
  exitKm: number;
  dispatchOfficer: string;
  mechanicName: string;
  headMechanicName: string;
}

const FOCForm = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FOCFormData>({
    plateNumber: '',
    receivedBy: '',
    assignedOfficial: '',
    driverName: '',
    entryKm: 0,
    entryFuel: 0,
    KmDrivenInWorkShop: 0,
    purposeAndDestination: '',
    oilUsed: [{
      type: '',
      amount: 0,
    }],
    fuelUsed: 0,
    exitDate: '',
    exitKm: 0,
    dispatchOfficer: '',
    mechanicName: '',
    headMechanicName: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (formData.entryKm && formData.exitKm) {
      const kmDriven = formData.exitKm - formData.entryKm;
      setFormData(prev => ({
        ...prev,
        KmDrivenInWorkShop: kmDriven > 0 ? kmDriven : 0
      }));
    }
  }, [formData.entryKm, formData.exitKm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'entryKm' || name === 'entryFuel' || name === 'exitKm' || name === 'fuelUsed'
        ? (value === '' ? 0 : parseFloat(value))
        : value
    }));
  };

  const handleOilChange = (index: number, field: 'type' | 'amount', value: string) => {
    setFormData(prev => {
      const updatedOilUsed = [...prev.oilUsed];
      updatedOilUsed[index] = {
        ...updatedOilUsed[index],
        [field]: field === 'amount' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
      };
      return { ...prev, oilUsed: updatedOilUsed };
    });
  };

  const addOilField = () => {
    setFormData(prev => ({
      ...prev,
      oilUsed: [...prev.oilUsed, { type: '', amount: 0 }]
    }));
  };

  const removeOilField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      oilUsed: prev.oilUsed.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/foc-forms`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access Denied: You do not have permission to save this form.");
        }
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      setSuccessMessage('FOC form saved successfully!');

    } catch (error) {
      console.error('Error saving FOC form:', error);
      setError(`Error saving form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="no-print mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fuel Oil Grease Form</h1>
        <div className="flex space-x-2">
          {isClient ? (
            <PDFDownloadLink
              document={<FOCReportPDF formData={formData} />}
              fileName={`foc-form_${formData.plateNumber}_${new Date().toISOString().slice(0, 10)}.pdf`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded flex items-center disabled:opacity-50"
            >
              {({ loading }) =>
                loading ? (
                  <span className="flex items-center">
                    <FiLoader className="animate-spin mr-2" /> Preparing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiDownload className="mr-2" /> Download PDF
                  </span>
                )
              }
            </PDFDownloadLink>
          ) : (
            <button
              disabled
              className="bg-blue-500 text-white font-bold p-2 rounded flex items-center opacity-50 cursor-not-allowed"
            >
              <FiLoader className="animate-spin mr-2" /> Loading PDF...
            </button>
          )}
          <button
            type="submit"
            form="focForm"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded flex items-center disabled:opacity-50"
            title="Save Form"
            aria-label="Save FOC form"
          >
            {isLoading ? (
              <FiLoader className="animate-spin h-5 w-5 text-white" />
            ) : (
              <span className="flex items-center">
                <FiSave className="mr-2" /> Save
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
          <FiAlertCircle className="mr-2" /> {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md flex items-center">
          <FiCheckCircle className="mr-2" /> {successMessage}
        </div>
      )}

      <div ref={formRef} className="form-container bg-white p-6 rounded-lg shadow-md">
        <form id="focForm" className="space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">Plate Number *</label>
                <input 
                  type="text" 
                  id="plateNumber"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="receivedBy" className="block text-sm font-medium text-gray-700">Received By *</label>
                <input 
                  type="text" 
                  id="receivedBy"
                  name="receivedBy"
                  value={formData.receivedBy}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="assignedOfficial" className="block text-sm font-medium text-gray-700">Assigned Official *</label>
                <input 
                  type="text" 
                  id="assignedOfficial"
                  name="assignedOfficial"
                  value={formData.assignedOfficial}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">Driver Name *</label>
                <input 
                  type="text" 
                  id="driverName"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="entryKm" className="block text-sm font-medium text-gray-700">Entry Km *</label>
                <input 
                  type="number" 
                  id="entryKm"
                  name="entryKm"
                  value={formData.entryKm || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="entryFuel" className="block text-sm font-medium text-gray-700">Entry Fuel *</label>
                <input 
                  type="number" 
                  id="entryFuel"
                  name="entryFuel"
                  value={formData.entryFuel || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="KmDrivenInWorkShop" className="block text-sm font-medium text-gray-700">Km Driven In Workshop *</label>
                <input 
                  type="number" 
                  id="KmDrivenInWorkShop"
                  name="KmDrivenInWorkShop"
                  value={formData.KmDrivenInWorkShop || ''}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="purposeAndDestination" className="block text-sm font-medium text-gray-700">Purpose And Destination *</label>
                <textarea
                  id="purposeAndDestination"
                  name="purposeAndDestination"
                  value={formData.purposeAndDestination}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Oil Used *</label>
                <div className="space-y-2">
                  {formData.oilUsed.map((oil, index) => (
                    <div key={`oil-${index}`} className="flex items-center gap-2">
                      <div className="grid grid-cols-2 gap-2 flex-grow">
                        <input
                          type="text"
                          placeholder="Oil Type"
                          value={oil.type}
                          onChange={(e) => handleOilChange(index, 'type', e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Amount (Liters)"
                          value={oil.amount === 0 ? '' : oil.amount}
                          onChange={(e) => handleOilChange(index, 'amount', e.target.value)}
                          step="0.01"
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                          min="0"
                        />
                      </div>
                      {formData.oilUsed.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeOilField(index)} 
                          className="p-2 text-red-500 hover:text-red-700"
                          aria-label="Remove oil field"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={addOilField} 
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                  aria-label="Add oil field"
                >
                  <FiPlus className="mr-1" /> Add Oil
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="fuelUsed" className="block text-sm font-medium text-gray-700">Fuel Used (Liters) *</label>
                <input 
                  type="number" 
                  id="fuelUsed"
                  name="fuelUsed"
                  value={formData.fuelUsed || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="exitDate" className="block text-sm font-medium text-gray-700">Exit Date *</label>
                <input 
                  type="date" 
                  id="exitDate"
                  name="exitDate"
                  value={formData.exitDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="exitKm" className="block text-sm font-medium text-gray-700">Exit Km *</label>
                <input 
                  type="number" 
                  id="exitKm"
                  name="exitKm"
                  value={formData.exitKm || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="form-group">
              <label htmlFor="dispatchOfficer" className="block text-sm font-medium text-gray-700">Dispatch Officer *</label>
              <input 
                type="text" 
                id="dispatchOfficer"
                name="dispatchOfficer"
                value={formData.dispatchOfficer}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mechanicName" className="block text-sm font-medium text-gray-700">Mechanic Name *</label>
              <input 
                type="text" 
                id="mechanicName"
                name="mechanicName"
                value={formData.mechanicName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="headMechanicName" className="block text-sm font-medium text-gray-700">Head Mechanic Name *</label>
              <input 
                type="text" 
                id="headMechanicName"
                name="headMechanicName"
                value={formData.headMechanicName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FOCForm;