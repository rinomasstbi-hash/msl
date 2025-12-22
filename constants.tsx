
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

export const MOCK_DIAGNOSTIC_QUESTIONS = [
  {
    q: 'Manakah di antara berikut ini yang merupakan definisi dari segitiga siku-siku?',
    o: [
      'Segitiga dengan tiga sisi sama panjang.',
      'Segitiga dengan salah satu sudutnya 90 derajat.',
      'Segitiga dengan dua sisi sama panjang.',
      'Segitiga yang semua sudutnya lancip.',
    ],
  },
  {
    q: 'Pada segitiga siku-siku, sisi terpanjang yang berhadapan dengan sudut siku-siku disebut...',
    o: ['Garis tinggi', 'Garis bagi', 'Sisi miring (hipotenusa)', 'Sisi alas'],
  },
  {
    q: 'Jika sebuah segitiga memiliki panjang sisi 3 cm, 4 cm, dan 5 cm, apakah segitiga tersebut siku-siku?',
    o: ['Ya, karena memenuhi teorema Pythagoras.', 'Tidak, karena sisinya terlalu pendek.', 'Mungkin, perlu diukur sudutnya.', 'Tidak, karena semua sisinya ganjil.'],
  },
  {
    q: 'Apa bunyi dari Teorema Pythagoras?',
    o: [
      'Jumlah kuadrat sisi-sisi yang sama panjang adalah sama dengan kuadrat sisi miring.',
      'Luas segitiga adalah setengah alas kali tinggi.',
      'Kuadrat panjang sisi miring sama dengan jumlah kuadrat panjang kedua sisi penyikunya.',
      'Keliling segitiga adalah jumlah panjang ketiga sisinya.',
    ],
  },
];

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