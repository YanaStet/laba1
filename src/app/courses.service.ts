import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Course {
  id: number;
  title: string;
  category: string;
  duration: number;
}

const INITIAL_COURSES: Course[] = [
  {
    id: 1,
    title: 'Introduction to JavaScript',
    category: 'Programming',
    duration: 10,
  },
  {
    id: 2,
    title: 'Advanced TypeScript',
    category: 'Programming',
    duration: 12,
  },
  {
    id: 3,
    title: 'Reactive Programming with RxJS',
    category: 'Web',
    duration: 8,
  },
  {
    id: 4,
    title: 'Frontend Testing with Jest',
    category: 'Testing',
    duration: 6,
  },
  { id: 5, title: 'UX Fundamentals', category: 'Design', duration: 5 },
  { id: 6, title: 'Angular Basics', category: 'Framework', duration: 14 },
];

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private coursesSubject = new BehaviorSubject<Course[]>(INITIAL_COURSES);

  getCourses(): Observable<Course[]> {
    return this.coursesSubject.asObservable();
  }

  addCourse(course: Omit<Course, 'id'>): void {
    const current = this.coursesSubject.getValue();
    const maxId = current.length > 0 ? Math.max(...current.map((c) => c.id)) : 0;
    const newCourse: Course = { ...course, id: maxId + 1 };
    this.coursesSubject.next([...current, newCourse]);
  }

  updateCourse(updated: Course): void {
    const current = this.coursesSubject.getValue();
    const list = current.map((c) => (c.id === updated.id ? { ...updated } : c));
    this.coursesSubject.next(list);
  }

  deleteCourse(id: number): void {
    const current = this.coursesSubject.getValue();
    this.coursesSubject.next(current.filter((c) => c.id !== id));
  }
}
