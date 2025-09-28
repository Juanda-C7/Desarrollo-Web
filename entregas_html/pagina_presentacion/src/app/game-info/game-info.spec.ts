import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInfo } from './game-info';

describe('GameInfo', () => {
  let component: GameInfo;
  let fixture: ComponentFixture<GameInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
