import styles from '../styles/cyber.module.css';

interface CyberGaugeProps {
  value: number;
}

export default function CyberGauge({ value }: CyberGaugeProps) {
  // Calculate the dash offset for the gauge arc
  const dashOffset = 157 - (157 * Math.min(Math.max(value, 0), 100)) / 100;

  // Determine gauge color based on value
  const gaugeColor = value >= 70 ? '#00ff9d' : 
                    value >= 30 ? '#ffee00' : 
                    '#ff3a3a';

  return (
    <div className={styles.gaugeContainer}>
      <svg viewBox="0 0 120 120" className={styles.gaugeSvg}>
        {/* Background arc */}
        <path 
          d="M20,100 A50,50 0 1,1 100,100" 
          fill="none" 
          stroke="rgba(255,255,255,0.1)" 
          strokeWidth="10"
        />
        {/* Value arc */}
        <path 
          d="M20,100 A50,50 0 1,1 100,100" 
          fill="none" 
          stroke={gaugeColor}
          strokeWidth="10" 
          strokeDasharray="157" 
          strokeDashoffset={dashOffset}
          className={styles.gaugeArc}
        />
        {/* Glow effect */}
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>
      
      <div className={styles.gaugeValue}>
        {value}%
      </div>
      <div className={styles.gaugeLabel}>
        Operational Efficiency
      </div>
      
      {/* Animated border effect */}
      <div className={styles.gaugeBorder}></div>
    </div>
  );
}