'use client';
import styles from '../styles/clean.module.css';

export default function ResultsSummary({ data, onSubmit }) {
  const calculateScore = () => {
    // Calculate scores based on assessments
    return {
      internal: 82, // Example calculation
      external: 18, // Example calculation
      total: 80 // Example calculation
    };
  };

  const scores = calculateScore();

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Assessment Results</h2>
      
      <div className={styles.scoreCard}>
        <div className={styles.scoreSection}>
          <h3>Internal Review</h3>
          <div className={styles.scoreValue}>{scores.internal}%</div>
        </div>
        <div className={styles.scoreSection}>
          <h3>External Review</h3>
          <div className={styles.scoreValue}>{scores.external}%</div>
        </div>
        <div className={styles.totalScore}>
          <h3>Total Score</h3>
          <div className={styles.scoreValue}>{scores.total}%</div>
        </div>
      </div>

      <div className={styles.remarks}>
        <h3>General Results</h3>
        <textarea 
          className={styles.remarksInput}
          placeholder="Enter final assessment remarks..."
        />
      </div>

      <button 
        type="button" 
        onClick={onSubmit}
        className={styles.primaryButton}
      >
        Submit Final Assessment
      </button>
    </div>
  );
}