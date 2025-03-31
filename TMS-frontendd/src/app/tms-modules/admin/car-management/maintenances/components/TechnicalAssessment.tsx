'use client';
import { useState } from 'react';
import styles from '../styles/clean.module.css';

const technicalItems = [
  { id: 1, name: 'Motor mode' },
  { id: 2, name: 'Engine labor' },
  { id: 3, name: 'Suspension Status' },
  // ... all 25 items
];

const externalItems = [
  { id: 11, name: 'Bodial Conflict' },
  // ... all external items
];

export default function TechnicalAssessment({ onNext, onBack }) {
  const [assessments, setAssessments] = useState({});

  const handleAssessment = (id, status) => {
    setAssessments(prev => ({ ...prev, [id]: status }));
  };

  const handleSubmit = () => {
    onNext({ assessments });
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Technical Assessment</h2>
      
      <div className={styles.section}>
        <h3>Internal Review (80%)</h3>
        <div className={styles.grid}>
          {technicalItems.map(item => (
            <div key={item.id} className={styles.assessmentItem}>
              <span>{item.id}. {item.name}</span>
              <select 
                value={assessments[item.id] || ''}
                onChange={(e) => handleAssessment(item.id, e.target.value)}
              >
                <option value="">Select</option>
                <option value="pass">No problem</option>
                <option value="medium">Medium issue</option>
                <option value="fail">Problem</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3>External Assessment (20%)</h3>
        <div className={styles.grid}>
          {externalItems.map(item => (
            <div key={item.id} className={styles.assessmentItem}>
              <span>{item.id}. {item.name}</span>
              <select 
                value={assessments[item.id] || ''}
                onChange={(e) => handleAssessment(item.id, e.target.value)}
              >
                <option value="">Select</option>
                <option value="pass">No problem</option>
                <option value="medium">Relative view</option>
                <option value="fail">Has problem</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onBack} className={styles.secondaryButton}>
          Back
        </button>
        <button 
          type="button" 
          onClick={handleSubmit}
          className={styles.primaryButton}
          disabled={Object.keys(assessments).length < (technicalItems.length + externalItems.length)}
        >
          Continue to Results
        </button>
      </div>
    </div>
  );
}