// src/app/tms-modules/admin/car-management/vehicle-inspection/result/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

// Define the structure for a single inspection item
type InspectionItem = {
  label: string;
  passed: boolean;
  severity?: 'low' | 'medium' | 'high' | 'none';
  notes?: string;
};

// Define the structure for the overall inspection result data
type InspectionResult = {
  plateNumber: string | null;
  status: 'Approved' | 'Rejected' | 'ConditionallyApproved' | null;
  bodyScore: number | null;
  interiorScore: number | null;
  inspectorName: string | null;
  notes: string | null;
  mechanicalPass: boolean; // Parsed boolean
  bodyPass: boolean;       // Parsed boolean
  interiorPass: boolean;   // Parsed boolean
  mechanicalItems: InspectionItem[];
  bodyItems: InspectionItem[];
  interiorItems: InspectionItem[];
  warningMessage?: string | null;
  warningDeadline?: string | null;
  inspectionDate?: string | null; // Date of inspection
};

export default function CarInspectionResultPage() {
  const searchParams = useSearchParams();
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Helper function to parse JSON string array of items from URL param
    const parseItems = (itemsString: string | null): InspectionItem[] => {
      // Add console log to see the raw string before parsing
      console.log(`Parsing items string for ${itemsString ? itemsString.substring(0, 50) : 'null'}...:`, itemsString);
      if (!itemsString) return [];
      try {
        const decoded = decodeURIComponent(itemsString);
        console.log("Decoded items string:", decoded); // Log decoded string
        const parsed = JSON.parse(decoded);
        if (!Array.isArray(parsed)) {
          console.warn('Parsed items is not an array:', parsed);
          return [];
        }
        // Validate each item in the array
        const validatedItems = parsed.map(item => {
          if (item && typeof item.label === 'string' && typeof item.passed === 'boolean') {
            return {
              label: item.label,
              passed: item.passed,
              severity: ['low', 'medium', 'high', 'none'].includes(item.severity) ? item.severity : undefined,
              notes: typeof item.notes === 'string' ? item.notes : undefined,
            };
          }
          console.warn("Invalid item structure found:", item); // Log invalid items
          return null; // Mark invalid items as null
        }).filter((item): item is InspectionItem => item !== null); // Filter out nulls

        console.log("Validated items array:", validatedItems); // Log the final array
        return validatedItems;
      } catch (error) {
        console.error('Failed to parse items:', itemsString, error);
        return []; // Return empty array on error
      }
    };

    // Function to load and parse all data from URL parameters
    const loadInspectionData = () => {
      try {
        const plateNumber = searchParams.get('plateNumber');

        if (!plateNumber) {
          setError('Plate number is required to view inspection results.');
          setIsLoading(false);
          return;
        }

        const statusParam = searchParams.get('inspectionStatus');
        const status = statusParam === 'Approved' || statusParam === 'Rejected' || statusParam === 'ConditionallyApproved'
          ? statusParam
          : null;

        const bodyScore = searchParams.get('bodyScore');
        const interiorScore = searchParams.get('interiorScore');
        const inspectorName = searchParams.get('inspectorName');
        const notes = searchParams.get('notes');

        // Parse boolean pass statuses correctly ('true'/'false' string to boolean)
        const mechanicalPass = searchParams.get('mechanicalPass') === 'true';
        const bodyPass = searchParams.get('bodyPass') === 'true';
        const interiorPass = searchParams.get('interiorPass') === 'true';
        // Log the raw values from URL and the parsed booleans
        console.log("Raw URL mechanicalPass:", searchParams.get('mechanicalPass'), "Parsed:", mechanicalPass);
        console.log("Raw URL bodyPass:", searchParams.get('bodyPass'), "Parsed:", bodyPass);
        console.log("Raw URL interiorPass:", searchParams.get('interiorPass'), "Parsed:", interiorPass);


        const warningMessage = searchParams.get('warningMessage');
        const warningDeadline = searchParams.get('warningDeadline');
        const inspectionDate = searchParams.get('inspectionDate');

        // Parse the detailed inspection items using the helper
        const mechanicalItems = parseItems(searchParams.get('mechanicalItems'));
        const bodyItems = parseItems(searchParams.get('bodyItems'));
        const interiorItems = parseItems(searchParams.get('interiorItems'));

        // Construct the final result object
        const result: InspectionResult = {
          plateNumber,
          status,
          bodyScore: bodyScore ? parseInt(bodyScore) : null,
          interiorScore: interiorScore ? parseInt(interiorScore) : null,
          inspectorName,
          notes,
          mechanicalPass, // Use parsed boolean
          bodyPass,       // Use parsed boolean
          interiorPass,   // Use parsed boolean
          mechanicalItems,
          bodyItems,
          interiorItems,
          warningMessage,
          warningDeadline,
          inspectionDate: inspectionDate || new Date().toISOString() // Use passed date or fallback
        };

        // Basic validation: Check if we received *any* meaningful data
        const hasBasicData = plateNumber || inspectorName || notes || warningMessage;
        const hasInspectionData = mechanicalItems.length > 0 || bodyItems.length > 0 || interiorItems.length > 0;
        const hasPassStatus = searchParams.has('mechanicalPass') || searchParams.has('bodyPass') || searchParams.has('interiorPass');

        if (!hasBasicData && !hasInspectionData && !hasPassStatus) {
             console.warn("No basic, inspection items, or pass status data found after parsing.");
             setError('No valid inspection data found in the URL parameters.');
             setIsLoading(false);
             return;
        }

        console.log("Final Inspection Result Object:", result);
        setInspectionResult(result);
      } catch (err) {
        console.error('Error loading inspection data:', err);
        setError('An unexpected error occurred while loading inspection data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInspectionData();
  }, [searchParams]); // Re-run effect if searchParams change


  // Function to render a detailed inspection section (Mechanical, Body, Interior)
  const renderInspectionSection = (items: InspectionItem[], title: string, overallPass: boolean, score: number | null) => {
    // Determine the percentage to display: use score if available (Body/Interior)
    // For Mechanical (score is null), we won't display a percentage score badge.
    const displayPercentage = score !== null ? score : null; // Only use score if provided

    // Log values specific to this section render
    console.log(`Rendering Section: ${title}, Overall Pass: ${overallPass}, Score: ${score}, Items Count: ${items.length}`);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        {/* Section Header with Title and Overall Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">{title}</h3>
          <div className="flex items-center gap-3">
            {/* Overall Pass/Fail Badge based on the boolean prop */}
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              overallPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {overallPass ? <FiCheckCircle className="h-4 w-4" /> : <FiXCircle className="h-4 w-4" />}
              {overallPass ? 'Passed' : 'Failed'}
            </span>
            {/* Display Score Badge ONLY if displayPercentage is not null (i.e., for Body/Interior) */}
            {displayPercentage !== null && (
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {displayPercentage}% Score
              </span>
            )}
          </div>
        </div>

        {/* Optional Progress Bar (Only for sections with a score) */}
        {displayPercentage !== null && ( // Check if score exists
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  displayPercentage >= 80 ? 'bg-green-500' :
                  displayPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${displayPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Detailed Items List */}
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className={`p-2 rounded border ${
                item.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  {item.passed ? (
                     <FiCheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                     <FiXCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                {/* Display severity and notes if item failed */}
                {!item.passed && item.severity && item.severity !== 'none' && (
                  <div className="mt-1 pl-1 text-xs">
                    <span className="font-medium text-gray-500">Severity:</span>
                    <span className={`ml-1 capitalize font-semibold ${
                      item.severity === 'high' ? 'text-red-600' :
                      item.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                )}
                {item.notes && (
                  <div className="mt-1 pl-1 text-xs text-gray-500">
                    <span className="font-medium">Notes:</span>
                    <span className="ml-1 italic">"{item.notes}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Message if no detailed items were recorded for this section
          <div className="text-center py-4 text-sm text-gray-500 italic">
            No detailed checklist items were recorded for this section.
          </div>
        )}
      </div>
    );
  };


  // Determine service qualification based on overall status
  const getServiceQualification = () => {
      if (!inspectionResult) return null;
      if (inspectionResult.status === 'Approved') return { qualified: true, message: 'This vehicle is fully qualified for service.', icon: <FiCheckCircle className="text-green-500 h-6 w-6"/>, color: 'green' };
      if (inspectionResult.status === 'ConditionallyApproved') return { qualified: true, message: 'This vehicle is conditionally approved for service.', icon: <FiAlertTriangle className="text-yellow-500 h-6 w-6"/>, color: 'yellow' };
      return { qualified: false, message: 'This vehicle is NOT qualified for service.', icon: <FiXCircle className="text-red-500 h-6 w-6"/>, color: 'red' };
  };
  const serviceQualification = getServiceQualification();

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 text-red-700 p-4">
        <FiAlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
        <p>{error}</p>
        {/* Optional: Add a button to go back or retry */}
      </div>
    );
  }

  // --- Render No Result State ---
  if (!inspectionResult) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-gray-600 p-4">
        <FiInfo className="h-12 w-12 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">No Inspection Data</h2>
        <p>Could not retrieve inspection results for the specified vehicle.</p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
             <div className="flex flex-col sm:flex-row justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white">Vehicle Inspection Report</h1>
                <div className="mt-2 flex items-center">
                  <span className="text-purple-100">Plate Number:</span>
                  <span className="ml-2 text-white font-semibold text-lg">{inspectionResult.plateNumber}</span>
                </div>
              </div>
              <div className="text-purple-100 text-sm mt-2 sm:mt-0">
                Inspected on: {new Date(inspectionResult.inspectionDate || '').toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-6">
            {/* Service Qualification Banner */}
            {serviceQualification && (
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                serviceQualification.color === 'green' ? 'border-green-500 bg-green-50' :
                serviceQualification.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-2xl mr-3">{serviceQualification.icon}</div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      serviceQualification.color === 'green' ? 'text-green-800' :
                      serviceQualification.color === 'yellow' ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>
                      {serviceQualification.message}
                    </h3>
                    {/* Display Warning Message and Deadline if present */}
                    {inspectionResult.warningMessage && (
                      <div className="mt-2 text-sm">
                        <p className={`${
                          serviceQualification.color === 'green' ? 'text-green-700' :
                          serviceQualification.color === 'yellow' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          <span className="font-medium">Warning:</span> {inspectionResult.warningMessage}
                        </p>
                        {inspectionResult.warningDeadline && (
                          <p className={`${
                            serviceQualification.color === 'green' ? 'text-green-700' :
                            serviceQualification.color === 'yellow' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            <span className="font-medium">Deadline:</span> {new Date(inspectionResult.warningDeadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Overview Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               {/* Inspection Overview Card */}
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <h3 className="font-semibold text-lg mb-3 text-gray-800">Inspection Overview</h3>
                 <DetailItem label="Inspection Date" value={ inspectionResult.inspectionDate ? new Date(inspectionResult.inspectionDate).toLocaleDateString() : 'N/A' } />
                 <DetailItem label="Inspector Name" value={inspectionResult.inspectorName || 'N/A'} />
                 <DetailItem
                   label="Overall Status"
                   value={inspectionResult.status || 'N/A'}
                   highlight={inspectionResult.status === 'Approved' ? 'green' : inspectionResult.status === 'ConditionallyApproved' ? 'yellow' : 'red'}
                 />
               </div>

              {/* Scores & Pass Status Card */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <h3 className="font-semibold text-lg mb-3 text-gray-800">Scores & Pass Status</h3>
                 <DetailItem
                   label="Mechanical"
                   value={inspectionResult.mechanicalPass ? 'Passed' : 'Failed'}
                   highlight={inspectionResult.mechanicalPass ? 'green' : 'red'}
                 />
                 <DetailItem
                   label="Body Score"
                   value={`${inspectionResult.bodyScore ?? 'N/A'}%`}
                   highlight={ inspectionResult.bodyScore === null ? undefined : inspectionResult.bodyScore >= 80 ? 'green' : inspectionResult.bodyScore >= 60 ? 'yellow' : 'red' }
                 />
                 <DetailItem
                   label="Interior Score"
                   value={`${inspectionResult.interiorScore ?? 'N/A'}%`}
                   highlight={ inspectionResult.interiorScore === null ? undefined : inspectionResult.interiorScore >= 90 ? 'green' : inspectionResult.interiorScore >= 75 ? 'yellow' : 'red' }
                 />
              </div>
            </div>

            {/* Inspector Notes Section */}
            {inspectionResult.notes && (
              <div className="mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-2">
                   <FiInfo className="h-5 w-5 text-blue-600 mr-2"/>
                   <h3 className="font-semibold text-lg text-blue-800">Inspector Notes</h3>
                </div>
                <p className="text-gray-700 whitespace-pre-line text-sm">{inspectionResult.notes}</p>
              </div>
            )}

            {/* Detailed Inspection Sections */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Detailed Inspection Results</h2>
              {/* Render each section using the helper function */}
              {renderInspectionSection(inspectionResult.mechanicalItems, 'Mechanical Inspection', inspectionResult.mechanicalPass, null)}
              {renderInspectionSection(inspectionResult.bodyItems, 'Body Condition Inspection', inspectionResult.bodyPass, inspectionResult.bodyScore)}
              {renderInspectionSection(inspectionResult.interiorItems, 'Interior Inspection', inspectionResult.interiorPass, inspectionResult.interiorScore)}
            </div>
          </div>

          {/* Report Footer */}
          <div className="bg-gray-100 px-6 py-4 text-center text-sm text-gray-600 border-t border-gray-200">
             <p>Report generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- DetailItem Component (for overview cards) ---
function DetailItem({ label, value, highlight }: {
    label: string;
    value: string | number | null | undefined;
    highlight?: 'green' | 'yellow' | 'red';
}) {
  const highlightClass = highlight === 'green' ? 'text-green-600' :
                       highlight === 'yellow' ? 'text-yellow-600' :
                       highlight === 'red' ? 'text-red-600' : 'text-gray-700'; // Default color

  return (
    <div className="flex justify-between py-1.5 border-b border-gray-200 last:border-0">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className={`text-sm font-medium ${highlightClass}`}>
        {value !== null && value !== undefined ? value : 'N/A'}
      </span>
    </div>
  );
}
