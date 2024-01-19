import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeclarativeCategoryService } from '../../services/declarative-category.service';
import { DeclarativeTaskService } from '../../services/declarative-task.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTaskComponent {
  categories$ = this.categoryService.categories$;
  progress_level$ = this.taskService.progress_level$;
  priority_level$ = this.taskService.priority_level$;

  taskForm: any = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    priority_level: new FormControl(''),
    progress_level: new FormControl(''),
    task_date: new FormControl(''),
    categoryId: new FormControl(''),
  });

  notification$ = this.taskService.taskCRUDCompleteAction$.pipe(
    startWith(false)
  );

  constructor(
    private categoryService: DeclarativeCategoryService,
    private taskService: DeclarativeTaskService
  ) {}

  onAddTask() {
    this.taskService.addTask(this.taskForm.value);
  }
}
