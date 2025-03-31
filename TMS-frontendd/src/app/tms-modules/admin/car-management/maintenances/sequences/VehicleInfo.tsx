'use client';
import { useState } from 'react';
import HolographicForm from '../components/HolographicForm';
import styles from '../styles/cyber.module.css';

export default function VehicleInfo({ onNext, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    type: '',
    classificationNumber: '',
    motorAbility: '',
    installCapability: '',
    mileage: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ vehicle: formData });
  };

  return (
    <HolographicForm title="Vehicle Information">
      <form onSubmit={handleSubmit} className={styles.vehicleForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Type of the car</label>
            <input 
              type="text" 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Classification number</label>
            <input 
              type="text" 
              value={formData.classificationNumber}
              onChange={(e) => setFormData({...formData, classificationNumber: e.target.value})}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Motor's ability</label>
            <input 
              type="text" 
              value={formData.motorAbility}
              onChange={(e) => setFormData({...formData, motorAbility: e.target.value})}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Install capability</label>
            <input 
              type="text" 
              value={formData.installCapability}
              onChange={(e) => setFormData({...formData, installCapability: e.target.value})}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Mileage (K/M)</label>
          <input 
            type="number" 
            value={formData.mileage}
            onChange={(e) => setFormData({...formData, mileage: e.target.value})}
            required
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.cyberButton}>
            Continue to Technical Evaluation
          </button>
        </div>
      </form>
    </HolographicForm>
  );
}