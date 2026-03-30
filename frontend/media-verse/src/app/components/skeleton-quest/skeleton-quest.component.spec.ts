import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonQuestComponent } from './skeleton-quest.component';

describe('SkeletonQuestComponent', () => {
  let component: SkeletonQuestComponent;
  let fixture: ComponentFixture<SkeletonQuestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonQuestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonQuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
