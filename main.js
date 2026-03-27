import { fromEvent } from "rxjs";
import {
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
} from "rxjs/operators";
import { getCourses } from "./coursesService.js";
const searchInput = document.getElementById("search");
const listEl = document.getElementById("courses-list");

const search$ = fromEvent(searchInput, "input").pipe(
  map((e) => e.target.value.trim()),
  debounceTime(300),
  distinctUntilChanged(),
  startWith(""),
);
const results$ = search$.pipe(
  switchMap((query) =>
    getCourses().pipe(
      map((list) => {
        if (!query) return list;
        const q = query.toLowerCase();
        return list.filter((c) => c.title.toLowerCase().includes(q));
      }),
    ),
  ),
);

results$.subscribe(render);

function render(list) {
  if (!list || list.length === 0) {
    listEl.innerHTML = "<li>No courses found.</li>";
    return;
  }

  listEl.innerHTML = list
    .map(
      (c) =>
        `<li><strong>${escapeHtml(c.title)}</strong> — ${escapeHtml(c.category)} — ${escapeHtml(
          String(c.duration),
        )}h</li>`,
    )
    .join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"'`]/g, (ch) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#96;",
    }[ch];
  });
}
