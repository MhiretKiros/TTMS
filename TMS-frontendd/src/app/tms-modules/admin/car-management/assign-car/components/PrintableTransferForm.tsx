// c:\Users\hp\Desktop\TMS-2\TMS-frontendd\src\app\tms-modules\admin\car-management\assign-car\components\transfer-form\PrintableTransferForm.tsx
import React, { useEffect } from 'react';
import type { FormData } from './CarTransferForm'; // Assuming FormData is exported from page.tsx

interface PrintableTransferFormProps {
  data: FormData;
}

const PrintableTransferForm = React.forwardRef<HTMLDivElement, PrintableTransferFormProps>(({ data }, ref) => {
  useEffect(() => {
    // This log helps confirm the component has rendered or re-rendered with new data.
    console.log('[PrintableTransferForm] Rendered or data updated. Ref should be (re)assigned if the div exists.');
  }, [data]);

  console.log('[PrintableTransferForm] Component rendering. Data:', data);

  // Helper function to render field values, showing 'N/A' for empty/null values.
  // This is an optional enhancement for clearer printouts.
  const renderField = (value: string | number | undefined | null, unit: string = ''): React.ReactNode => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return <span className="text-gray-500 italic">N/A</span>;
    }
    return <>{String(value)}{unit ? ` ${unit}` : ''}</>;
  };

  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans text-sm">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Vehicle Transfer Form</h2>

      <div className="mb-4 border-b pb-2">
        <p><span className="font-semibold">Transfer Date:</span> {renderField(data.transferDate)}</p>
        <p><span className="font-semibold">Transfer Number:</span> {renderField(data.transferNumber)}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-1">Original Vehicle Details</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <p><span className="font-semibold">Old Plate Number:</span> {renderField(data.oldPlateNumber)}</p>
          <p><span className="font-semibold">Old KM Reading:</span> {renderField(data.oldKmReading, 'km')}</p>
          <p><span className="font-semibold">Designated Official:</span> {renderField(data.designatedOfficial)}</p>
          <p><span className="font-semibold">Driver's Name:</span> {renderField(data.driverName)}</p>
          <p className="col-span-2"><span className="font-semibold">Transfer Reason:</span> {renderField(data.transferReason)}</p>
          <p><span className="font-semibold">Old Fuel:</span> {renderField(data.oldFuelLiters, 'Liters')}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-1">Assigned Substitute Vehicle</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <p><span className="font-semibold">New Plate Number:</span> {renderField(data.newPlateNumber)}</p>
          <p><span className="font-semibold">New KM Reading:</span> {renderField(data.newKmReading, 'km')}</p>
          <p><span className="font-semibold">Current Designated Official:</span> {renderField(data.currentDesignatedOfficial)}</p>
          <p><span className="font-semibold">New Fuel:</span> {renderField(data.newFuelLiters, 'Liters')}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-1">Verification & Authorization</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <p><span className="font-semibold">Verifying Body Name:</span> {renderField(data.verifyingBodyName)}</p>
          <p><span className="font-semibold">Authorizing Officer Name:</span> {renderField(data.authorizingOfficerName)}</p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-8">
            <div>
                <p className="mb-1">Signature (Designated Official):</p>
                <div className="h-12 border-b border-gray-400"></div>
            </div>
            <div>
                <p className="mb-1">Signature (Authorizing Officer):</p>
                <div className="h-12 border-b border-gray-400"></div>
            </div>
        </div>
      </div>
    </div>
  );
});

PrintableTransferForm.displayName = 'PrintableTransferForm'; // Good for debugging

export default PrintableTransferForm;
