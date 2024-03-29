import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { DeclarativeTaskService } from '../../services/declarative-task.service';
import { DeclarativeCategoryService } from '../../services/declarative-category.service';
import { EMPTY, combineLatest } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonText,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { GlobalService } from 'src/services/global.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonList,
    IonItem,
    IonText,
    IonSelect,
    IonSelectOption,
    IonLabel,
    IonButton,
  ],
})
export class Tab3Page {
  isLoading = false;
  taskId!: number;
  priority_level$ = this.taskService.priority_level$;
  progress_level$ = this.taskService.progress_level$;
  categories$ = this.categoryService.categories$;

  taskForm: any = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    priority_level: new FormControl(''),
    progress_level: new FormControl(''),
    task_date: new FormControl(''),
    categoryId: new FormControl(''),
  });

  selectedTaskId$ = this.route.paramMap.pipe(
    map((paramMap) => {
      let id = paramMap.get('id');
      if (id) this.taskId = +id;
      this.taskService.selectTask(this.taskId);
    })
  );

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
    }),
    catchError((error) => {
      this.global.errorToast(error);
      //this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );
  notification$ = this.taskService.taskCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/tab1');
      }
    })
  );
  viewModel$ = combineLatest([
    this.selectedTaskId$,
    this.task$,
    this.notification$,
  ]);

  constructor(
    private categoryService: DeclarativeCategoryService,
    private taskService: DeclarativeTaskService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private global: GlobalService
  ) {}

  onTaskSubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let taskDetails = this.taskForm.value;
    if (this.taskId) {
      taskDetails = { ...taskDetails, id: this.taskId };
      this.taskService.updateTask(taskDetails);
      this.isLoading = false;
      this.global.hideLoader();
      this.router.navigateByUrl('/tabs/tab1');
      this.global.successToast('Task was updated successfully!');
    } else {
      this.taskService.addTask(taskDetails);
      this.global.successToast('Task was added successfully!');
      this.isLoading = false;
      this.global.hideLoader();
    }
  }

  // Getter
  get titleFormControl() {
    return this.taskForm.get('title');
    // return this.studentForm.controls['name'].value;
  }

  get descriptionFormControl() {
    return this.taskForm.get('description');
  }

  get priorityLevelFormControl() {
    return this.taskForm.get('priority_level');
  }

  get progressLevelFormControl() {
    return this.taskForm.get('progress_level');
  }
  get taskDateFormControl() {
    return this.taskForm.get('task_date');
  }
  get categoryIdFormControl() {
    return this.taskForm.get('categoryId');
  }
}
