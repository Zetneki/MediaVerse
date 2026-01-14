import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToLibraryComponent } from './add-to-library.component';

describe('AddToLibraryComponent', () => {
  let component: AddToLibraryComponent;
  let fixture: ComponentFixture<AddToLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
