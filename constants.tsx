
import React from 'react';
import { User, UserRole, Course } from './types';

export const MOCK_USER: User = {
  id: 'std-001',
  name: 'Ahmad Fauzi',
  role: UserRole.STUDENT,
  profileComplete: true, // Profile is now complete by default for review
  email: 'fauzi@mtsn4jombang.sch.id',
  avatar: 'https://picsum.photos/200'
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-math',
    name: 'Matematika - Kelas 8',
    teacherId: 'teacher-001',
    modules: [
      {
        id: 'mod-1',
        title: 'Teorema Pythagoras',
        subject: 'Matematika',
        order: 1,
        diagnosticSubmitted: false, // Diagnostic must be completed first
        availableAt: '2023-10-01T00:00:00Z',
        kbs: [
          {
            id: 'kb-1-1',
            title: 'Penemuan Teorema Pythagoras',
            order: 1,
            content: 'Pythagoras adalah matematikawan Yunani...',
            estimatedTime: 120,
            isCompleted: false // Reset to false for testing completion logic
          },
          {
            id: 'kb-1-2',
            title: 'Penerapan pada Segitiga Siku-Siku',
            order: 2,
            content: 'Rumus c^2 = a^2 + b^2 digunakan untuk...',
            estimatedTime: 180,
            isCompleted: false // Reset to false for testing completion logic
          }
        ]
      }
    ]
  }
];

export const GRADE_WEIGHTS = {
  resume: 0.2,
  tugas: 0.2,
  keaktifan: 0.2,
  sumatif: 0.4
};