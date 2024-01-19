import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeclarativeCategoryService } from '../../services/declarative-category.service';
import { DeclarativeTaskService } from '../../services/declarative-task.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { startWith } from 'rxjs/operators';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonSelectOption,
  IonButton,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { GlobalService } from 'src/services/global.service';
import { IonButtons, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    ReactiveFormsModule,
    ExploreContainerComponent,
    FormsModule,
    IonText,
    IonList,
    IonItem,
    IonLabel,
    IonSelectOption,
    IonLabel,
    IonButton,
  ],
})
export class Tab2Page {
  //taskForm!: FormGroup;
  priority_level = new Set(['Low', 'Medium', 'High']);
  progress_level = new Set(['Pending', 'Started', 'Completed']);
  categories$ = this.categoryService.categories$;
  progress_level$ = this.taskService.progress_level$;
  priority_level$ = this.taskService.priority_level$;

  constructor(
    private categoryService: DeclarativeCategoryService,
    private taskService: DeclarativeTaskService,
    private formBuilder: FormBuilder
  ) {
    // this.taskForm = formBuilder.group({
    //   title: ['', [Validators.required, Validators.minLength(3)]],
    //   description: ['', [Validators.required]],
    //   priority_level: ['', [Validators.required]],
    //   progress_level: ['', [Validators.required]],
    //   categoryId: ['', [Validators.required]],
    //   ptask_date: ['', [Validators.required]],
    // });
  }

  taskForm = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    priority_level: new FormControl(''),
    progress_level: new FormControl(''),
    task_date: new FormControl(''),
    categoryId: new FormControl(''),
  }) as any;

  notification$ = this.taskService.taskCRUDCompleteAction$.pipe(
    startWith(false)
  );

  onAddTask() {
    this.taskService.addTask(this.taskForm.value);
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
