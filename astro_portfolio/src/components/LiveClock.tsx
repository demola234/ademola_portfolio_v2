import { useState, useEffect } from 'react';

interface Props {
  timezone?: string;
  className?: string;
}

export default function LiveClock({ timezone = 'Africa/Lagos', className = '' }: Props) {
  const [time, setTime] = useState('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTime(formatted);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  if (!time) return null;

  return (
    <span
      className={`live-clock ${className}`}
      aria-label={`Current time in Lagos: ${time}`}
      aria-live="off"
    >
      {time} WAT
    </span>
  );
}
