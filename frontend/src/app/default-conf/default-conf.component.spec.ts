import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultConfComponent } from './default-conf.component';

describe('DefaultConfComponent', () => {
  let component: DefaultConfComponent;
  let fixture: ComponentFixture<DefaultConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultConfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
