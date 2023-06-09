import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeplacementComponent } from './deplacement.component';

describe('DeplacementComponent', () => {
  let component: DeplacementComponent;
  let fixture: ComponentFixture<DeplacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeplacementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeplacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
