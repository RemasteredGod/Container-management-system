import React, { useEffect, useRef } from 'react';

const Animate = ({ className }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas dimensions
    canvas.width = 200;
    canvas.height = 100;

    // Truck properties
    const truck = {
      x: -60,
      y: 60,
      width: 50,
      height: 30,
      wheelRadius: 6,
      speed: 1.5,
    };

    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw road
      ctx.beginPath();
      ctx.moveTo(0, 80);
      ctx.lineTo(canvas.width, 80);
      ctx.strokeStyle = '#777';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw truck body
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(truck.x, truck.y - truck.height, truck.width, truck.height);

      // Draw truck cabin
      ctx.fillStyle = '#3498db';
      ctx.fillRect(
        truck.x + truck.width - 15,
        truck.y - truck.height - 10,
        15,
        10
      );

      // Draw wheels
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(truck.x + 10, truck.y, truck.wheelRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        truck.x + truck.width - 10,
        truck.y,
        truck.wheelRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Move truck
      truck.x += truck.speed;

      // Reset position when truck goes off-screen
      if (truck.x > canvas.width) {
        truck.x = -60;
      }

      // Continue animation
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`animation-container ${className || ''}`}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          margin: '0 auto',
          maxWidth: '100%',
        }}
      />
    </div>
  );
};

export default Animate;
