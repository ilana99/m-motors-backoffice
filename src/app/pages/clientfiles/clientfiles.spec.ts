import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Api } from '../../services/api';

import { Clientfiles } from './clientfiles';

describe('Clientfiles', () => {
  let component: Clientfiles;
  let fixture: ComponentFixture<Clientfiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientfiles],
      providers: [
        {
          provide: Api,
          useValue: {
            findAllClientfiles: vi.fn().mockReturnValue(of({ body: [] })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Clientfiles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
