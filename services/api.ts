
import { User, Course } from '../types';
import { MOCK_USER, MOCK_COURSES } from './seedData';

const USER_KEY = 'msl_user';
const COURSES_KEY = 'msl_courses';

// --- Helper functions to interact with localStorage ---

const getData = <T>(key: string): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return null;
  }
};

const setData = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key “${key}”:`, error);
  }
};

// --- API Service ---

// Simulate network delay
const apiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Seeds localStorage with mock data if it's not already there.
 */
export const initializeData = (): void => {
  if (!getData(USER_KEY)) {
    setData(USER_KEY, MOCK_USER);
  }
  if (!getData(COURSES_KEY)) {
    setData(COURSES_KEY, MOCK_COURSES);
  }
};

export const getUser = async (): Promise<User> => {
  await apiDelay(200);
  const user = getData<User>(USER_KEY);
  if (!user) throw new Error("User data not found.");
  return user;
};

export const getCourses = async (): Promise<Course[]> => {
  await apiDelay(200);
  const courses = getData<Course[]>(COURSES_KEY);
  if (!courses) throw new Error("Courses data not found.");
  return courses;
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    await apiDelay(300);
    setData(USER_KEY, updatedUser);
    return updatedUser;
};


export const updateKBCompletion = async (courseId: string, kbId: string): Promise<Course[]> => {
  await apiDelay(300);
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

  setData(COURSES_KEY, updatedCourses);
  return updatedCourses;
};

export const updateDiagnosticCompletion = async (courseId: string, moduleId: string): Promise<Course[]> => {
    await apiDelay(300);
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

    setData(COURSES_KEY, updatedCourses);
    return updatedCourses;
};
