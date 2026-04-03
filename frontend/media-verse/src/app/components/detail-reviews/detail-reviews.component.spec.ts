import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailReviewsComponent } from './detail-reviews.component';

describe('DetailReviewsComponent', () => {
  let component: DetailReviewsComponent;
  let fixture: ComponentFixture<DetailReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
