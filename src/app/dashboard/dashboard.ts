import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  userEmail: string | null = null;
  currentUser$: Observable<firebase.User | null>;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.user;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
  }

  async onLogout(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    try {
      await firstValueFrom(this.authService.logout());
      this.successMessage = 'Logout realizado com sucesso!';
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      this.errorMessage = 'Erro ao fazer logout. Por favor, tente novamente.';
    }
  }
}
