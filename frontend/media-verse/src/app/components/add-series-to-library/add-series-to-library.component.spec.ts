import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSeriesToLibraryComponent } from './add-series-to-library.component';

describe('AddSeriesToLibraryComponent', () => {
  let component: AddSeriesToLibraryComponent;
  let fixture: ComponentFixture<AddSeriesToLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSeriesToLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSeriesToLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
