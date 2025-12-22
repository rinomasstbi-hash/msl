
import { User, Course } from '../types';
import { MOCK_USER, MOCK_COURSES } from './seedData';

// --- CONFIGURATION ---
// PENTING: Paste URL Web App Google Apps Script Anda di sini.
// Contoh: 'https://script.google.com/macros/s/AKfycbx.../exec'
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJBaAA2i-gmoVM72DIsS5KfT0oppNAc3y8_tVQhmIqkQGqnxvP03R5CiDTYAEi4mc/exec'; 

const USER_KEY = 'msl_user';
const COURSES_KEY = 'msl_courses';

// --- Helper functions to interact with localStorage (Fallback) ---
const getLocalData = <T>(key: string): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return null;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key “${key}”:`, error);
  }
};

// --- API Service ---

// Simulate network delay for local
const apiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Seeds localStorage with mock data if it's not already there.
 */
export const initializeData = (): void => {
  if (!getLocalData(USER_KEY)) {
    setLocalData(USER_KEY, MOCK_USER);
  }
  if (!getLocalData(COURSES_KEY)) {
    setLocalData(COURSES_KEY, MOCK_COURSES);
  }
};

/**
 * FETCH USER
 * Strategy: Try Google Sheet first. If URL empty or fails, fallback to LocalStorage.
 */
export const getUser = async (): Promise<User> => {
  if (GOOGLE_SCRIPT_URL) {
    try {
      // Menggunakan no-cors untuk simple request, tapi kita butuh response. 
      // Google Script Web App dengan "Anyone" access mendukung CORS standard.
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUser`, {
        method: 'POST', // POST sering lebih stabil di GAS untuk menghindari caching
        body: JSON.stringify({ action: 'getUser' })
      });
      const data = await response.json();
      
      // Merge spreadsheet data with local static structure (avatar etc)
      return {
        ...MOCK_USER, // Base static data
        id: data.id,
        name: data.name,
        role: data.role,
        email: data.email,
        profileComplete: data.profileComplete,
        // If sheet has saved progress, we need to inject it into courses logic later
      };
    } catch (e) {
      console.warn("Gagal connect ke Spreadsheet, fallback ke LocalStorage", e);
    }
  }

  // Fallback Local
  await apiDelay(200);
  const user = getLocalData<User>(USER_KEY);
  if (!user) throw new Error("User data not found.");
  return user;
};

/**
 * GET COURSES
 * Strategy: Load static course structure, then overlay progress from database.
 */
export const getCourses = async (): Promise<Course[]> => {
  let savedProgress = null;

  // 1. Try to get progress from Cloud if available
  if (GOOGLE_SCRIPT_URL) {
    try {
       const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUser`, {
        method: 'POST',
        body: JSON.stringify({ action: 'getUser' })
      });
      const data = await response.json();
      savedProgress = data.savedProgress; // JSON object of course progress
    } catch (e) {
      console.warn("Failed to sync progress from cloud");
    }
  }

  // 2. If Cloud failed or empty, try LocalStorage
  if (!savedProgress) {
    const localCourses = getLocalData<Course[]>(COURSES_KEY);
    if (localCourses) return localCourses;
  }

  // 3. If we have cloud progress, merge it with MOCK_COURSES (Source of Truth for content)
  if (savedProgress) {
     // Logic to merge saved `isCompleted` status into MOCK_COURSES
     // This assumes savedProgress follows the same structure
     // For simplicity in this demo, we might need complex deep merging.
     // Let's rely on LocalStorage for full object structure for now unless we implement deep merge.
     
     // NOTE: For a real production app, we would map the 'savedProgress' (which might just be IDs)
     // back onto the MOCK_COURSES.
     // For this prototype, if we use Spreadsheet, we will stick to LocalStorage for 'Courses' object integrity
     // but in a real step, you'd replace this.
     
     // Temporary: return local to ensure structure doesn't break until deep merge is implemented
     const local = getLocalData<Course[]>(COURSES_KEY);
     return local || MOCK_COURSES;
  }

  await apiDelay(200);
  const courses = getLocalData<Course[]>(COURSES_KEY);
  return courses || MOCK_COURSES;
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    // 1. Update Cloud
    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateUser',
            user: {
              id: updatedUser.id,
              profileComplete: updatedUser.profileComplete,
              // Add other fields you want to persist
            }
          })
        });
      } catch (e) {
        console.error("Cloud update failed");
      }
    }

    // 2. Update Local
    await apiDelay(300);
    setLocalData(USER_KEY, updatedUser);
    return updatedUser;
};


export const updateKBCompletion = async (courseId: string, kbId: string): Promise<Course[]> => {
  // Get current local state first
  const courses = await getCourses();
  
  const updatedCourses = courses.map(course => {
    if (course.id === courseId) {
      return {
        ...course,
        modules: course.modules.map(module => ({
          ...module,
          kbs: module.kbs.map(kb => {
            if (kb.id === kbId) {
              return { ...kb, isCompleted: true };
            }
            return kb;
          }),
        })),
      };
    }
    return course;
  });

  // Save to Local
  setLocalData(COURSES_KEY, updatedCourses);

  // Save to Cloud (Sync entire course progress structure)
  if (GOOGLE_SCRIPT_URL) {
     const user = await getUser(); // get current user ID
     fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateProgress',
          user: { id: user.id },
          courses: updatedCourses // Saving the whole blob for simplicity
        })
     }).catch(e => console.error("Background sync failed", e));
  }

  return updatedCourses;
};

export const updateDiagnosticCompletion = async (courseId: string, moduleId: string): Promise<Course[]> => {
    const courses = await getCourses();
    const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
            return {
                ...course,
                modules: course.modules.map(module => {
                    if (module.id === moduleId) {
                        return { ...module, diagnosticSubmitted: true };
                    }
                    return module;
                }),
            };
        }
        return course;
    });

    setLocalData(COURSES_KEY, updatedCourses);

    if (GOOGLE_SCRIPT_URL) {
      const user = await getUser();
      fetch(GOOGLE_SCRIPT_URL, {
         method: 'POST',
         body: JSON.stringify({
           action: 'updateProgress',
           user: { id: user.id },
           courses: updatedCourses
         })
      }).catch(e => console.error("Background sync failed", e));
   }

    return updatedCourses;
};
