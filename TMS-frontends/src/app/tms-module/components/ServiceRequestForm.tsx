export default function ServiceRequestForm() {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-6 text-cyan-400">Create Service Request</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option>Select a vehicle</option>
                <option>VH001 - Sedan (Toyota Camry)</option>
                <option>VH002 - SUV (Honda CR-V)</option>
                <option>VH003 - Truck (Ford F-150)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Service Type</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option>Routine Maintenance</option>
                <option>Engine Repair</option>
                <option>Tire Replacement</option>
                <option>Brake Service</option>
                <option>Electrical System</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input type="radio" name="priority" className="text-cyan-500" defaultChecked />
                  <span className="ml-2">Low</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="priority" className="text-amber-500" />
                  <span className="ml-2">Medium</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="priority" className="text-red-500" />
                  <span className="ml-2">High</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Requested Date</label>
              <input 
                type="date" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Problem Description</label>
            <textarea 
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Describe the issue in detail..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    );
  }