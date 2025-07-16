import React, { useState, useEffect } from 'react';
import { Testimonial } from '../types';
import { Card } from './common';

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

const TestimonialCard: React.FC<{ testimonial: Testimonial, isVisible: boolean }> = ({ testimonial, isVisible }) => (
    <div className={`transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-5'}`}>
        <Card className="flex flex-col text-center items-center p-8 h-full pt-16">
            <img
                src={testimonial.image}
                alt={testimonial.author}
                className="w-24 h-24 rounded-full mb-6 -mt-28 border-8 border-[var(--bg-color)] mx-auto"
            />
            <p className="text-lg italic mb-6 flex-grow">"{testimonial.quote}"</p>
            <div className="mt-auto">
                <p className="font-bold text-[var(--text-color)]">{testimonial.author}</p>
                <p className="text-sm text-[var(--text-muted)]">{testimonial.title}</p>
            </div>
        </Card>
    </div>
);

export const TestimonialSlider: React.FC<TestimonialSliderProps> = ({ testimonials }) => {
  const [displayedTestimonials, setDisplayedTestimonials] = useState<Testimonial[]>([]);
  const [visibleStates, setVisibleStates] = useState<boolean[]>([true, true, true]);

  useEffect(() => {
    // Initialize with the first 3 testimonials
    const initialTestimonials = testimonials.slice(0, 3);
    setDisplayedTestimonials(initialTestimonials);

    const intervalId = setInterval(() => {
      // Find a testimonial that is not currently displayed
      let newTestimonial: Testimonial;
      do {
        newTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
      } while (displayedTestimonials.some(t => t.id === newTestimonial.id));

      // Choose a random slot to replace
      const randomIndex = Math.floor(Math.random() * 3);

      // Animate out
      setVisibleStates(prev => {
        const newStates = [...prev];
        newStates[randomIndex] = false;
        return newStates;
      });

      // Wait for animation, then replace and animate in
      setTimeout(() => {
        setDisplayedTestimonials(prev => {
          const newDisplay = [...prev];
          newDisplay[randomIndex] = newTestimonial;
          return newDisplay;
        });
        setVisibleStates(prev => {
          const newStates = [...prev];
          newStates[randomIndex] = true;
          return newStates;
        });
      }, 700); // This should match the fade-out duration

    }, 7000); // Change one testimonial every 7 seconds

    return () => clearInterval(intervalId);
  }, [testimonials]);
  
  return (
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {displayedTestimonials.map((testimonial, index) => (
        <TestimonialCard 
            key={testimonial.id} 
            testimonial={testimonial} 
            isVisible={visibleStates[index]} 
        />
      ))}
    </div>
  );
};
