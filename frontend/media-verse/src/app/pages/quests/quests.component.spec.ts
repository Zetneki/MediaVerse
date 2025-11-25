import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestsComponent } from './quests.component';

describe('QuestsComponent', () => {
  let component: QuestsComponent;
  let fixture: ComponentFixture<QuestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
