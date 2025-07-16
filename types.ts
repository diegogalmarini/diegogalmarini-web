export interface Pill {
  text: string;
  icon: React.ComponentType;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  problem: string;
  solution: string;
  results: string[];
  technologies: Pill[];
}

export interface Differentiator {
    title: string;
    description: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface HomeService {
    id: 'strategy' | 'development' | 'growth';
    title: string;
    icon: React.ComponentType;
}

export interface DetailedService {
    title: string;
    solution: string;
    deliverables: string[];
}

export interface Testimonial {
    id: number;
    quote: string;
    author: string;
    title: string;
    image: string;
}

export interface ServicesHeadline {
  title: string;
  description: string;
}
