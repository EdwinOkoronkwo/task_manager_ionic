import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonItemGroup,
  IonText,
  IonTextarea,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { ITask } from 'src/models/ITask.model';
import { GlobalService } from 'src/services/global.service';
import { TaskFormComponent } from './task-form/task-form.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    CommonModule,
    RouterLink,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonItemGroup,
    IonText,
    ScrollingModule,
    ReactiveFormsModule,
    CommonModule,
    IonTextarea,
  ],
})
export class Tab1Page implements OnInit {
  isLoading = false;
  profile: any;
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
      this.isLoading = false;
      this.global.hideLoader();
      // this.loadingService.hideLoader();
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
    private router: Router,
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

  onDeleteTask(task: ITask) {
    this.global.showAlert(
      'Are you sure you want to delete this task?',
      'Confirm',
      [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('cancel');
            return;
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteTask(task);
          },
        },
      ]
    );
  }

  async deleteTask(task: any) {
    try {
      this.global.showLoader();
      await this.taskService.deleteTask(task);
      this.global.hideLoader();
      this.global.successToast('Task deleted successfully!');
    } catch (e: any) {
      console.log(e);
      this.global.hideLoader();
      let msg;
      if (e?.error?.message) {
        msg = e.error.message;
      }
      this.global.errorToast(msg);
    }
  }

  async modalAdd() {
    const options = {
      component: TaskFormComponent,
      componentProps: {
        from: 'tab1',
      },
      cssClass: 'custom-modal',
      swipeToClose: true,
    };
    await this.global.createModal(options);
  }

  goToUpdate(id: number) {
    this.router.navigateByUrl(`/tabs/tab3/edit-task/${id}`);
  }
}

// async getAddresses() {
//   try {
//     this.isLoading = true;
//     this.global.showLoader();
//     await this.addressService.getAddresses();
//     console.log(this.addresses);
//     this.isLoading = false;
//     this.global.hideLoader();
//   } catch (e) {
//     this.isLoading = false;
//     this.global.hideLoader();
//     let msg;
//     if (e?.error?.message) {
//       msg = e.error.message;
//     }
//     this.global.errorToast(msg);
//   }
