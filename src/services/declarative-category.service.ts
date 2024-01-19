import { Injectable } from '@angular/core';
import { ICategory } from '../models/ICategory.model';
import { shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DeclarativeCategoryService {
  categories$ = this.http
    .get<ICategory[]>('http://localhost:5000/categories')
    .pipe(shareReplay(1));

  constructor(private http: HttpClient) {}
}
