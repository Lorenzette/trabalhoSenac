import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register { 
  email!: string;
  password!: string;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  async onRegister(): Promise<void> {
    console.log('Tentando registrar com:', this.email);
    this.errorMessage = null;
    this.successMessage = null;

    try {
      await firstValueFrom(this.authService.register(this.email, this.password));

      this.successMessage = 'Registro realizado com sucesso! Você pode fazer login agora.';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao registrar:', error); 

      if (error && error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            this.errorMessage = 'Este email já está em uso.';
            break;
          case 'auth/weak-password':
            this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
            break;
          case 'auth/invalid-email': 
            this.errorMessage = 'O formato do email é inválido.';
            break;
          default:
            this.errorMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.';
            break;
        }
      } else if (error && error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Ocorreu um erro desconhecido ao registrar.';
      }
    }
  }
}