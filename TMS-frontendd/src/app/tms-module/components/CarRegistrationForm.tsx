export default function CarRegistrationForm() {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-6 text-cyan-400">Register New Vehicle</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Type</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option>Sedan</option>
                <option>SUV</option>
                <option>Truck</option>
                <option>Van</option>
                <option>Bus</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">License Plate</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="ABC-1234"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Manufacturer</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Toyota"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Camry"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input 
                type="number" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="2020"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Red"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea 
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Any special features or notes..."
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
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors"
            >
              Register Vehicle
            </button>
          </div>
        </form>
      </div>
    );
  }