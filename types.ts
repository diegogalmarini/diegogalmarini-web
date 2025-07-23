import type { FC } from 'react';

export interface Pill {
  text: string;
  icon: FC;
}

export interface Differentiator {
  title:string;
  description: string;
}

export interface Service {
  id: 'strategy' | 'development' | 'growth';
  icon: FC;
  title: string;
  description: string;
  link: {
    text: string;
    href: string;
  };
}

export interface DetailedService {
  problem: string;
  solution: string;
  deliverables: string[];
}

export interface TechStackItem {
  name: string;
  icon: FC;
}

export interface CaseStudy {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  metrics: {
    [key: string]: string;
  };
}

export interface DetailedCaseStudy {
  id: string;
  imageUrl: string;
  title: string;
  category: 'Proyecto Realizado' | 'Concepto Estratégico' | 'Idea en Desarrollo';
  tags: string[];
  description: string;
  problem: string;
  solution: string;
  businessModel: string;
  techChallenges: string;
  techStack: TechStackItem[];
  results: {
    summary: string;
    metrics: {
      value: string;
      label: string;
    }[];
    chartData?: { name: string; value: number }[];
  };
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  title: string;
  image: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}