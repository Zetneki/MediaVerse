import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonDetailsComponent } from './skeleton-details.component';

describe('SkeletonDetailsComponent', () => {
  let component: SkeletonDetailsComponent;
  let fixture: ComponentFixture<SkeletonDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
