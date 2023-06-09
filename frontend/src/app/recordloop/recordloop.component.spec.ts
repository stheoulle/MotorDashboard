import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordloopComponent } from './recordloop.component';

describe('RecordloopComponent', () => {
  let component: RecordloopComponent;
  let fixture: ComponentFixture<RecordloopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordloopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordloopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
