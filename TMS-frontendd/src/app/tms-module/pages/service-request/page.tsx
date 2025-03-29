'use client';
import ServiceRequestForm from '../../components/ServiceRequestForm';

export default function ServiceRequestPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Service Request</h1>
      <ServiceRequestForm />
    </div>
  );
}