import { DailyServiceRequest } from "@/api/dailyServiceHandlers";

interface ManagerDailyRequestsTableProps {
  requests: DailyServiceRequest[];
  onRowClick: (request: DailyServiceRequest) => void;
}

export default function ManagerDailyRequestsTable({ 
  requests,
  onRowClick 
}: ManagerDailyRequestsTableProps) {
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claimant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map(req => (
            <tr
              key={req.id}
              onClick={() => onRowClick(req)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(req.dateTime).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{req.claimantName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{req.startingPlace}</td>
              <td className="px-6 py-4 whitespace-nowrap">{req.endingPlace}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  req.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {req.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}