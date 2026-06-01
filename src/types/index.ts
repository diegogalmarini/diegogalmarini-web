export * from './crm';

import React from 'react';

export interface Service {
    id: string;
    icon: React.FC<any>;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    link: {
        text: string;
        href: string;
    };
    linkEn?: {
        text: string;
        href: string;
    };
}

export interface CaseStudy {
    id: string;
    image?: string;
    imageUrl?: string; // Handle both cases as seen in usage
    title: string;
    titleEn?: string;
    tags: string[];
    tagsEn?: string[];
    description: string;
    descriptionEn?: string;
    metrics?: Record<string, string>;
    metricsEn?: Record<string, string>;
}

export interface TechStackItem {
    name: string;
    icon: React.FC<any>;
}

export interface ResultMetric {
    value: string;
    valueEn?: string;
    label: string;
    labelEn?: string;
}

export interface ChartDataPoint {
    name: string;
    value: number;
}

export interface DetailedCaseStudy extends CaseStudy {
    category: string;
    categoryEn?: string;
    problem: string;
    problemEn?: string;
    solution: string;
    solutionEn?: string;
    businessModel: string;
    businessModelEn?: string;
    techChallenges: string;
    techChallengesEn?: string;
    techStack: TechStackItem[];
    results: {
        summary: string;
        summaryEn?: string;
        metrics: ResultMetric[];
        chartData?: ChartDataPoint[];
    };
}

export interface DetailedService {
    title: string;
    titleEn?: string;
    problem: string;
    problemEn?: string;
    solution: string;
    solutionEn?: string;
    deliverables: string[];
    deliverablesEn?: string[];
}

export interface Pill {
    text: string;
    textEn?: string;
    icon: React.FC<any>;
}

export interface Differentiator {
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
}

export interface Testimonial {
    id: string | number;
    image: string;
    author: string;
    quote: string;
    quoteEn?: string;
    title: string;
    titleEn?: string;
}

export interface FaqItem {
    question: string;
    questionEn?: string;
    answer: string;
    answerEn?: string;
}

