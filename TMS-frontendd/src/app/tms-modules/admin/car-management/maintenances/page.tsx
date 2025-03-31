import EvaluationStepper from './components/EvaluationStepper';
import styles from './styles/cyber.module.css';

export default function MaintenancePage() {
  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.mainTitle}>Quantum Vehicle Maintenance System</h1>
      <EvaluationStepper />
    </div>
  );
}