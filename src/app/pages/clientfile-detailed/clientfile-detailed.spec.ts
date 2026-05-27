import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, vi } from 'vitest';
import { Api } from '../../services/api';
import { ClientfileDetailed } from './clientfile-detailed';

describe('ClientfileDetailed', () => {
  let component: ClientfileDetailed;
  let fixture: ComponentFixture<ClientfileDetailed>;
  let apiMock: any;
  let queryParamMap = convertToParamMap({});
  const clientfile = {
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
      surname: 'Marie',
      name: 'Maria',
      email: 'user@gmail.com',
      birthday: '1990-01-01',
    },
    identityCard: 'identity-card.jpg',
    proofOfAddress: 'proof-of-address.jpg',
    insurance: true,
    roadsideAssistance: true,
    maintenance: true,
    technicalControl: true,
  };

  beforeEach(async () => {
    apiMock = {
      findOneClientfile: vi.fn().mockReturnValue(of({
        body: clientfile,
      })),
      updateClientfileStatus: vi.fn().mockReturnValue(of({
        body: {
          id: 1,
          status: 'Accepted',
          dateSubmitted: '2026-05-08',
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
            surname: 'Marie',
            name: 'Maria',
            email: 'user@gmail.com',
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
    queryParamMap = convertToParamMap({});

    await TestBed.configureTestingModule({
      imports: [ClientfileDetailed],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 1 }),
              get queryParamMap() {
                return queryParamMap;
              },
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

  it('should load the client file on init', () => {
    component.ngOnInit();

    expect(apiMock.findOneClientfile).toHaveBeenCalledWith(1);
    expect(component.clientfile()).toEqual(clientfile);
  });

  it('should display the client file', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Dossier client #1');
    expect(fixture.nativeElement.textContent).toContain('Déposé le 2026-05-08');
    expect(fixture.nativeElement.textContent).toContain('En cours de traitement');
    expect(fixture.nativeElement.textContent).toContain('Genesis GV80');
    expect(fixture.nativeElement.textContent).toContain('Location');
    expect(fixture.nativeElement.textContent).toContain('Marie Maria');
    expect(fixture.nativeElement.textContent).toContain('user@gmail.com');
    expect(fixture.nativeElement.textContent).toContain('Assurance tout risque: Oui');
  });

  it('should return client files as the default back link', () => {
    expect(component.getBackLink()).toEqual(['/dossiers']);
  });

  it('should return the car detail back link when coming from a car', () => {
    queryParamMap = convertToParamMap({ fromCarId: '1' });

    expect(component.getBackLink()).toEqual(['/stock', '1']);
  });

  it('should return display labels for known statuses', () => {
    expect(component.getStatusLabel('Pending')).toBe('En cours de traitement');
    expect(component.getStatusLabel('Accepted')).toBe('Accepté');
    expect(component.getStatusLabel('Rejected')).toBe('Rejeté');
    expect(component.getStatusLabel('Canceled')).toBe('Annulé');
  });

  it('should return the status when no display label exists', () => {
    expect(component.getStatusLabel('Unknown')).toBe('Unknown');
  });

  it('should return display labels for known services', () => {
    expect(component.getServiceLabel('Leasing')).toBe('Location');
    expect(component.getServiceLabel('Sale')).toBe('Vente');
  });

  it('should display a sale client file', () => {
    component.clientfile.set({
      ...clientfile,
      car: {
        ...clientfile.car,
        service: 'Sale',
      },
      insurance: false,
      roadsideAssistance: false,
      maintenance: false,
      technicalControl: false,
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Vente');
    expect(fixture.nativeElement.textContent).toContain('850 €');
    expect(fixture.nativeElement.textContent).toContain('Assurance tout risque: Non');
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

  it('should not update status when the car is unavailable', () => {
    component.clientfile.update((clientfile) => ({
      ...clientfile,
      car: {
        ...clientfile.car,
        isAvailable: false,
      },
    }));

    component.updateStatus('Accepted');

    expect(apiMock.updateClientfileStatus).not.toHaveBeenCalled();
  });

  it('should log an error when the client file does not load', () => {
    const error = { status: 404 };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    apiMock.findOneClientfile.mockReturnValue(throwError(() => error));

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith(error);

    consoleSpy.mockRestore();
  });
});
