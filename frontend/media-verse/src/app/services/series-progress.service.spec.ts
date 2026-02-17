import { TestBed } from '@angular/core/testing';

import { SeriesProgressService } from './series-progress.service';

describe('SeriesProgressService', () => {
  let service: SeriesProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeriesProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
