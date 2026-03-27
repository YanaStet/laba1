import { of } from "rxjs";

const courses = [
  {
    id: 1,
    title: "Introduction to JavaScript",
    category: "Programming",
    duration: 10,
  },
  {
    id: 2,
    title: "Advanced TypeScript",
    category: "Programming",
    duration: 12,
  },
  {
    id: 3,
    title: "Reactive Programming with RxJS",
    category: "Web",
    duration: 8,
  },
  {
    id: 4,
    title: "Frontend Testing with Jest",
    category: "Testing",
    duration: 6,
  },
  { id: 5, title: "UX Fundamentals", category: "Design", duration: 5 },
  { id: 6, title: "Angular Basics", category: "Framework", duration: 14 },
];

// Simulate a service that returns an Observable of courses
export function getCourses() {
  // In a real app this could be an http call returning from(fetch(...))
  return of(courses);
}

export default { getCourses };
