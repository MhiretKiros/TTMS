"use client";
import CarForm from '../../manage-cars/components/CarForm';
import { useState } from 'react';
import { Car } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterNewCar() {
  const [isFormOpen, setIsFormOpen] = useState(true);

  const handleSubmit = async (carData: Car) => {
    try {
      // Replace with actual API call
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      });
      
      if (response.ok) {
        window.location.href = '/tms-modules/admin/car-management/manage-cars';
      }
    } catch (error) {
      console.error('Error registering car:', error);
    }
  };

  return (
    <div className="p-6">
      <AnimatePresence>
        {isFormOpen && (
          <CarForm
            car={null}
            onClose={() => window.location.href = '/tms-modules/admin/car-management/manage-cars'}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}