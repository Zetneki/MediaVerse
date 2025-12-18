import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverDropdownComponent } from './discover-dropdown.component';

describe('DiscoverDropdownComponent', () => {
  let component: DiscoverDropdownComponent;
  let fixture: ComponentFixture<DiscoverDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscoverDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
