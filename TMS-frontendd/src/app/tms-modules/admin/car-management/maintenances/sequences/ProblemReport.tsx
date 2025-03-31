'use client';
import { useState } from 'react';
import HolographicForm from '../components/HolographicForm';
import styles from '../styles/cyber.module.css';

export default function ProblemReport({ onNext, onBack, initialData }) {
  const [problems, setProblems] = useState(initialData || [{
    description: '',
    severity: 'medium',
    images: []
  }]);

  const handleProblemChange = (index: number, field: string, value: string) => {
    const updatedProblems = [...problems];
    updatedProblems[index] = { ...updatedProblems[index], [field]: value };
    setProblems(updatedProblems);
  };

  const addProblem = () => {
    setProblems([...problems, { description: '', severity: 'medium', images: [] }]);
  };

  const removeProblem = (index: number) => {
    if (problems.length > 1) {
      const updatedProblems = [...problems];
      updatedProblems.splice(index, 1);
      setProblems(updatedProblems);
    }
  };

  const handleSubmit = () => {
    if (problems.some(p => !p.description)) {
      return alert('Please describe all reported problems');
    }
    onNext({ problems });
  };

  return (
    <HolographicForm title="Problem Documentation" onBack={onBack}>
      <div className={styles.problemsContainer}>
        {problems.map((problem, index) => (
          <div key={index} className={styles.problemCard}>
            <div className={styles.problemHeader}>
              <h4>Problem #{index + 1}</h4>
              {problems.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeProblem(index)}
                  className={styles.removeButton}
                >
                  ×
                </button>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={problem.description}
                onChange={(e) => handleProblemChange(index, 'description', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Severity</label>
              <select
                value={problem.severity}
                onChange={(e) => handleProblemChange(index, 'severity', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className={styles.imageUpload}>
              <label>Attach Images (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    handleProblemChange(index, 'images', files);
                  }
                }}
              />
            </div>
          </div>
        ))}

        <button 
          type="button" 
          onClick={addProblem}
          className={styles.addProblemButton}
        >
          + Add Another Problem
        </button>
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onBack} className={styles.cyberButtonOutline}>
          Back
        </button>
        <button type="button" onClick={handleSubmit} className={styles.cyberButton}>
          Continue to Final Verification
        </button>
      </div>
    </HolographicForm>
  );
}