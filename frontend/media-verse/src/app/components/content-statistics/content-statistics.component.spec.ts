import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentStatisticsComponent } from './content-statistics.component';

describe('ContentStatisticsComponent', () => {
  let component: ContentStatisticsComponent;
  let fixture: ComponentFixture<ContentStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
