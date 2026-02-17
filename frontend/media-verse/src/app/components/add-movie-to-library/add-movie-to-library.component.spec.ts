import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMovieToLibraryComponent } from './add-movie-to-library.component';

describe('AddMovieToLibraryComponent', () => {
  let component: AddMovieToLibraryComponent;
  let fixture: ComponentFixture<AddMovieToLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMovieToLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMovieToLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
