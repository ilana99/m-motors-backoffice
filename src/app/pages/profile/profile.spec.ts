import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profile } from './profile';
import { of, throwError } from 'rxjs';
import { Api } from '../../services/api';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let getProfileSpy: any;

  const user = {
    surname: 'Marie',
    name: 'Maria',
    birthday: '1998-01-01',
    email: 'user@gmail.com',
  };

  beforeEach(async () => {
    getProfileSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        {
          provide: Api,
          useValue: {
            getProfile: getProfileSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the user profile on init', () => {
    getProfileSpy.mockReturnValue(of({ body: user }));

    component.ngOnInit();

    expect(getProfileSpy).toHaveBeenCalled();
    expect(component.user()).toEqual(user);
  });

  it('should display the user profile', () => {
    getProfileSpy.mockReturnValue(of({ body: user }));

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Marie');
    expect(fixture.nativeElement.textContent).toContain('Maria');
    expect(fixture.nativeElement.textContent).toContain('1998-01-01');
    expect(fixture.nativeElement.textContent).toContain('user@gmail.com');
  });

  it('should log error when loading profile fails', () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const error = new Error('');
    getProfileSpy.mockReturnValue(throwError(() => error));

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });
});
