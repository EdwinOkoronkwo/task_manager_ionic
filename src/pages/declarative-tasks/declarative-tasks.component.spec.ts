import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarativeTasksComponent } from './declarative-tasks.component';

describe('DeclarativeTasksComponent', () => {
  let component: DeclarativeTasksComponent;
  let fixture: ComponentFixture<DeclarativeTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarativeTasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarativeTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
