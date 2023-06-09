import { TestBed } from '@angular/core/testing';

import { OnSelectMoveService } from './on-select-move.service';

describe('OnSelectMoveService', () => {
  let service: OnSelectMoveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnSelectMoveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
