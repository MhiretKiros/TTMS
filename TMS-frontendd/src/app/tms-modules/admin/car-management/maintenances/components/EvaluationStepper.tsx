'use client';
import { useState } from 'react';
import VehicleInfo from '../sequences/VehicleInfo';
import TechnicalEval from '../sequences/TechnicalEval';
import ProblemReport from '../sequences/ProblemReport';
import FinalReview from '../sequences/FinalReview';
import styles from '../styles/cyber.module.css';

const steps = [
  'Vehicle Information',
  'Technical Evaluation',
  'Problem Documentation',
  'Final Verification'
];

export default function EvaluationStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    vehicle: {},
    technical: {},
    problems: [],
    signatures: {}
  });

  const handleNext = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepperHeader}>
        {steps.map((step, index) => (
          <div 
            key={step} 
            className={`${styles.stepperStep} ${index === activeStep ? styles.active : ''} ${index < activeStep ? styles.completed : ''}`}
          >
            <div className={styles.stepperCircle}>
              {index < activeStep ? '✓' : index + 1}
            </div>
            <div className={styles.stepperLabel}>{step}</div>
          </div>
        ))}
      </div>

      <div className={styles.stepperContent}>
        {activeStep === 0 && <VehicleInfo onNext={handleNext} initialData={formData.vehicle} />}
        {activeStep === 1 && <TechnicalEval onNext={handleNext} onBack={handleBack} initialData={formData.technical} />}
        {activeStep === 2 && <ProblemReport onNext={handleNext} onBack={handleBack} initialData={formData.problems} />}
        {activeStep === 3 && <FinalReview data={formData} onBack={handleBack} onSubmit={() => console.log('Submit', formData)} />}
      </div>
    </div>
  );
}