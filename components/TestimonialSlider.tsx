
import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../types.ts';
import { Card } from './common.tsx';

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

const TestimonialCard: React.FC<{ testimonial: Testimonial, isVisible: boolean }> = ({ testimonial, isVisible }) => (
    <div className={`relative h-full transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-5'}`}>
        <Card className="h-full relative overflow-visible">
          <div className="absolute -top-12 left-0 right-0 mx-auto w-24 h-24 z-10 flex items-center justify-center">
            <img 
              src={testimonial.image} 
              alt={testimonial.author} 
              className="w-full h-full rounded-full border-4 border-white shadow-2xl object-cover" 
              style={{
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 6px 10px rgba(0, 0, 0, 0.15)',
                objectPosition: 'center center'
              }}
            />
          </div>
          <div className="pt-16 pb-6 px-6 h-full flex flex-col text-center items-center">
            <div className="flex-grow flex flex-col justify-center">
              <p className="text-[var(--text-muted)] italic leading-relaxed text-base">"{testimonial.quote}"</p>
            </div>
            <div className="mt-6 flex-shrink-0">
                <p className="font-bold text-[var(--text-color)] text-lg">{testimonial.author}</p>
                <p className="text-sm text-[var(--primary-color)] font-semibold">{testimonial.title}</p>
            </div>
          </div>
        </Card>
    </div>
);

export const TestimonialSlider: React.FC<TestimonialSliderProps> = ({ testimonials }) => {
  const [displayedTestimonials, setDisplayedTestimonials] = useState<Testimonial[]>([]);
  const [visibleStates, setVisibleStates] = useState<boolean[]>([false, false, false]);
  const availableTestimonialsRef = useRef<Testimonial[]>([]);
  const testimonialCount = Math.min(testimonials.length, 3);
  const timeoutRef = useRef<number | null>(null);

  // Initialize with shuffled testimonials and create available pool
  useEffect(() => {
    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    const initialTestimonials = shuffled.slice(0, testimonialCount);
    availableTestimonialsRef.current = shuffled.slice(testimonialCount);
    setDisplayedTestimonials(initialTestimonials);
    // Animate in initially
    timeoutRef.current = window.setTimeout(() => setVisibleStates(Array(testimonialCount).fill(true)), 100);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [testimonials, testimonialCount]);
  
  useEffect(() => {
    if (testimonials.length <= testimonialCount) return;

    const intervalId = setInterval(() => {
      const randomIndexToReplace = Math.floor(Math.random() * testimonialCount);
      
      setVisibleStates(prev => {
        const newStates = [...prev];
        newStates[randomIndexToReplace] = false;
        return newStates;
      });

      timeoutRef.current = window.setTimeout(() => {
        setDisplayedTestimonials(currentDisplay => {
          // If no more available testimonials, refill the pool with all testimonials except currently displayed
          if (availableTestimonialsRef.current.length === 0) {
            const currentIds = currentDisplay.map(t => t.id);
            const allExceptCurrent = testimonials.filter(t => !currentIds.includes(t.id));
            availableTestimonialsRef.current = [...allExceptCurrent].sort(() => 0.5 - Math.random());
          }
          
          const newItem = availableTestimonialsRef.current.shift();
          if (!newItem) {
              return currentDisplay;
          }
          
          const newDisplay = [...currentDisplay];
          const replacedItem = newDisplay[randomIndexToReplace];
          newDisplay[randomIndexToReplace] = newItem;
          
          // Add the replaced item back to the available pool
          availableTestimonialsRef.current.push(replacedItem);
          
          return newDisplay;
        });

        setVisibleStates(prev => {
          const newStates = [...prev];
          newStates[randomIndexToReplace] = true;
          return newStates;
        });
      }, 700);

    }, 5000);

    return () => {
        clearInterval(intervalId);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
  }, [testimonials, testimonialCount]);
  
  if (displayedTestimonials.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
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
