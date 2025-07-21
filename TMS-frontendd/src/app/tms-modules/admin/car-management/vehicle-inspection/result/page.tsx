// src/app/tms-modules/admin/car-management/vehicle-inspection/result/page.tsx
'use client';

import { useRef } from 'react'; // Added useRef
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiLoader, FiCalendar, FiUser, FiClipboard, FiPercent, FiPrinter } from 'react-icons/fi'; // Added FiPrinter
import { useReactToPrint } from 'react-to-print';
import toast, { Toaster } from 'react-hot-toast';

enum InspectionStatus {
    Approved = 'Approved',
    Rejected = 'Rejected',
    ConditionallyApproved = 'ConditionallyApproved',
}

enum ServiceStatus {
    Ready = 'Ready',
    ReadyWithWarning = 'ReadyWithWarning',
    NotReady = 'NotReady',
}

enum SeverityLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    NONE = 'NONE',
}

type ItemCondition = {
    problem: boolean;
    severity: SeverityLevel;
    notes: string;
};

type MechanicalInspectionData = {
    engineCondition: boolean;
    enginePower: boolean;
    suspension: boolean;
    brakes: boolean;
    steering: boolean;
    gearbox: boolean;
    mileage: boolean;
    fuelGauge: boolean;
    tempGauge: boolean;
    oilGauge: boolean;
};

type BodyInspectionData = {
    bodyCollision: ItemCondition;
    bodyScratches: ItemCondition;
    paintCondition: ItemCondition;
    breakages: ItemCondition;
    cracks: ItemCondition;
};

type InteriorInspectionData = {
    engineExhaust: ItemCondition;
    seatComfort: ItemCondition;
    seatFabric: ItemCondition;
    floorMat: ItemCondition;
    rearViewMirror: ItemCondition;
    carTab: ItemCondition;
    mirrorAdjustment: ItemCondition;
    doorLock: ItemCondition;
    ventilationSystem: ItemCondition;
    dashboardDecoration: ItemCondition;
    seatBelt: ItemCondition;
    sunshade: ItemCondition;
    windowCurtain: ItemCondition;
    interiorRoof: ItemCondition;
    carIgnition: ItemCondition;
    fuelConsumption: ItemCondition;
    headlights: ItemCondition;
    rainWiper: ItemCondition;
    turnSignalLight: ItemCondition;
    brakeLight: ItemCondition;
    licensePlateLight: ItemCondition;
    clock: ItemCondition;
    rpm: ItemCondition;
    batteryStatus: ItemCondition;
    chargingIndicator: ItemCondition;
};

type InspectionResultData = {
    id: number;
    plateNumber: string;
    inspectionStatus: InspectionStatus;
    serviceStatus: ServiceStatus;
    bodyScore: number;
    interiorScore: number;
    inspectorName: string;
    notes: string | null;
    inspectionDate: string;
    mechanical: MechanicalInspectionData;
    body: BodyInspectionData;
    interior: InteriorInspectionData;
    warningMessage?: string | null;
    warningDeadline?: string | null;
    rejectionReason?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const formatLabel = (key: string): string => {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};

const isValidToken = (token: string | null): boolean => {
    if (!token) return false;
    if (token.includes('your_generated_token_here')) return false;
    return token.split('.').length === 3;
};

// --- DetailItem Component ---
function DetailItem({ label, value, highlight, icon }: {
    label: string;
    value: string | number | null | undefined;
    highlight?: 'green' | 'yellow' | 'red';
    icon?: React.ReactNode;
})
{
    const highlightClass = highlight === 'green' ? 'text-green-600' :
        highlight === 'yellow' ? 'text-yellow-600' :
        highlight === 'red' ? 'text-red-600' : 'text-gray-700';

     return (
        <div className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-0">
            <span className="text-sm text-gray-600 flex items-center gap-2">
                {icon && <span className="text-gray-400">{icon}</span>}
                {label}:
            </span>
            <span className={`text-sm font-medium ${highlightClass}`}>
                {value !== null && value !== undefined ? value : 'N/A'}
            </span>
        </div>
    );
}

export default function CarInspectionResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [inspectionResult, setInspectionResult] = useState<InspectionResultData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const inspectionId = searchParams.get('inspectionId');
    const componentRef = useRef<HTMLDivElement>(null);

    // const pageStyle = `
    //   @media print {
    //     body {
    //       -webkit-print-color-adjust: exact !important;
    //       color-adjust: exact !important;
    //     }
    //     .no-print {
    //       display: none !important;
    //     }
    //   }
    // `;

    // const handlePrint = useReactToPrint({
    //     content: () => componentRef.current,
    //     documentTitle: `InspectionReport-${inspectionResult?.plateNumber || 'UnknownPlate'}`,
    //     pageStyle: pageStyle,
    // });

    const fetchInspectionDetails = useCallback(async () => {
        if (!inspectionId) {
            toast.error("Inspection ID is missing from the URL.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/inspections/get/${inspectionId}`, {
                method: 'GET',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorMessage = `Request failed with status ${response.status}`;
                const responseClone = response.clone();
                
                try {
                    const errorData = await responseClone.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (jsonError) {
                    const text = await response.text();
                    errorMessage = text || errorMessage;
                }

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('token');
                    errorMessage = "Authentication required. Please log in again.";
                }

                throw new Error(errorMessage);
            }

            const data: InspectionResultData = await response.json();
            setInspectionResult(data);
        } catch (err: any) {
            console.error("Fetch error:", err);
            toast.error(err.message || "Failed to load inspection results.");
        } finally {
            setIsLoading(false);
        }
    }, [inspectionId]);

    useEffect(() => {
        fetchInspectionDetails();
    }, [fetchInspectionDetails]);

    const getSectionPassStatus = useCallback((section: 'mechanical' | 'body' | 'interior'): boolean => {
        if (!inspectionResult) return false;
        if (section === 'mechanical') {
            const mechanicalData = inspectionResult.mechanical;
            if (!mechanicalData) return false;
            return Object.values(mechanicalData).every(check => check === true);
        }
        if (section === 'body' || section === 'interior') {
            return inspectionResult.inspectionStatus === InspectionStatus.Approved ||
                   inspectionResult.inspectionStatus === InspectionStatus.ConditionallyApproved;
        }
        return false;
    }, [inspectionResult]);

    const RenderInspectionSection = useCallback(({
        data, title, sectionType
    }: {
        data: MechanicalInspectionData | BodyInspectionData | InteriorInspectionData | null;
        title: string;
        sectionType: 'mechanical' | 'body' | 'interior';
    }) => {
        if (!inspectionResult || !data) {
            return <div className="text-center py-4 text-sm text-gray-500 italic">Data not available for {title}.</div>;
        }

        const overallPass = getSectionPassStatus(sectionType);
        const score = sectionType === 'body' ? inspectionResult.bodyScore : sectionType === 'interior' ? inspectionResult.interiorScore : null;

        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">{title}</h3>
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            overallPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {overallPass ? <FiCheckCircle className="h-4 w-4" /> : <FiXCircle className="h-4 w-4" />}
                            {overallPass ? 'Passed' : 'Failed'}
                        </span>
                        {score !== null && (
                            <span className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                <FiPercent className="h-3 w-3" /> {score}% Score
                            </span>
                        )}
                    </div>
                </div>

                {score !== null && (
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${
                                    score >= 80 ? 'bg-green-500' :
                                    score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${score}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {Object.entries(data).map(([key, value]) => {
                        const label = formatLabel(key);
                        let passed: boolean;
                        let severity: SeverityLevel | undefined;
                        let notes: string | undefined;

                        if (typeof value === 'boolean') {
                            passed = value;
                        } else if (typeof value === 'object' && value !== null && 'problem' in value) {
                            passed = !value.problem;
                            severity = value.severity;
                            notes = value.notes;
                        } else {
                            return null;
                        }

                        return (
                            <div key={key} className={`p-2 rounded border ${
                                passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                            }`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700">{label}</span>
                                    {passed ? (
                                        <FiCheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <FiXCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    )}
                                </div>
                                {!passed && severity && severity !== SeverityLevel.NONE && (
                                    <div className="mt-1 pl-1 text-xs">
                                        <span className="font-medium text-gray-500">Severity:</span>
                                        <span className={`ml-1 capitalize font-semibold ${
                                            severity === SeverityLevel.HIGH ? 'text-red-600' :
                                            severity === SeverityLevel.MEDIUM ? 'text-orange-600' : 'text-yellow-600'
                                        }`}>
                                            {severity.toLowerCase()}
                                        </span>
                                    </div>
                                )}
                                {notes && notes.trim() && (
                                    <div className="mt-1 pl-1 text-xs text-gray-500">
                                        <span className="font-medium">Notes:</span>
                                        <span className="ml-1 italic">"{notes}"</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }, [inspectionResult, getSectionPassStatus]);

    const getServiceQualification = () => {
        if (!inspectionResult) return null;
        const status = inspectionResult.inspectionStatus;
        if (status === InspectionStatus.Approved) return { qualified: true, message: 'This vehicle is fully qualified for service.', icon: <FiCheckCircle className="text-green-500 h-6 w-6" />, color: 'green' };
        if (status === InspectionStatus.ConditionallyApproved) return { qualified: true, message: 'This vehicle is conditionally approved for service.', icon: <FiAlertTriangle className="text-yellow-500 h-6 w-6" />, color: 'yellow' };
        if (status === InspectionStatus.Rejected) return { qualified: false, message: 'This vehicle is NOT qualified for service.', icon: <FiXCircle className="text-red-500 h-6 w-6" />, color: 'red' };
        return null;
    };

    const serviceQualification = getServiceQualification();

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
                <FiLoader className="animate-spin text-blue-500 h-12 w-12 mb-4" />
                <p className="text-gray-600">Loading inspection results...</p>
            </div>
        );
    }

    if (!inspectionResult) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-gray-600 p-4">
                <FiInfo className="h-12 w-12 mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">No Inspection Data Found</h2>
                <p>Could not retrieve or display inspection results for the specified ID.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <Toaster position="top-center" />
            <div className="container max-w-5xl mx-auto px-4" >
<div className="flex justify-end mb-4">
                    {/* <button
                        onClick={handlePrint}
                        className="no-print px-3 py-1.5 bg-white text-blue-600 rounded-md shadow hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                    >
                        <FiPrinter className="h-4 w-4" />
                        Print to PDF
                    </button> */}
                </div>
                <div className="bg-white rounded-lg shadow-xl overflow-hidden" ref={componentRef}>
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Vehicle Inspection Report</h1>
                                <div className="mt-2 flex items-center">
                                    <span className="text-purple-100">Plate Number:</span>
                                    <span className="ml-2 text-white font-semibold text-lg font-mono">{inspectionResult?.plateNumber}</span>
                                </div>
                            </div>
                            
                            <div className="text-purple-100 text-sm mt-2 sm:mt-0 flex items-center gap-1">
                                <FiCalendar className="h-4 w-4" />
                                <span>Inspected on: {new Date(inspectionResult.inspectionDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
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
                                        {inspectionResult.inspectionStatus === InspectionStatus.Rejected && inspectionResult.rejectionReason && (
                                            <p className="mt-1 text-sm text-red-700">
                                                <span className="font-medium">Reason:</span> {inspectionResult.rejectionReason}
                                            </p>
                                        )}
                                        {inspectionResult.warningMessage && (
                                            <div className="mt-2 text-sm">
                                                <p className="text-yellow-700">
                                                    <span className="font-medium">Warning:</span> {inspectionResult.warningMessage}
                                                </p>
                                                {inspectionResult.warningDeadline && (
                                                    <p className="text-yellow-700">
                                                        <span className="font-medium">Deadline:</span> {new Date(inspectionResult.warningDeadline).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><FiClipboard /> Inspection Overview</h3>
                                <DetailItem icon={<FiCalendar />} label="Inspection Date" value={new Date(inspectionResult.inspectionDate).toLocaleDateString()} />
                                <DetailItem icon={<FiUser />} label="Inspector Name" value={inspectionResult.inspectorName} />
                                <DetailItem
                                    icon={inspectionResult.inspectionStatus === InspectionStatus.Approved ? <FiCheckCircle /> : inspectionResult.inspectionStatus === InspectionStatus.ConditionallyApproved ? <FiAlertTriangle /> : <FiXCircle />}
                                    label="Overall Status"
                                    value={inspectionResult.inspectionStatus}
                                    highlight={inspectionResult.inspectionStatus === InspectionStatus.Approved ? 'green' : inspectionResult.inspectionStatus === InspectionStatus.ConditionallyApproved ? 'yellow' : 'red'}
                                />
                                <DetailItem
                                    icon={inspectionResult.serviceStatus === ServiceStatus.Ready ? <FiCheckCircle /> : inspectionResult.serviceStatus === ServiceStatus.ReadyWithWarning ? <FiAlertTriangle /> : <FiXCircle />}
                                    label="Service Status"
                                    value={inspectionResult.serviceStatus}
                                    highlight={inspectionResult.serviceStatus === ServiceStatus.Ready ? 'green' : inspectionResult.serviceStatus === ServiceStatus.ReadyWithWarning ? 'yellow' : 'red'}
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><FiPercent /> Scores & Pass Status</h3>
                                <DetailItem
                                    icon={getSectionPassStatus('mechanical') ? <FiCheckCircle /> : <FiXCircle />}
                                    label="Mechanical"
                                    value={getSectionPassStatus('mechanical') ? 'Passed' : 'Failed'}
                                    highlight={getSectionPassStatus('mechanical') ? 'green' : 'red'}
                                />
                                <DetailItem
                                    icon={<FiPercent />}
                                    label="Body Score"
                                    value={`${inspectionResult.bodyScore}%`}
                                    highlight={inspectionResult.bodyScore >= 80 ? 'green' : inspectionResult.bodyScore >= 60 ? 'yellow' : 'red'}
                                />
                                <DetailItem
                                    icon={<FiPercent />}
                                    label="Interior Score"
                                    value={`${inspectionResult.interiorScore}%`}
                                    highlight={inspectionResult.interiorScore >= 90 ? 'green' : inspectionResult.interiorScore >= 75 ? 'yellow' : 'red'}
                                />
                            </div>
                        </div>

                        {inspectionResult.notes && inspectionResult.notes.trim() && (
                            <div className="mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <div className="flex items-center mb-2">
                                    <FiInfo className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0"/>
                                    <h3 className="font-semibold text-lg text-blue-800">Inspector Notes</h3>
                                </div>
                                <p className="text-gray-700 whitespace-pre-line text-sm">{inspectionResult.notes}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Detailed Inspection Results</h2>
                            <RenderInspectionSection data={inspectionResult.mechanical} title="Mechanical Inspection" sectionType="mechanical" />
                            <RenderInspectionSection data={inspectionResult.body} title="Body Condition Inspection" sectionType="body" />
                            <RenderInspectionSection data={inspectionResult.interior} title="Interior & Electrical Inspection" sectionType="interior" />
                        </div>
                    </div>

                    <div className="bg-gray-100 px-6 py-4 text-center text-sm text-gray-600 border-t border-gray-200">
                        <p>Report generated on {new Date().toLocaleDateString()}</p>
                        <button onClick={() => router.push('/tms-modules/admin/car-management/vehicle-inspection')} className="no-print mt-2 text-blue-600 hover:underline text-xs">
                            Back to Inspections List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}