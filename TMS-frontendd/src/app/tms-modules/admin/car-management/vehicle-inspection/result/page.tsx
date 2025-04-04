'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type InspectionItem = {
  label: string;
  passed: boolean;
  severity?: 'low' | 'medium' | 'high' | 'none';
  notes?: string;
};

type InspectionResult = {
  plateNumber: string | null;
  status: 'Approved' | 'Rejected' | 'ConditionallyApproved' | null;
  bodyScore: number | null;
  interiorScore: number | null;
  inspectorName: string | null;
  notes: string | null;
  mechanicalPass: boolean;
  bodyPass: boolean;
  interiorPass: boolean;
  mechanicalItems: InspectionItem[];
  bodyItems: InspectionItem[];
  interiorItems: InspectionItem[];
  warningMessage?: string | null;
  warningDeadline?: string | null;
  inspectionDate?: string | null;
};

export default function CarInspectionResultPage() {
  const searchParams = useSearchParams();
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseItems = (itemsString: string | null): InspectionItem[] => {
      if (!itemsString) return [];
      try {
        // First try decoding the URI component
        const decoded = decodeURIComponent(itemsString);
        // Then parse the JSON
        const parsed = JSON.parse(decoded);
        // Validate the parsed data is an array
        if (!Array.isArray(parsed)) return [];
        // Validate each item has required fields
        return parsed.filter(item => 
          item && typeof item.label === 'string' && typeof item.passed === 'boolean'
        );
      } catch (error) {
        console.error('Failed to parse items:', error);
        return [];
      }
    };

    const loadInspectionData = () => {
      try {
        const plateNumber = searchParams.get('plateNumber');
        
        if (!plateNumber) {
          setError('Plate number is required to view inspection results.');
          setIsLoading(false);
          return;
        }

        // Parse all the basic fields
        const statusParam = searchParams.get('overallStatus');
        const status = statusParam === 'Approved' || statusParam === 'Rejected' || statusParam === 'ConditionallyApproved'
          ? statusParam 
          : null;

        const bodyScore = searchParams.get('bodyScore');
        const interiorScore = searchParams.get('interiorScore');
        const inspectorName = searchParams.get('inspectorName');
        const notes = searchParams.get('notes');
        const mechanicalPass = searchParams.get('mechanicalPass') === 'true';
        const bodyPass = searchParams.get('bodyPass') === 'true';
        const interiorPass = searchParams.get('interiorPass') === 'true';
        const warningMessage = searchParams.get('warningMessage');
        const warningDeadline = searchParams.get('warningDeadline');
        const inspectionDate = searchParams.get('inspectionDate');
        
        // Parse the detailed inspection items with validation
        const mechanicalItems = parseItems(searchParams.get('mechanicalItems'));
        const bodyItems = parseItems(searchParams.get('bodyItems'));
        const interiorItems = parseItems(searchParams.get('interiorItems'));

        // Create the inspection result object
        const result: InspectionResult = {
          plateNumber,
          status,
          bodyScore: bodyScore ? parseInt(bodyScore) : null,
          interiorScore: interiorScore ? parseInt(interiorScore) : null,
          inspectorName,
          notes,
          mechanicalPass,
          bodyPass,
          interiorPass,
          mechanicalItems,
          bodyItems,
          interiorItems,
          warningMessage,
          warningDeadline,
          inspectionDate: inspectionDate || new Date().toISOString()
        };

        // Check if we have at least some data to display
        const hasBasicData = plateNumber || inspectorName || notes || warningMessage;
        const hasInspectionData = mechanicalItems.length > 0 || bodyItems.length > 0 || interiorItems.length > 0;
        
        if (!hasBasicData && !hasInspectionData) {
          setError('No valid inspection data found in the URL parameters.');
          setIsLoading(false);
          return;
        }

        setInspectionResult(result);
      } catch (err) {
        console.error('Error loading inspection data:', err);
        setError('An unexpected error occurred while loading inspection data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInspectionData();
  }, [searchParams]);



  const renderInspectionSection = (items: InspectionItem[], title: string, overallPass: boolean, score: number | null) => {
    const passedCount = items.filter(item => item.passed).length;
    const totalCount = items.length;
    const passPercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              overallPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {overallPass ? 'Passed' : 'Failed'}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {score !== null ? `${score}%` : `${passPercentage}%`}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                passPercentage >= 90 ? 'bg-green-500' : 
                passPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${passPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              item.passed ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              {!item.passed && item.severity && item.severity !== 'none' && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Severity:</span> 
                  <span className={`ml-2 capitalize ${
                    item.severity === 'high' ? 'text-red-600' :
                    item.severity === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {item.severity}
                  </span>
                </div>
              )}
              {item.notes && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Notes:</span> 
                  <span className="ml-2 text-gray-700">{item.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getServiceQualification = () => {
    if (!inspectionResult) return null;
    
    if (inspectionResult.status === 'Approved') {
      return {
        qualified: true,
        message: 'This vehicle is fully qualified for service with no issues found.',
        icon: '✅',
        color: 'green'
      };
    } else if (inspectionResult.status === 'ConditionallyApproved') {
      return {
        qualified: true,
        message: 'This vehicle is conditionally approved for service with some issues that need attention.',
        icon: '⚠️',
        color: 'yellow'
      };
    } else {
      return {
        qualified: false,
        message: 'This vehicle is NOT qualified for service due to critical issues.',
        icon: '❌',
        color: 'red'
      };
    }
  };

  const serviceQualification = getServiceQualification();

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading inspection</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!inspectionResult) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No inspection data found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please check the vehicle plate number and try again.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-teal-600 px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">Vehicle Inspection Report</h1>
              <div className="mt-2 flex items-center">
                <span className="text-teal-100">Plate Number:</span>
                <span className="ml-2 text-white font-medium">{inspectionResult.plateNumber}</span>
              </div>
            </div>
            <div className="text-teal-100 text-sm">
              Inspected on: {new Date(inspectionResult.inspectionDate || '').toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="p-6">
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            serviceQualification.color === 'green' ? 'border-green-500 bg-green-50' :
            serviceQualification.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
            'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 text-xl mr-3">
                {serviceQualification.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold ${
                  serviceQualification.color === 'green' ? 'text-green-800' :
                  serviceQualification.color === 'yellow' ? 'text-yellow-800' :
                  'text-red-800'
                }">
                  {serviceQualification.message}
                </h3>
                {inspectionResult.warningMessage && (
                  <div className="mt-2">
                    <p className="text-sm ${
                      serviceQualification.color === 'green' ? 'text-green-700' :
                      serviceQualification.color === 'yellow' ? 'text-yellow-700' :
                      'text-red-700'
                    }">
                      <span className="font-medium">Warning:</span> {inspectionResult.warningMessage}
                    </p>
                    {inspectionResult.warningDeadline && (
                      <p className="text-sm ${
                        serviceQualification.color === 'green' ? 'text-green-700' :
                        serviceQualification.color === 'yellow' ? 'text-yellow-700' :
                        'text-red-700'
                      }">
                        <span className="font-medium">Deadline:</span> {new Date(inspectionResult.warningDeadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inspection Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Inspection Overview</h3>
              <DetailItem label="Inspection Date" value={
                inspectionResult.inspectionDate ? 
                new Date(inspectionResult.inspectionDate).toLocaleDateString() : 
                'N/A'
              } />
              <DetailItem label="Inspector Name" value={inspectionResult.inspectorName || 'N/A'} />
              <DetailItem 
                label="Overall Status" 
                value={inspectionResult.status || 'N/A'} 
                highlight={inspectionResult.status === 'Approved' ? 'green' : 
                          inspectionResult.status === 'ConditionallyApproved' ? 'yellow' : 'red'}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Scores Summary</h3>
              <DetailItem 
                label="Mechanical Pass" 
                value={inspectionResult.mechanicalPass ? 'Passed' : 'Failed'} 
                highlight={inspectionResult.mechanicalPass ? 'green' : 'red'}
              />
              <DetailItem 
                label="Body Inspection" 
                value={`${inspectionResult.bodyScore ?? 0}%`} 
                highlight={
                  (inspectionResult.bodyScore || 0) >= 90 ? 'green' : 
                  (inspectionResult.bodyScore || 0) >= 70 ? 'yellow' : 'red'
                }
              />
              <DetailItem 
                label="Interior Inspection" 
                value={`${inspectionResult.interiorScore ?? 0}%`} 
                highlight={
                  (inspectionResult.interiorScore || 0) >= 90 ? 'green' : 
                  (inspectionResult.interiorScore || 0) >= 70 ? 'yellow' : 'red'
                }
              />
            </div>
          </div>

          {/* Notes Section */}
          {inspectionResult.notes && (
            <div className="mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-lg mb-2 text-blue-800">Inspector Notes</h3>
              <p className="text-gray-700 whitespace-pre-line">{inspectionResult.notes}</p>
            </div>
          )}

          {/* Detailed Inspection Sections */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Detailed Inspection Results</h2>
            
            {renderInspectionSection(
              inspectionResult.mechanicalItems,
              'Mechanical Inspection',
              inspectionResult.mechanicalPass,
              null // Using calculated percentage for mechanical
            )}
            
            {renderInspectionSection(
              inspectionResult.bodyItems,
              'Body Condition Inspection',
              inspectionResult.bodyPass,
              inspectionResult.bodyScore
            )}
            
            {renderInspectionSection(
              inspectionResult.interiorItems,
              'Interior Inspection',
              inspectionResult.interiorPass,
              inspectionResult.interiorScore
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 text-center text-sm text-gray-600">
          <p>Report generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ 
  label, 
  value, 
  highlight 
}: { 
  label: string; 
  value: string | number | null; 
  highlight?: 'green' | 'yellow' | 'red' 
}) {
  const highlightClass = highlight === 'green' ? 'text-green-600' :
                       highlight === 'yellow' ? 'text-yellow-600' :
                       highlight === 'red' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className={`font-medium ${highlightClass}`}>
        {value !== null ? value : 'N/A'}
      </span>
    </div>
  );
}