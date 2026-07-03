import { calculateReadingTime, formatReadingTime } from '../utils/readingTime';

interface ReadingTimeProps {
  content: string;
  className?: string;
}

const ReadingTime = ({ content, className = '' }: ReadingTimeProps) => {
  const minutes = calculateReadingTime(content);

  return (
    <span className={`text-sm text-gray-400 ${className}`}>
      {formatReadingTime(minutes)}
    </span>
  );
};

export default ReadingTime;
