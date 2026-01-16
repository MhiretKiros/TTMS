"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiX,
  FiArrowLeft,
  FiCalendar,
  FiTruck,
  FiUser,
  FiBarChart2,
  FiDroplet,
} from "react-icons/fi";
import { TbGasStation } from "react-icons/tb";
import {
  fetchAllAttendanceRecordsAPI,
  FrontendAttendanceEntry,
} from "../components/carAttendanceApi";

type AttendanceEntryWithRemarks = FrontendAttendanceEntry & {
  remarks?: string;
};

export default function AllAttendanceRecordsPage() {
  const [allRecords, setAllRecords] = useState<AttendanceEntryWithRemarks[]>(
    []
  );
  const [filteredRecords, setFilteredRecords] = useState<
    AttendanceEntryWithRemarks[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const [selectedRecordModal, setSelectedRecordModal] =
    useState<AttendanceEntryWithRemarks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const records = await fetchAllAttendanceRecordsAPI();
        const mappedRecords = records.map((rec: any) => ({
          ...rec,
          kmAtFueling: rec.kmAtFueling ?? rec.km_at_fueling,
        }));
        setAllRecords(mappedRecords);
        setFilteredRecords(mappedRecords);
      } catch (err: any) {
        setError(err.message || "Failed to load attendance records.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(allRecords);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      setFilteredRecords(
        allRecords.filter(
          (record) =>
            record.plateNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
            record.driverName.toLowerCase().includes(lowerCaseSearchTerm) ||
            record.carType.toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#3c8dbc] rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <FiTruck className="text-[#3c8dbc] text-lg" />
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-600">
          Loading attendance records...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h1 className="text-lg font-bold text-red-700 mb-1">
            Error Loading Data
          </h1>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm flex items-center"
          >
            <FiArrowLeft className="mr-1" size={14} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#2c6b9c] transition-colors shadow-sm"
              >
                <FiArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Car Attendance Records
                </h1>
                <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                  <FiCalendar className="text-[#3c8dbc]" size={12} />
                  Total Records:{" "}
                  <span className="font-semibold text-[#3c8dbc]">
                    {filteredRecords.length}
                  </span>
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full sm:w-64">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="px-3 py-2 w-full text-sm rounded-l border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]"
                />
                <button
                  onClick={handleSearch}
                  className="px-3 py-2 bg-[#3c8dbc] text-white rounded-r hover:bg-[#2c6b9c] transition-colors flex items-center text-sm"
                >
                  <FiSearch size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats Cards */}
        {filteredRecords.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="bg-white rounded p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Total Cars
                  </p>
                  <p className="text-base font-bold text-[#3c8dbc]">
                    {new Set(filteredRecords.map((r) => r.plateNumber)).size}
                  </p>
                </div>
                <FiTruck className="text-[#3c8dbc] opacity-70" size={16} />
              </div>
            </div>

            <div className="bg-white rounded p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Total Drivers
                  </p>
                  <p className="text-base font-bold text-green-600">
                    {new Set(filteredRecords.map((r) => r.driverName)).size}
                  </p>
                </div>
                <FiUser className="text-green-600 opacity-70" size={16} />
              </div>
            </div>

            <div className="bg-white rounded p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Avg Daily KM
                  </p>
                  <p className="text-base font-bold text-orange-600">
                    {Math.round(
                      filteredRecords.reduce(
                        (sum, r) => sum + (r.kmDifference || 0),
                        0
                      ) / filteredRecords.length
                    )}
                  </p>
                </div>
                <FiBarChart2 className="text-orange-600 opacity-70" size={16} />
              </div>
            </div>

            <div className="bg-white rounded p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Fuel Records
                  </p>
                  <p className="text-base font-bold text-purple-600">
                    {filteredRecords.filter((r) => r.fuelLitersAdded).length}
                  </p>
                </div>
                <FiDroplet className="text-purple-600 opacity-70" size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Compact Records Table */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <div className="max-w-xs mx-auto">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#3c8dbc] rounded-full flex items-center justify-center">
                <FiTruck className="text-white" size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">
                No Records Found
              </h3>
              <p className="text-gray-500 text-xs mb-4">
                {searchTerm
                  ? `No records matching "${searchTerm}"`
                  : "No attendance records available"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilteredRecords(allRecords);
                  }}
                  className="px-3 py-1 bg-[#3c8dbc] text-white text-xs rounded hover:bg-[#2c6b9c] transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: "#3c8dbc" }}>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiTruck size={12} />
                        Plate
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiUser size={12} />
                        Driver
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiCalendar size={12} />
                        Date
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      AM KM
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      PM KM
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      Daily
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      Overnight
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiDroplet size={12} />
                        Fuel (L)
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <TbGasStation size={12} />
                        KM Fuel
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      KM/L
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((record, idx) => (
                    <tr
                      key={record.id}
                      className={`cursor-pointer hover:bg-blue-50/50 transition-colors text-sm ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                      onClick={() => setSelectedRecordModal(record)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {record.plateNumber}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-medium text-xs">
                        {record.carType}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900 font-medium">
                          {record.driverName}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          {new Date(
                            record.date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-mono text-xs">
                        {record.morningKm ?? "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-mono text-xs">
                        {record.nightKm ?? "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div
                          className={`text-xs font-bold font-mono ${
                            (record.kmDifference || 0) > 100
                              ? "text-green-600"
                              : "text-gray-900"
                          }`}
                        >
                          {record.kmDifference ?? "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-mono text-xs">
                        {record.overnightKmDifference ?? "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {record.fuelLitersAdded ? (
                          <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 rounded text-xs">
                            <FiDroplet className="text-blue-500" size={10} />
                            <span className="font-bold text-blue-700">
                              {record.fuelLitersAdded}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-mono text-xs">
                        {record.kmAtFueling ?? "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {record.kmPerLiter && record.kmPerLiter !== 0 ? (
                          <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 rounded text-xs">
                            <span className="font-bold text-green-700">
                              {record.kmPerLiter.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600 text-xs max-w-[100px] truncate">
                        {record.remarks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compact Modal */}
        {selectedRecordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
              <div style={{ backgroundColor: "#3c8dbc" }} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Record Details
                    </h2>
                    <p className="text-blue-100 text-xs mt-0.5">
                      {selectedRecordModal.plateNumber} •{" "}
                      {selectedRecordModal.carType}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRecordModal(null)}
                    className="text-white hover:text-blue-200 transition-colors p-1"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded p-2 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">
                        Plate Number
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRecordModal.plateNumber}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">
                        Car Type
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRecordModal.carType}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">
                        Driver Name
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedRecordModal.driverName}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">
                        Date
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(
                          selectedRecordModal.date + "T00:00:00"
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                      Kilometer Readings
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          Morning KM
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedRecordModal.morningKm ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          Evening KM
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedRecordModal.nightKm ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          Daily Difference
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedRecordModal.kmDifference ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          Overnight Difference
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedRecordModal.overnightKmDifference ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedRecordModal.fuelLitersAdded && (
                    <div className="bg-gray-50 rounded p-3 border border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                        Fuel Information
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Fuel Added (L)
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedRecordModal.fuelLitersAdded}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            KM at Fueling
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedRecordModal.kmAtFueling ?? "—"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Fuel Efficiency
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedRecordModal.kmPerLiter
                              ? `${selectedRecordModal.kmPerLiter.toFixed(
                                  1
                                )} KM/L`
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRecordModal.remarks && (
                    <div className="bg-gray-50 rounded p-3 border border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                        Remarks
                      </h3>
                      <p className="text-sm text-gray-800">
                        {selectedRecordModal.remarks}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedRecordModal(null)}
                    className="w-full px-4 py-2 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#2c6b9c] transition-colors font-medium"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
