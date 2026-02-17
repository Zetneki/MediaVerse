import { TestBed } from '@angular/core/testing';

import { MovieProgressService } from './movie-progress.service';

describe('MovieProgressService', () => {
  let service: MovieProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
