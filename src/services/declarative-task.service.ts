import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CRUDAction, ITask } from '../models/ITask.model';
import { Observable, merge } from 'rxjs';
import {
  catchError,
  concatMap,
  delay,
  map,
  scan,
  shareReplay,
  tap,
} from 'rxjs/operators';
import { BehaviorSubject, Subject, combineLatest, of, throwError } from 'rxjs';
import { DeclarativeCategoryService } from './declarative-category.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class DeclarativeTaskService {
  tasks$ = this.http
    .get<ITask[]>('http://localhost:5000/tasks')
    .pipe(catchError(this.handleError), shareReplay(1));
  categories$ = this.categoryService.categories$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );
  progress_level$ = of(['Pending', 'Started', 'Completed']);
  priority_level$ = of(['Low', 'Medium', 'High']);

  // Combine two data streams
  tasksWithCategories$ = combineLatest([this.tasks$, this.categories$]).pipe(
    delay(2000),
    map(([tasks, categories]) => {
      return tasks.map((task) => {
        return {
          ...task,
          categoryName: categories.find(
            (category) => category.id === task.categoryId
          )?.title,
        } as ITask;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private taskCRUDSubject = new Subject<CRUDAction<ITask>>();
  taskCRUDAction$ = this.taskCRUDSubject.asObservable();

  private taskCRUDCompleteSubject = new Subject<boolean>();
  taskCRUDCompleteAction$ = this.taskCRUDCompleteSubject.asObservable();

  addTask(task: ITask) {
    this.taskCRUDSubject.next({ action: 'add', data: task });
  }

  updateTask(task: ITask) {
    this.taskCRUDSubject.next({ action: 'update', data: task });
  }

  deleteTask(task: ITask) {
    this.taskCRUDSubject.next({ action: 'delete', data: task });
  }

  // Need to merge students with CRUD actions
  tasksWithCategoriesAndCRUD$ = merge(
    this.tasksWithCategories$,
    this.taskCRUDAction$.pipe(
      concatMap((taskAction) =>
        this.saveTasks(taskAction).pipe(
          map((task) => ({ ...taskAction, data: task }))
        )
      )
    )
  ).pipe(
    scan((tasks, value: any) => {
      return this.modifyTasks(tasks, value);
    }, [] as ITask[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyTasks(tasks: ITask[], value: ITask[] | CRUDAction<ITask>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...tasks, value.data];
      }
      if (value.action === 'update') {
        return tasks.map((task) =>
          task.id === value.data.id ? value.data : task
        );
      }
      if (value.action === 'delete') {
        return tasks.filter((task) => task.id !== value.data.id);
      }
    } else {
      return value;
    }
    return tasks;
  }

  // save the students data to database
  saveTasks(taskAction: CRUDAction<ITask>) {
    let taskDetails$!: Observable<ITask>;
    if (taskAction.action === 'add') {
      taskDetails$ = this.addTaskToServer(taskAction.data).pipe(
        tap((task) => {
          this.notificationService.setSuccessMessage('Task Added Sucessfully!');
          this.taskCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (taskAction.action === 'update') {
      taskDetails$ = this.updateTaskToServer(taskAction.data).pipe(
        tap((task) => {
          this.notificationService.setSuccessMessage(
            'Task Updated Sucessfully!'
          );
          this.taskCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (taskAction.action === 'delete') {
      return this.deleteTaskToServer(taskAction.data)
        .pipe(
          tap((task) => {
            this.notificationService.setSuccessMessage(
              'Task Deleted Sucessfully!'
            );
            this.taskCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((task) => taskAction.data));
    }
    return taskDetails$.pipe(
      concatMap((task: any) =>
        this.categoryService.categories$.pipe(
          map((categories) => {
            return {
              ...task,
              categoryName: categories.find(
                (category) => category.id === task.categoryId
              )?.title,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addTaskToServer(task: ITask) {
    return this.http.post<ITask>('http://localhost:5000/tasks', task);
  }

  updateTaskToServer(task: ITask) {
    return this.http.patch<ITask>(
      `http://localhost:5000/tasks/${task.id}`,
      task
    );
  }

  deleteTaskToServer(task: ITask) {
    return this.http.delete<ITask>(`http://localhost:5000/tasks/${task.id}`);
  }

  /**************
   * Selecting a single task
   */
  private selectedTaskSubject = new BehaviorSubject<number>(0);
  selectedTaskAction$ = this.selectedTaskSubject.asObservable();

  selectTask(taskId: number) {
    this.selectedTaskSubject.next(taskId);
  }
  // Combine action data (from select) with data stream from task API
  task$ = combineLatest([
    this.tasksWithCategoriesAndCRUD$,
    this.selectedTaskAction$,
  ]).pipe(
    map(([tasks, selectedTaskId]) => {
      return tasks.find((task) => task.id === selectedTaskId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private categoryService: DeclarativeCategoryService,
    private notificationService: NotificationService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }
}
