import React, { useRef, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  opacity: number;
  increment: number;
  size: number; // Add a size property for the star
}

const StarAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      const width = canvas!.width;
      const height = canvas!.height;
      const stars: Star[] = createStars(100, width, height); // Create 100 stars as an example

      let animationFrameId: number;

      // Function to update the canvas drawing
      const draw = () => {
        ctx.clearRect(0, 0, width, height); // Clear the canvas
        stars.forEach((star) => {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); // Use the star's size for the radius
          ctx.fill();
          // Update star opacity
          if (star.opacity <= 0 || star.opacity >= 1)
            star.increment = -star.increment;
          star.opacity += star.increment;
        });

        animationFrameId = requestAnimationFrame(draw);
      };

      draw();

      // Clean up animation frame
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, []);

  // Function to create an array of stars
  function createStars(count: number, width: number, height: number): Star[] {
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const opacity = Math.random();
      const increment = 0.01 + Math.random() * 0.02; // Twinkle speed
      const size = 1 + Math.random() * 2; // Star size between 1 and 3
      stars.push({ x, y, opacity, increment, size });
    }
    return stars;
  }

  return <canvas ref={canvasRef} width="784" height="914" />;
};

export default StarAnimation;
