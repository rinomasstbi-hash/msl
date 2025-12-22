
import { User, UserRole, Course } from '../types';

export const MOCK_USER: User = {
  id: 'std-001',
  name: 'Ahmad Fauzi',
  role: UserRole.STUDENT,
  profileComplete: false, // Start with incomplete profile to test the gate
  email: 'fauzi@mtsn4jombang.sch.id',
  avatar: 'https://picsum.photos/200',
  className: 'Kelas 8-A',
  semester: 'Semester III', // Standardized for logic comparison
  nisn: '',
  address: '',
  parentName: '',
  parentPhone: ''
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
    a: 1 // Correct answer index
  },
  {
    q: 'Pada segitiga siku-siku, sisi terpanjang yang berhadapan dengan sudut siku-siku disebut...',
    o: ['Garis tinggi', 'Garis bagi', 'Sisi miring (hipotenusa)', 'Sisi alas'],
    a: 2
  },
  {
    q: 'Jika sebuah segitiga memiliki panjang sisi 3 cm, 4 cm, dan 5 cm, apakah segitiga tersebut siku-siku?',
    o: ['Ya, karena memenuhi teorema Pythagoras.', 'Tidak, karena sisinya terlalu pendek.', 'Mungkin, perlu diukur sudutnya.', 'Tidak, karena semua sisinya ganjil.'],
    a: 0
  },
  {
    q: 'Apa bunyi dari Teorema Pythagoras?',
    o: [
      'Jumlah kuadrat sisi-sisi yang sama panjang adalah sama dengan kuadrat sisi miring.',
      'Luas segitiga adalah setengah alas kali tinggi.',
      'Kuadrat panjang sisi miring sama dengan jumlah kuadrat panjang kedua sisi penyikunya.',
      'Keliling segitiga adalah jumlah panjang ketiga sisinya.',
    ],
    a: 2
  },
];

export const MOCK_SUMMATIVE_QUESTIONS = [
  {
    q: 'Sebuah segitiga siku-siku memiliki panjang sisi siku-siku 6 cm dan 8 cm. Berapakah panjang sisi miringnya?',
    o: ['10 cm', '12 cm', '14 cm', '9 cm'],
    a: 0 // (sqrt(36+64) = 10)
  },
  {
    q: 'Diketahui sisi miring segitiga siku-siku adalah 13 cm dan salah satu sisi siku-sikunya 5 cm. Berapakah panjang sisi lainnya?',
    o: ['10 cm', '11 cm', '12 cm', '8 cm'],
    a: 2 // (sqrt(169-25) = 12)
  },
  {
    q: 'Manakah kumpulan tiga bilangan berikut yang membentuk tripel Pythagoras?',
    o: ['3, 4, 6', '5, 12, 13', '6, 8, 12', '7, 24, 26'],
    a: 1
  },
  {
    q: 'Sebuah tangga sepanjang 5 meter disandarkan pada tembok. Jarak kaki tangga ke tembok adalah 3 meter. Berapakah tinggi tembok yang dicapai tangga?',
    o: ['3 meter', '4 meter', '5 meter', '6 meter'],
    a: 1
  },
  {
    q: 'Rumus Pythagoras c² = a² + b² berlaku jika...',
    o: ['c adalah sisi miring', 'a adalah sisi miring', 'b adalah sisi miring', 'Sudutnya tumpul'],
    a: 0
  }
];

// Helper to create basic structure for other courses
const createBasicCourse = (id: string, name: string, teacherId: string, moduleTitle: string): Course => ({
  id,
  name,
  teacherId,
  modules: [
    {
      id: `mod-${id}-1`,
      title: moduleTitle,
      subject: name,
      order: 1,
      diagnosticSubmitted: false,
      tugasSubmitted: false,
      summativeSubmitted: false, 
      summativeScore: 0,
      resumeScore: 0,
      tugasScore: 0,
      keaktifanScore: 0,
      availableAt: '2023-10-01T00:00:00Z',
      kbs: [
        {
          id: `kb-${id}-1`,
          title: `Pengantar ${moduleTitle}`,
          order: 1,
          content: `Materi pengantar untuk ${moduleTitle}...`,
          estimatedTime: 120,
          isCompleted: false,
          resumeContent: ''
        }
      ]
    }
  ]
});

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-math',
    name: 'Matematika',
    teacherId: 'teacher-001',
    modules: [
      {
        id: 'mod-1',
        title: 'Teorema Pythagoras',
        subject: 'Matematika',
        order: 1,
        diagnosticSubmitted: false,
        tugasSubmitted: false,
        summativeSubmitted: false, 
        summativeScore: 0,
        // Mocking graded scores (Simulasi nilai dari guru)
        resumeScore: 88, 
        tugasScore: 92,
        keaktifanScore: 95,
        availableAt: '2023-10-01T00:00:00Z',
        kbs: [
          {
            id: 'kb-1-1',
            title: 'Penemuan Teorema Pythagoras',
            order: 1,
            content: 'Pythagoras adalah matematikawan Yunani...',
            estimatedTime: 120,
            isCompleted: false,
            resumeContent: ''
          },
          {
            id: 'kb-1-2',
            title: 'Penerapan pada Segitiga Siku-Siku',
            order: 2,
            content: 'Rumus c^2 = a^2 + b^2 digunakan untuk...',
            estimatedTime: 180,
            isCompleted: false,
            resumeContent: ''
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Lingkaran',
        subject: 'Matematika',
        order: 2,
        diagnosticSubmitted: false,
        tugasSubmitted: false,
        summativeSubmitted: false, 
        summativeScore: 0,
        resumeScore: 0,
        tugasScore: 0,
        keaktifanScore: 0,
        availableAt: '2023-10-15T00:00:00Z',
        kbs: [
          {
            id: 'kb-2-1',
            title: 'Unsur-unsur Lingkaran',
            order: 1,
            content: 'Mengenal titik pusat, jari-jari, diameter, busur, tali busur...',
            estimatedTime: 150,
            isCompleted: false,
            resumeContent: ''
          },
          {
            id: 'kb-2-2',
            title: 'Keliling dan Luas Lingkaran',
            order: 2,
            content: 'Memahami nilai Pi dan rumus keliling (2.pi.r) serta luas (pi.r^2)...',
            estimatedTime: 200,
            isCompleted: false,
            resumeContent: ''
          }
        ]
      }
    ]
  },
  createBasicCourse('course-ipa', 'Ilmu Pengetahuan Alam', 'teacher-002', 'Sistem Pencernaan'),
  createBasicCourse('course-ips', 'Ilmu Pengetahuan Sosial', 'teacher-003', 'Mobilitas Sosial'),
  createBasicCourse('course-bindo', 'Bahasa Indonesia', 'teacher-004', 'Teks Eksplanasi'),
  createBasicCourse('course-bing', 'Bahasa Inggris', 'teacher-005', 'Recount Text'),
  createBasicCourse('course-qh', 'Al-Qur\'an Hadis', 'teacher-006', 'Hukum Bacaan Mad'),
  createBasicCourse('course-aa', 'Akidah Akhlak', 'teacher-007', 'Adab Kepada Orang Tua'),
  createBasicCourse('course-fikih', 'Fikih', 'teacher-008', 'Sujud Sahwi'),
  createBasicCourse('course-ski', 'Sejarah Kebudayaan Islam', 'teacher-009', 'Dinasti Abbasiyah'),
  createBasicCourse('course-barab', 'Bahasa Arab', 'teacher-010', 'At-Ta\'aruf'),
  createBasicCourse('course-pkn', 'PPKn', 'teacher-011', 'Tata Tertib Sekolah'),
  createBasicCourse('course-pjok', 'PJOK', 'teacher-012', 'Permainan Bola Besar'),
  createBasicCourse('course-sb', 'Seni Budaya', 'teacher-013', 'Menggambar Ilustrasi'),
  createBasicCourse('course-prakarya', 'Prakarya', 'teacher-014', 'Kerajinan Bahan Lunak'),
  createBasicCourse('course-info', 'Informatika', 'teacher-015', 'Berpikir Komputasional')
];

export const GRADE_WEIGHTS = {
  resume: 0.2,
  tugas: 0.2,
  keaktifan: 0.2,
  sumatif: 0.4
};
