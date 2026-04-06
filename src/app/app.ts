import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, fromEvent, combineLatest } from 'rxjs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  startWith,
} from 'rxjs/operators';
import { CoursesService, Course } from './courses.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-shell">
      <!-- Header -->
      <header class="header">
        <div class="header-inner">
          <h1 class="logo">
            <span class="logo-icon">📚</span> Courses Manager
          </h1>
          <span class="badge">BehaviorSubject</span>
        </div>
      </header>

      <main class="main">
        <!-- Search bar -->
        <section class="search-section">
          <div class="search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              #searchInput
              id="search"
              type="search"
              class="search-input"
              placeholder="Search courses by title..."
            />
          </div>
          <p class="results-count">{{ coursesList.length }} course{{ coursesList.length !== 1 ? 's' : '' }} found</p>
        </section>

        <div class="content-grid">
          <!-- Course Form -->
          <aside class="form-panel">
            <div class="panel-card">
              <h2 class="panel-title">
                {{ editingCourse ? 'Edit Course' : 'New Course' }}
              </h2>

              <form (ngSubmit)="onSubmit()" class="course-form">
                <div class="field">
                  <label for="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    [(ngModel)]="formTitle"
                    name="title"
                    placeholder="e.g. Advanced Angular"
                    required
                  />
                </div>

                <div class="field">
                  <label for="category">Category</label>
                  <select
                    id="category"
                    [(ngModel)]="formCategory"
                    name="category"
                    required
                  >
                    <option value="" disabled>Select category</option>
                    <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                  </select>
                </div>

                <div class="field">
                  <label for="duration">Duration (hours)</label>
                  <input
                    id="duration"
                    type="number"
                    [(ngModel)]="formDuration"
                    name="duration"
                    placeholder="e.g. 10"
                    min="1"
                    required
                  />
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" [disabled]="!isFormValid()">
                    {{ editingCourse ? 'Save Changes' : 'Add Course' }}
                  </button>
                  <button
                    *ngIf="editingCourse"
                    type="button"
                    class="btn btn-ghost"
                    (click)="cancelEdit()"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </aside>

          <!-- Course List -->
          <section class="list-panel">
            <div class="courses-grid" *ngIf="coursesList.length > 0; else emptyState">
              <div
                *ngFor="let c of coursesList; trackBy: trackById"
                class="course-card"
                [class.editing]="editingCourse?.id === c.id"
              >
                <div class="card-header">
                  <span class="category-badge" [attr.data-category]="c.category">
                    {{ c.category }}
                  </span>
                  <span class="duration-badge">{{ c.duration }}h</span>
                </div>
                <h3 class="card-title">{{ c.title }}</h3>
                <div class="card-actions">
                  <button class="btn btn-sm btn-edit" (click)="startEdit(c)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button class="btn btn-sm btn-delete" (click)="deleteCourse(c.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <ng-template #emptyState>
              <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <p>No courses found.</p>
                <span>Try a different search or add a new course.</span>
              </div>
            </ng-template>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [],
})
export class App implements OnInit, OnDestroy {
  @ViewChild('searchInput', { static: true })
  searchInputRef!: ElementRef<HTMLInputElement>;

  coursesList: Course[] = [];
  editingCourse: Course | null = null;

  formTitle = '';
  formCategory = '';
  formDuration: number | null = null;

  categories = ['Programming', 'Web', 'Testing', 'Design', 'Framework', 'DevOps', 'Data Science'];

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

    const results$ = combineLatest([
      this.coursesService.getCourses(),
      search$,
    ]).pipe(
      map(([list, query]) => {
        if (!query) return list;
        const q = query.toLowerCase();
        return list.filter((c) => c.title.toLowerCase().includes(q));
      }),
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

  isFormValid(): boolean {
    return (
      this.formTitle.trim().length > 0 &&
      this.formCategory.length > 0 &&
      this.formDuration !== null &&
      this.formDuration > 0
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    if (this.editingCourse) {
      this.coursesService.updateCourse({
        id: this.editingCourse.id,
        title: this.formTitle.trim(),
        category: this.formCategory,
        duration: this.formDuration!,
      });
      this.editingCourse = null;
    } else {
      this.coursesService.addCourse({
        title: this.formTitle.trim(),
        category: this.formCategory,
        duration: this.formDuration!,
      });
    }

    this.resetForm();
  }

  startEdit(course: Course): void {
    this.editingCourse = course;
    this.formTitle = course.title;
    this.formCategory = course.category;
    this.formDuration = course.duration;
  }

  cancelEdit(): void {
    this.editingCourse = null;
    this.resetForm();
  }

  deleteCourse(id: number): void {
    if (this.editingCourse?.id === id) {
      this.editingCourse = null;
      this.resetForm();
    }
    this.coursesService.deleteCourse(id);
  }

  trackById(_index: number, course: Course): number {
    return course.id;
  }

  private resetForm(): void {
    this.formTitle = '';
    this.formCategory = '';
    this.formDuration = null;
  }
}
