"use client";

import React, { useState, useEffect } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

// Mock testimonials data - will be replaced with constants in later phases
const testimonials = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    role: 'CEO',
    company: 'TechStart Solutions',
    image: '/api/placeholder/100/100',
    content: 'Diego no solo entregó un producto excepcional, sino que transformó completamente nuestra visión del negocio. Su enfoque estratégico nos permitió escalar de manera sostenible.'
  },
  {
    id: '2',
    name: 'Ana Rodriguez',
    role: 'CTO',
    company: 'InnovaCorp',
    image: '/api/placeholder/100/100',
    content: 'La capacidad de Diego para combinar tecnología de vanguardia con estrategia de negocio es única. Nuestro ROI aumentó 300% en los primeros 6 meses.'
  },
  {
    id: '3',
    name: 'Miguel Torres',
    role: 'Founder',
    company: 'EcomPlus',
    image: '/api/placeholder/100/100',
    content: 'Trabajar con Diego fue la mejor decisión que tomamos. Su visión integral del producto nos ayudó a posicionarnos como líderes en nuestro sector.'
  }
];

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  content: string;
}

const TestimonialSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-black text-center text-[var(--text-color)] mb-4">
          Lo que dicen mis clientes
        </h2>
        <p className="text-lg text-[var(--text-muted)] text-center max-w-3xl mx-auto mb-8">
          Fundadores, CEOs y Directivos confían en mi visión para transformar sus negocios.
        </p>
        
        <div className="relative max-w-4xl mx-auto">
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <div className="bg-[var(--card-bg)] backdrop-blur-lg border border-[var(--border-color)] rounded-2xl p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <blockquote className="text-xl md:text-2xl text-[var(--text-color)] mb-6 leading-relaxed">
                "{currentTestimonial.content}"
              </blockquote>
              <div className="text-[var(--text-muted)]">
                <div className="font-semibold text-[var(--text-color)]">{currentTestimonial.name}</div>
                <div>{currentTestimonial.role} • {currentTestimonial.company}</div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full flex items-center justify-center hover:bg-[var(--input-bg)] transition-colors duration-200"
          >
            <IoChevronBack className="w-6 h-6 text-[var(--text-color)]" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full flex items-center justify-center hover:bg-[var(--input-bg)] transition-colors duration-200"
          >
            <IoChevronForward className="w-6 h-6 text-[var(--text-color)]" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-[var(--primary-color)]' : 'bg-[var(--border-color)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;