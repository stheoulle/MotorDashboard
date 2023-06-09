import { TestBed } from '@angular/core/testing';

import { CoordService } from './coord.service';

describe('CoordService', () => {
  let service: CoordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
