import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Course {
  id: number;
  title: string;
  category: string;
  duration: number;
}

const courses: Course[] = [
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
  // Simulate a service that returns an Observable of courses
  // In a real app this could be an http call returning from(fetch(...))
  getCourses(): Observable<Course[]> {
    return of(courses);
  }
}
