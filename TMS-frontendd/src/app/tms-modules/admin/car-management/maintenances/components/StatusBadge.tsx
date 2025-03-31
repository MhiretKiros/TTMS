import styles from '../styles/cyber.module.css';

export default function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pass: { color: 'var(--neon-green)', label: '✓' },
    medium: { color: 'var(--cyber-yellow)', label: '!' },
    fail: { color: '#ff3a3a', label: '✕' }
  };

  return (
    <span 
      className={styles.statusBadge}
      style={{ backgroundColor: statusConfig[status as keyof typeof statusConfig].color }}
    >
      {statusConfig[status as keyof typeof statusConfig].label}
    </span>
  );
}