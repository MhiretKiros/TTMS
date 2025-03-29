'use client';
export default function OrderCarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Order Car Service</h1>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Requester Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option>Select department</option>
                <option>Administration</option>
                <option>Faculty</option>
                <option>Maintenance</option>
                <option>Guest Services</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Location</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Building A, Main Entrance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Destination</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Building C, Back Gate"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Number of Passengers</label>
              <input 
                type="number" 
                min="1"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Special Requirements</label>
            <textarea 
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Any special needs or instructions..."
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
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}