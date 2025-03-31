'use client';
import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import styles from '../styles/clean.module.css';

const technicalItems = [
  { id: 1, name: 'Motor Mode', requirement: 'No abnormal sounds or vibrations' },
  // ... other items
];

export default function TechnicalEval({ onNext, onBack, initialData }) {
  const [assessments, setAssessments] = useState(initialData || {});

  const handleAssessment = (id: number, status: string) => {
    setAssessments(prev => ({
      ...prev,
      [id]: { ...prev[id], status, date: new Date().toISOString() }
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(assessments).length < technicalItems.length) {
      return alert('Please assess all technical items');
    }
    onNext({ technical: assessments });
  };

  return (
    <div>
      <h2 className={styles.title}>Technical Evaluation</h2>
      <p className={styles.textMuted}>Complete all 25 technical assessments</p>
      
      <div className={`${styles.grid} ${styles.gridCols2}`}>
        {technicalItems.map(item => (
          <div key={item.id} className={styles.card}>
            <h3 className={styles.subtitle}>{item.name}</h3>
            <p className={styles.textMuted}>{item.requirement}</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <div className="flex gap-2 mt-2">
                {['pass', 'medium', 'fail'].map(status => (
                  <button
                    key={status}
                    type="button"
                    className={`${styles.btn} ${styles.btnOutline} ${assessments[item.id]?.status === status ? '!border-blue-600 !text-blue-600' : ''}`}
                    onClick={() => handleAssessment(item.id, status)}
                  >
                    <StatusBadge status={status} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onBack} className={`${styles.btn} ${styles.btnOutline}`}>
          Back
        </button>
        <button onClick={handleSubmit} className={`${styles.btn} ${styles.btnPrimary}`}>
          Continue to Problem Documentation
        </button>
      </div>
    </div>
  );
}