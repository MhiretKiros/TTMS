import { useState } from 'react';

export default function FuelManagementForms() {
  const [activeTab, setActiveTab] = useState('form1');
  const [form1Data, setForm1Data] = useState({
    servicePart: '',
    serviceNumber: '',
    serviceRequired: '',
    vehicleType: '',
    boardNumber: '',
    driverName: '',
    departureTime: '',
    returnTime: '',
    dutyReplyKm: '',
    roomPartKm: '',
    assemblyName: ''
  });

  const [form2Data, setForm2Data] = useState({
    servicePart: '',
    serviceNumber: '',
    serviceRequired: '',
    vehicleType: '',
    boardNumber: '',
    driverName: '',
    departureTime: '',
    returnTime: '',
    dutyReplyKm: '',
    roomPartKm: '',
    assemblyName: ''
  });

  const handleForm1Change = (e) => {
    const { name, value } = e.target;
    setForm1Data(prev => ({ ...prev, [name]: value }));
  };

  const handleForm2Change = (e) => {
    const { name, value } = e.target;
    setForm2Data(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(activeTab === 'form1' ? form1Data : form2Data);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Information Network Security Administration</h1>
          <h2 className="text-xl text-gray-600">CSD-026 Fuel's Gasoline from Field Returned</h2>
          <p className="text-sm text-gray-500 mt-2">Page 1 of 1</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'form1' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('form1')}
          >
            Form 1
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'form2' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('form2')}
          >
            Form 2
          </button>
        </div>

        {/* Form 1 */}
        {activeTab === 'form1' && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">1. The part of my service</label>
                <input
                  type="text"
                  name="servicePart"
                  value={form1Data.servicePart}
                  onChange={handleForm1Change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">2. Number of the service</label>
                <input
                  type="text"
                  name="serviceNumber"
                  value={form1Data.serviceNumber}
                  onChange={handleForm1Change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Repeat for other fields in Form 1 */}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">10. Name of the Assembly</label>
                <input
                  type="text"
                  name="assemblyName"
                  value={form1Data.assemblyName}
                  onChange={handleForm1Change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Form 1
              </button>
            </div>
          </form>
        )}

        {/* Form 2 */}
        {activeTab === 'form2' && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">1. The part of my service</label>
                <input
                  type="text"
                  name="servicePart"
                  value={form2Data.servicePart}
                  onChange={handleForm2Change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Repeat for other fields in Form 2 */}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">10. Name of the Assembly</label>
                <input
                  type="text"
                  name="assemblyName"
                  value={form2Data.assemblyName}
                  onChange={handleForm2Change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Form 2
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Make sure it's the correct form before using it.</p>
          <p>Please make sure this is the correct issue before use</p>
        </div>
      </div>
    </div>
  );
}
