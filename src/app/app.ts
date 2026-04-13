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
import { Subscription, fromEvent, combineLatest, BehaviorSubject } from 'rxjs';
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
          <span class="badge">combineLatest</span>
        </div>
      </header>

      <main class="main">
        <!-- Filter Section -->
        <section class="filter-section">
          <div class="filter-bar">
            <!-- Search by title -->
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

            <!-- Filter by category -->
            <div class="category-filter-wrapper">
              <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <select
                id="categoryFilter"
                class="category-select"
                (change)="onCategoryChange($event)"
              >
                <option value="">All Categories</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <!-- Active filters display -->
          <div class="filter-status">
            <p class="results-count">
              {{ coursesList.length }} course{{ coursesList.length !== 1 ? 's' : '' }} found
            </p>
            <div class="active-filters" *ngIf="activeSearchTerm || activeCategory">
              <span class="filter-label">Active filters:</span>
              <span class="filter-chip" *ngIf="activeSearchTerm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                "{{ activeSearchTerm }}"
              </span>
              <span class="filter-chip filter-chip-category" *ngIf="activeCategory">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                {{ activeCategory }}
              </span>
            </div>
          </div>
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
                <span>Try a different search or category filter.</span>
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

  activeSearchTerm = '';
  activeCategory = '';

  categories = ['Programming', 'Web', 'Testing', 'Design', 'Framework', 'DevOps', 'Data Science'];

  /** BehaviorSubject for the category filter stream */
  private categorySubject$ = new BehaviorSubject<string>('');

  private subscription!: Subscription;

  constructor(
    private coursesService: CoursesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Stream 1: search text from the input element
    const search$ = fromEvent(this.searchInputRef.nativeElement, 'input').pipe(
      map((e) => (e.target as HTMLInputElement).value.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
    );

    // Stream 2: selected category from the BehaviorSubject
    const category$ = this.categorySubject$.pipe(
      distinctUntilChanged(),
    );

    // Combine all three streams: courses data + search text + category filter
    const results$ = combineLatest([
      this.coursesService.getCourses(),
      search$,
      category$,
    ]).pipe(
      map(([list, query, category]) => {
        // Track active filters for the UI
        this.activeSearchTerm = query;
        this.activeCategory = category;

        let filtered = list;

        // Filter by title (search)
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter((c) => c.title.toLowerCase().includes(q));
        }

        // Filter by category
        if (category) {
          filtered = filtered.filter((c) => c.category === category);
        }

        return filtered;
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

  /** Handle category select change */
  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.categorySubject$.next(value);
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
