export * from './crm';

import React from 'react';

export interface Service {
    id: string;
    icon: React.FC<any>;
    title: string;
    description: string;
    link: {
        text: string;
        href: string;
    };
}

export interface CaseStudy {
    id: string;
    image?: string;
    imageUrl?: string; // Handle both cases as seen in usage
    title: string;
    tags: string[];
    description: string;
    metrics?: Record<string, string>;
}

export interface TechStackItem {
    name: string;
    icon: React.FC<any>;
}

export interface ResultMetric {
    value: string;
    label: string;
}

export interface ChartDataPoint {
    name: string;
    value: number;
}

export interface DetailedCaseStudy extends CaseStudy {
    category: string;
    problem: string;
    solution: string;
    businessModel: string;
    techChallenges: string;
    techStack: TechStackItem[];
    results: {
        summary: string;
        metrics: ResultMetric[];
        chartData?: ChartDataPoint[];
    };
}

export interface DetailedService {
    title: string;
    problem: string;
    solution: string;
    deliverables: string[];
}

export interface Pill {
    text: string;
    icon: React.FC<any>;
}

export interface Differentiator {
    title: string;
    description: string;
}

export interface Testimonial {
    id: string | number;
    image: string;
    author: string;
    quote: string;
    title: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}
