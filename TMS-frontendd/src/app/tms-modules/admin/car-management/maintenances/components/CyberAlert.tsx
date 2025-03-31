'use client';
import { useEffect, useState } from 'react';
import styles from '../styles/cyber.module.css';

interface Evaluation {
  status: string;
  duration?: string;
  adjusted?: boolean;
}

export default function CyberAlert({ evaluations }: { evaluations: Evaluation[] }) {
  const [alert, setAlert] = useState<{message: string, level: 'warning' | 'error'} | null>(null);

  useEffect(() => {
    // Check 1-month problem criteria
    const has30DayProblem = evaluations.some(e => 
      e.status === 'fail' && e.duration === '30-days'
    );
    
    // Check vehicle adjustment criteria
    const hasAdjustment = evaluations.some(e => 
      e.status === 'medium' && e.adjusted
    );

    if (has30DayProblem) {
      setAlert({
        message: 'Vehicle not eligible for service - Problem exists for more than 30 days (Criteria 2)',
        level: 'error'
      });
    } else if (hasAdjustment) {
      setAlert({
        message: 'Adjusted vehicle now eligible for service (Criteria 3)',
        level: 'warning'
      });
    } else {
      setAlert(null);
    }
  }, [evaluations]);

  if (!alert) return null;

  return (
    <div className={`${styles.cyberAlert} ${styles[alert.level]}`}>
      <div className={styles.alertIcon}>
        {alert.level === 'error' ? '⚠️' : 'ℹ️'}
      </div>
      <div className={styles.alertMessage}>{alert.message}</div>
      <div className={styles.alertPulse}></div>
    </div>
  );
}