import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, vi } from 'vitest';
import { Api } from '../../services/api';

import { ClientfileDetailed } from './clientfile-detailed';

describe('ClientfileDetailed', () => {
  let component: ClientfileDetailed;
  let fixture: ComponentFixture<ClientfileDetailed>;
  let apiMock: any;

  beforeEach(async () => {
    apiMock = {
      findOneClientfile: vi.fn().mockReturnValue(of({
        body: {
          id: 1,
          status: 'Pending',
          dateSubmitted: '2026-05-08',
          car: {
            id: 1,
            brand: 'Genesis',
            model: 'GV80',
            service: 'Leasing',
            price: 850,
            isAvailable: true,
            images: [],
          },
          user: {
            id: 1,
            surname: 'Doe',
            name: 'Jane',
            email: 'jane.doe@test.com',
            birthday: '1990-01-01',
          },
          identityCard: '',
          proofOfAddress: '',
          insurance: true,
          roadsideAssistance: true,
          maintenance: true,
          technicalControl: true,
        },
      })),
      updateClientfileStatus: vi.fn().mockReturnValue(of({
        body: {
          id: 1,
          status: 'Accepted',
          car: {
            id: 1,
            brand: 'Genesis',
            model: 'GV80',
            service: 'Leasing',
            price: 850,
            isAvailable: false,
            images: [],
          },
          user: {
            id: 1,
            surname: 'Doe',
            name: 'Jane',
            email: 'jane.doe@test.com',
            birthday: '1990-01-01',
          },
          identityCard: '',
          proofOfAddress: '',
          insurance: true,
          roadsideAssistance: true,
          maintenance: true,
          technicalControl: true,
        },
      })),
    };

    await TestBed.configureTestingModule({
      imports: [ClientfileDetailed],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 1 }),
            },
          },
        },
        {
          provide: Api,
          useValue: apiMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientfileDetailed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a success message when updating status', () => {
    vi.useFakeTimers();

    component.updateStatus('Accepted');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('.alert-success');

    expect(apiMock.updateClientfileStatus).toHaveBeenCalledWith(1, 'Accepted');
    expect(component.clientfile().status).toBe('Accepted');
    expect(component.clientfile().car.isAvailable).toBe(false);
    expect(component.clientfile().user.id).toBe(1);
    expect(component.successMessage()).toBe('Dossier client accepté.');
    expect(alert.textContent).toContain('Dossier client accepté.');

    vi.advanceTimersByTime(2500);
    expect(component.successMessage()).toBe('');
  });
});
