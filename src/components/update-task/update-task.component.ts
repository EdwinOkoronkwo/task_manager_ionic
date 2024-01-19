import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeclarativeTaskService } from '../../services/declarative-task.service';
import { DeclarativeCategoryService } from '../../services/declarative-category.service';
import { startWith, tap } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-update-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-task.component.html',
  styleUrl: './update-task.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateTaskComponent {
  taskId!: number;
  priority_level$ = this.taskService.priority_level$;
  progress_level$ = this.taskService.progress_level$;
  task$ = this.taskService.task$.pipe(
    tap((task: any) => {
      if (task) this.taskId = task.id;
      task &&
        this.taskForm.setValue({
          title: task?.title,
          description: task?.description,
          priority_level: task?.priority_level,
          progress_level: task?.progress_level,
          task_date: task?.task_date,
          categoryId: task?.categoryId,
        });
    })
  );
  taskForm = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    priority_level: new FormControl(''),
    progress_level: new FormControl(''),
    task_date: new FormControl(''),
    categoryId: new FormControl(''),
  }) as any;

  categories$ = this.categoryService.categories$;

  notification$ = this.taskService.taskCRUDCompleteAction$.pipe(
    startWith(false)
  );
  viewModel$ = combineLatest([this.task$, this.notification$]);

  constructor(
    private categoryService: DeclarativeCategoryService,
    private taskService: DeclarativeTaskService
  ) {}

  onUpdateTask() {
    let taskDetails = {
      ...this.taskForm.value,
      id: this.taskId,
    };

    this.taskService.updateTask(taskDetails);
  }
}
