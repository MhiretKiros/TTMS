import styles from '../styles/cyber.module.css';

export default function HolographicForm({ 
  title, 
  children, 
  onBack,
  onNext
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className={styles.holographicForm}>
      <h2 className={styles.formTitle}>{title}</h2>
      {children}
    </div>
  );
}