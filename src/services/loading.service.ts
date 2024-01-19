import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new Subject<boolean>();
  loadingAction$ = this.loadingSubject.asObservable();

  constructor(private global: GlobalService) {}

  showLoader() {
    //this.loadingSubject.next(true);
    this.global.showLoader();
  }

  hideLoader() {
    this.loadingSubject.next(false);
  }
}
