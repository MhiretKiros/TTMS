'use client';
import CarRegistrationForm from '../../components/CarRegistrationForm';

export default function RegisterCarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Register New Vehicle</h1>
      <CarRegistrationForm />
    </div>
  );
}