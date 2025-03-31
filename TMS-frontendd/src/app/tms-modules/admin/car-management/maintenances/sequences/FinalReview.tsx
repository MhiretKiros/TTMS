'use client';
import { useState, useRef } from 'react';
import HolographicForm from '../components/HolographicForm';
import CyberGauge from '../components/CyberGauge';
import styles from '../styles/cyber.module.css';

interface TechnicalAssessment {
  [key: string]: {
    status: 'pass' | 'medium' | 'fail';
    date?: string;
    duration?: string;
    adjusted?: boolean;
  };
}

interface FinalReviewProps {
  data: {
    vehicle: {
      type: string;
      classificationNumber: string;
      motorAbility: string;
      installCapability: string;
      mileage: string;
    };
    technical: TechnicalAssessment;
    problems: Array<{
      description: string;
      severity: string;
      images: File[];
    }>;
  };
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export default function FinalReview({ data, onBack, onSubmit }: FinalReviewProps) {
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [technicianName, setTechnicianName] = useState('');

  const calculateEfficiency = (technicalData: TechnicalAssessment): number => {
    const totalItems = Object.keys(technicalData).length;
    if (totalItems === 0) return 0;
    
    const passed = Object.values(technicalData).filter(t => t.status === 'pass').length;
    const medium = Object.values(technicalData).filter(t => t.status === 'medium').length;
    
    // Fixed calculation syntax
    return Math.round((passed + (medium * 0.5)) / totalItems * 100);
  };

  const startSigning = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsSigning(true);
    const canvas = signatureRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(
          e.nativeEvent.offsetX,
          e.nativeEvent.offsetY
        );
      }
    }
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSigning || !signatureRef.current) return;
    const ctx = signatureRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      );
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const endSigning = () => {
    setIsSigning(false);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      const ctx = signatureRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height);
      }
    }
  };

  const handleSubmit = () => {
    if (!technicianName.trim()) {
      return alert('Please enter technician name');
    }
    if (!signatureRef.current?.toDataURL()) {
      return alert('Please provide your signature');
    }
    onSubmit({
      ...data,
      technician: {
        name: technicianName,
        signature: signatureRef.current.toDataURL()
      }
    });
  };

  return (
    <HolographicForm title="Final Verification" onBack={onBack}>
      <div className={styles.reviewGrid}>
        <div className={styles.reviewSummary}>
          <h3>Vehicle Information</h3>
          <div className={styles.reviewItem}>
            <span>Type:</span>
            <span>{data.vehicle.type}</span>
          </div>
          <div className={styles.reviewItem}>
            <span>Classification #:</span>
            <span>{data.vehicle.classificationNumber}</span>
          </div>
          <div className={styles.reviewItem}>
            <span>Mileage:</span>
            <span>{data.vehicle.mileage} K/M</span>
          </div>

          <h3>Technical Assessment</h3>
          <CyberGauge value={calculateEfficiency(data.technical)} />
          
          <div className={styles.statusSummary}>
            <div>
              <small>Passed</small>
              <h4 className={styles.healthy}>
                {Object.values(data.technical).filter(t => t.status === 'pass').length}
              </h4>
            </div>
            <div>
              <small>Medium</small>
              <h4 className={styles.warning}>
                {Object.values(data.technical).filter(t => t.status === 'medium').length}
              </h4>
            </div>
            <div>
              <small>Failed</small>
              <h4 className={styles.critical}>
                {Object.values(data.technical).filter(t => t.status === 'fail').length}
              </h4>
            </div>
          </div>
        </div>

        <div className={styles.signatureSection}>
          <h3>Technician Verification</h3>
          
          <div className={styles.formGroup}>
            <label>Technician Name</label>
            <input 
              type="text" 
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Signature</label>
            <canvas
              ref={signatureRef}
              width={400}
              height={200}
              onMouseDown={startSigning}
              onMouseMove={drawSignature}
              onMouseUp={endSigning}
              onMouseLeave={endSigning}
              className={styles.signatureCanvas}
            />
            <button 
              type="button" 
              onClick={clearSignature}
              className={styles.clearSignature}
            >
              Clear Signature
            </button>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onBack} className={styles.cyberButtonOutline}>
              Back
            </button>
            <button 
              type="button" 
              onClick={handleSubmit}
              className={styles.cyberButton}
              disabled={!technicianName.trim() || !signatureRef.current?.toDataURL()}
            >
              Submit Evaluation
            </button>
          </div>
        </div>
      </div>
    </HolographicForm>
  );
}