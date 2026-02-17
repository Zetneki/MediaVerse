import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMovieToLibrary } from './add-movie-to-library';

describe('AddMovieToLibrary', () => {
  let component: AddMovieToLibrary;
  let fixture: ComponentFixture<AddMovieToLibrary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMovieToLibrary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMovieToLibrary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
