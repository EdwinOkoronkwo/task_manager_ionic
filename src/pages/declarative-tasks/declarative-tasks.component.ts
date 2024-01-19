import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import {
  BehaviorSubject,
  EMPTY,
  catchError,
  combineLatest,
  map,
  tap,
} from 'rxjs';
import { DeclarativeTaskService } from '../../services/declarative-task.service';
import { DeclarativeCategoryService } from '../../services/declarative-category.service';
import { LoadingService } from '../../services/loading.service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GlobalService } from 'src/services/global.service';

@Component({
  selector: 'app-declarative-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './declarative-tasks.component.html',
  styleUrl: './declarative-tasks.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclarativeTasksComponent implements OnInit {
  selectedCategorySubject = new BehaviorSubject<number>(0);
  selectedCategoryAction$ = this.selectedCategorySubject.asObservable();
  selectedCategoryId!: number;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  tasks$ = this.taskService.tasksWithCategoriesAndCRUD$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );
  categories$ = this.categoryService.categories$;

  //Combining action stream from select with data stream from Students API
  filteredTasks$ = combineLatest([
    this.tasks$,
    this.selectedCategoryAction$,
  ]).pipe(
    tap((data) => {
      this.loadingService.hideLoader();
    }),
    map(([tasks, selectedCategoryId]) => {
      return tasks.filter((task) =>
        selectedCategoryId ? task.categoryId === selectedCategoryId : true
      );
    })
  );

  constructor(
    private taskService: DeclarativeTaskService,
    private categoryService: DeclarativeCategoryService,
    private loadingService: LoadingService,
    private global: GlobalService
  ) {}

  ngOnInit(): void {
    //this.loadingService.showLoader();
    this.global.showLoader();
  }

  onCategoryChange(event: Event) {
    let selectedCategoryId = parseInt(
      (event.target as HTMLSelectElement).value
    );
    this.selectedCategorySubject.next(selectedCategoryId);
  }
}
