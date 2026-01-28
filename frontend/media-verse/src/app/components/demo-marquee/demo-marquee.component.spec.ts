import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoMarqueeComponent } from './demo-marquee.component';

describe('DemoMarqueeComponent', () => {
  let component: DemoMarqueeComponent;
  let fixture: ComponentFixture<DemoMarqueeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoMarqueeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoMarqueeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
