import { Component } from '@angular/core';
import { AuthService } from '../../services/auth'; 
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs'; 


@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'] 
})
export class ForgotPassword { 
  email!: string;
  message: string | null = null;       
  errorMessage: string | null = null;  

  constructor(private authService: AuthService, private router: Router) { }

  async onResetPassword(): Promise<void> {
    this.message = null;
    this.errorMessage = null; 
    try {
      await firstValueFrom(this.authService.sendPasswordResetEmail(this.email));

      this.message = 'Se um usuário com este email existir, um link de redefinição de senha foi enviado para ele.';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 5000); 
    } catch (error: any) {
      console.error('Erro ao enviar email de redefinição:', error);
      this.errorMessage = error.message; 

      if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'O formato do email é inválido.';
      } else if (error.code === 'auth/user-not-found') {
        this.message = 'Se um usuário com este email existir, um link de redefinição de senha foi enviado para ele.';
      }
    }
  }
}