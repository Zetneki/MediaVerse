import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlusEpisodeButtonComponent } from './plus-episode-button.component';

describe('PlusEpisodeButtonComponent', () => {
  let component: PlusEpisodeButtonComponent;
  let fixture: ComponentFixture<PlusEpisodeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlusEpisodeButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlusEpisodeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
