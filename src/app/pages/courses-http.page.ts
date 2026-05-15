import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CoursesHttpService } from '../services/courses-http.service';
import { Course } from '../models/course.model';

@Component({
  selector: 'app-courses-http-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="app-shell">
      <!-- Header -->
      <header class="header">
        <div class="header-inner">
          <h1 class="logo">
            <span class="logo-icon">🌐</span> Courses HTTP
          </h1>
          <div class="header-actions">
            <a routerLink="/" class="nav-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Manager
            </a>
            <span class="badge">HttpClient</span>
          </div>
        </div>
      </header>

      <main class="main">
        <!-- Page title -->
        <section class="page-intro">
          <h2 class="page-title">Courses from API</h2>
          <p class="page-subtitle">Data loaded via HTTP GET from <code>json-server</code> on port 3000</p>
        </section>

        <!-- Loading State -->
        <div class="state-container" *ngIf="isLoading">
          <div class="loading-card">
            <div class="spinner"></div>
            <p class="loading-text">Loading courses...</p>
            <span class="loading-sub">Fetching data from API</span>
          </div>
        </div>

        <!-- Error State -->
        <div class="state-container" *ngIf="errorMessage && !isLoading">
          <div class="error-card">
            <div class="error-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3 class="error-title">Failed to Load Courses</h3>
            <p class="error-message">{{ errorMessage }}</p>
            <button class="btn btn-retry" (click)="loadCourses()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Retry
            </button>
          </div>
        </div>

        <!-- Success State -->
        <div *ngIf="!isLoading && !errorMessage && courses.length > 0">
          <div class="results-bar">
            <p class="results-count">
              <span class="results-number">{{ courses.length }}</span>
              course{{ courses.length !== 1 ? 's' : '' }} loaded successfully
            </p>
          </div>

          <div class="courses-grid">
            <div
              *ngFor="let course of courses; trackBy: trackById"
              class="course-card"
            >
              <div class="card-accent" [attr.data-category]="course.category"></div>
              <div class="card-body">
                <div class="card-header">
                  <span class="category-badge" [attr.data-category]="course.category">
                    {{ course.category }}
                  </span>
                  <span class="duration-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {{ course.duration }}h
                  </span>
                </div>
                <h3 class="card-title">{{ course.title }}</h3>
                <div class="card-id">ID: {{ course.id }}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
    /* ===== Page Intro ===== */
    .page-intro {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.35rem;
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .page-subtitle code {
      background: var(--bg-input);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.85rem;
      color: var(--accent-light);
      border: 1px solid var(--border);
    }

    /* ===== Header Actions ===== */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      transition: all var(--transition);
    }

    .nav-link:hover {
      color: var(--text);
      border-color: var(--accent);
      background: var(--accent-glow);
    }

    /* ===== State Container ===== */
    .state-container {
      display: flex;
      justify-content: center;
      padding: 4rem 1rem;
    }

    /* ===== Loading ===== */
    .loading-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem 4rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      animation: fadeIn 0.3s ease;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text);
    }

    .loading-sub {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    /* ===== Error ===== */
    .error-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem 4rem;
      background: var(--bg-card);
      border: 1px solid rgba(255, 84, 112, 0.3);
      border-radius: var(--radius);
      box-shadow: 0 4px 24px rgba(255, 84, 112, 0.1);
      animation: fadeIn 0.3s ease;
      max-width: 480px;
      text-align: center;
    }

    .error-icon-wrapper {
      color: var(--danger);
      opacity: 0.8;
    }

    .error-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--danger);
    }

    .error-message {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .btn-retry {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(255, 84, 112, 0.3);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition);
      margin-top: 0.5rem;
    }

    .btn-retry:hover {
      background: rgba(255, 84, 112, 0.2);
      border-color: var(--danger);
      transform: translateY(-1px);
    }

    /* ===== Results Bar ===== */
    .results-bar {
      margin-bottom: 1.5rem;
    }

    .results-count {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .results-number {
      font-weight: 700;
      color: var(--success);
      font-size: 1rem;
    }

    /* ===== Courses Grid ===== */
    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }

    .course-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: all var(--transition);
      animation: fadeIn 0.4s ease forwards;
    }

    .course-card:hover {
      border-color: rgba(108, 99, 255, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      transform: translateY(-3px);
    }

    .card-accent {
      height: 4px;
      background: var(--accent);
      transition: height var(--transition);
    }

    .card-accent[data-category='Frontend'] {
      background: linear-gradient(90deg, #6c63ff, #38bdf8);
    }

    .card-accent[data-category='Backend'] {
      background: linear-gradient(90deg, #36d399, #34d399);
    }

    .card-accent[data-category='Programming'] {
      background: linear-gradient(90deg, #fbbf24, #fb923c);
    }

    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .category-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(108, 99, 255, 0.12);
      color: var(--accent-light);
    }

    .category-badge[data-category='Frontend'] {
      background: rgba(56, 189, 248, 0.12);
      color: #38bdf8;
    }

    .category-badge[data-category='Backend'] {
      background: rgba(54, 211, 153, 0.12);
      color: #36d399;
    }

    .category-badge[data-category='Programming'] {
      background: rgba(251, 191, 36, 0.12);
      color: #fbbf24;
    }

    .duration-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--bg-input);
      padding: 3px 10px;
      border-radius: 4px;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text);
      line-height: 1.4;
    }

    .card-id {
      font-size: 0.72rem;
      color: var(--text-secondary);
      opacity: 0.6;
      font-family: monospace;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    `,
  ],
})
export class CoursesHttpPage implements OnInit, OnDestroy {
  courses: Course[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  private subscription: Subscription | null = null;

  constructor(
    private coursesHttpService: CoursesHttpService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.subscription?.unsubscribe();

    this.subscription = this.coursesHttpService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage =
          'Could not connect to the API server. Make sure json-server is running on port 3000.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('HTTP error:', err);
      },
    });
  }

  trackById(_index: number, course: Course): number {
    return course.id;
  }
}
