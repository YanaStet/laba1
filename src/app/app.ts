import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
} from 'rxjs/operators';
import { CoursesService, Course } from './courses.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  template: `
    <main>
      <p>
        <input
          #searchInput
          id="search"
          type="search"
          placeholder="Type to search courses..."
        />
      </p>
      <ul id="courses-list">
        <li *ngIf="coursesList.length === 0">No courses found.</li>
        <li *ngFor="let c of coursesList">
          <strong>{{ c.title }}</strong> — {{ c.category }} — {{ c.duration }}h
        </li>
      </ul>
    </main>
  `,
  styles: [],
})
export class App implements OnInit, OnDestroy {
  @ViewChild('searchInput', { static: true })
  searchInputRef!: ElementRef<HTMLInputElement>;

  coursesList: Course[] = [];
  private subscription!: Subscription;

  constructor(
    private coursesService: CoursesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const search$ = fromEvent(this.searchInputRef.nativeElement, 'input').pipe(
      map((e) => (e.target as HTMLInputElement).value.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
    );

    const results$ = search$.pipe(
      switchMap((query) =>
        this.coursesService.getCourses().pipe(
          map((list) => {
            if (!query) return list;
            const q = query.toLowerCase();
            return list.filter((c) => c.title.toLowerCase().includes(q));
          }),
        ),
      ),
    );

    this.subscription = results$.subscribe((list) => {
      this.coursesList = list;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
