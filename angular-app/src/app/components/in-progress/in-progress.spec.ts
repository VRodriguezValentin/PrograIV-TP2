import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InProgress } from './in-progress';

describe('InProgress', () => {
  let component: InProgress;
  let fixture: ComponentFixture<InProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InProgress],
    }).compileComponents();

    fixture = TestBed.createComponent(InProgress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
