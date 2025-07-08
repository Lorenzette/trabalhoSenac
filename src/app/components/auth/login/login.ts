import { Component } from '@angular/core';
import { AuthService } from '../../../services/auths/auth';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs'; 

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email!: string;
  password!: string;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  async onLogin(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    try {
      await firstValueFrom(this.authService.login(this.email, this.password)); 
      this.successMessage = 'Login realizado com sucesso!';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      if (error && error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            this.errorMessage = 'Email ou senha incorretos.';
            break;
          case 'auth/invalid-email':
            this.errorMessage = 'Formato de email inválido.';
            break;
          case 'auth/user-disabled':
            this.errorMessage = 'Esta conta de usuário foi desativada.';
            break;
          default:
            this.errorMessage = 'Ocorreu um erro inesperado ao fazer login. Por favor, tente novamente.';
            break;
        }
      } else if (error && error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Ocorreu um erro desconhecido ao fazer login.';
      }
    }
  }

  async onGoogleLogin(): Promise<void> {
    console.log('Tentando login com Google...');
    this.errorMessage = null;
    this.successMessage = null;

    try {
      await firstValueFrom(this.authService.loginWithGoogle()); 
      this.successMessage = 'Login com Google realizado com sucesso!';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao fazer login com Google:', error);
      if (error && error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            this.errorMessage = 'Login com Google cancelado.';
            break;
          case 'auth/cancelled-popup-request':
            this.errorMessage = 'Solicitação de pop-up de login com Google já em andamento.';
            break;
          default:
            this.errorMessage = 'Ocorreu um erro inesperado ao fazer login com Google. Por favor, tente novamente.';
            break;
        }
      } else if (error && error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Ocorreu um erro desconhecido ao fazer login com Google.';
      }
    }
  }
}