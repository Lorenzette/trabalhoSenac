import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthGuard } from '../guards/auth-guard';
import { AuthService } from '../services/auths/auth'; 
import { Observable, of } from 'rxjs';
import { provideRouter } from '@angular/router'; 

type MockFirebaseUser = { uid: string; email: string | null; emailVerified: boolean; };

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [], ['user']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]), 
      ],
    });

    authGuard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);

    Object.defineProperty(authServiceSpy, 'user', {
      writable: true,
      value: of(null)
    });
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should allow activation if user is logged in', (done) => {
    Object.defineProperty(authServiceSpy, 'user', {
      writable: true,
      value: of({ uid: 'test-uid', email: 'test@example.com', emailVerified: true } as MockFirebaseUser)
    });

    (authGuard.canActivate({} as any, {} as any) as Observable<boolean | UrlTree>).subscribe((result: boolean | UrlTree) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should redirect to login if user is not logged in', (done) => {
    const createUrlTreeSpy = spyOn(router, 'createUrlTree').and.returnValue('/login' as any);

    (authGuard.canActivate({} as any, {} as any) as Observable<boolean | UrlTree>).subscribe((urlTree: boolean | UrlTree) => {
      expect(urlTree.toString()).toEqual('/login');
      expect(createUrlTreeSpy).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should redirect to login if email is not verified (if guard checks for it)', (done) => {
    Object.defineProperty(authServiceSpy, 'user', {
      writable: true,
      value: of({ uid: 'test-uid', email: 'test@example.com', emailVerified: false } as MockFirebaseUser)
    });

    const createUrlTreeSpy = spyOn(router, 'createUrlTree').and.returnValue('/login' as any);

    (authGuard.canActivate({} as any, {} as any) as Observable<boolean | UrlTree>).subscribe((urlTree: boolean | UrlTree) => {
      expect(urlTree.toString()).toEqual('/login');
      expect(createUrlTreeSpy).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});