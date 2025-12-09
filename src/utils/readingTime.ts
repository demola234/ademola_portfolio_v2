export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;

  // Remove markdown syntax and code blocks for more accurate word count
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Keep link text, remove URL
    .replace(/[#*_~`]/g, '') // Remove markdown symbols
    .replace(/\n+/g, ' '); // Replace newlines with spaces

  // Count words
  const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  return readingTime > 0 ? readingTime : 1;
};

export const formatReadingTime = (minutes: number): string => {
  return `${minutes} min read`;
};
