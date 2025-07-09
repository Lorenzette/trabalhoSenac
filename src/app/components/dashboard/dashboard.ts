import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auths/auth';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import firebase from 'firebase/compat/app';

import { AngularFireFunctions } from '@angular/fire/compat/functions';

export interface CheckOverdueTasksResult {
  message: string;
  overdueCount: number;
  nearingDueCount: number;
  overdueTasks: { id: string; title: string; dueDate: string; }[];
  nearingDueTasks: { id: string; title: string; dueDate: string; }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  userEmail: string | null = null;
  currentUser$: Observable<firebase.User | null>;
  overdueTasksCount: number | null = null;
  nearingDueTasksCount: number | null = null;
  functionErrorMessage: string | null = null;


  constructor(
    private authService: AuthService,
    private router: Router,
    private fns: AngularFireFunctions
  ) {
    this.currentUser$ = this.authService.user;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
  }

  async onLogout(): Promise<void> {
    try {
      await firstValueFrom(this.authService.logout());
      alert('Logout realizado com sucesso!');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Por favor, tente novamente.');
    }
  }

  async checkMyOverdueTasks(): Promise<void> {
    this.functionErrorMessage = null;
    this.overdueTasksCount = null;
    this.nearingDueTasksCount = null;

    try {
      const callable = this.fns.httpsCallable<unknown, CheckOverdueTasksResult>('checkOverdueTasks');

      const result = await firstValueFrom(callable({})); 

      console.log('Resultado da função:', result);
      this.overdueTasksCount = result.overdueCount; 
      this.nearingDueTasksCount = result.nearingDueCount; 

      if (result.overdueCount > 0) {
          alert(`Você tem ${result.overdueCount} tarefa(s) vencida(s)!`);
      }
      if (result.nearingDueCount > 0) {
          alert(`Você tem ${result.nearingDueCount} tarefa(s) vencendo em breve!`);
      }
      if (result.overdueCount === 0 && result.nearingDueCount === 0) {
          alert('Ótimo! Nenhuma tarefa vencida ou vencendo em breve.');
      }

    } catch (error: any) {
      console.error('Erro ao chamar a Cloud Function:', error);
      this.functionErrorMessage = 'Erro ao verificar tarefas: ' + (error.message || 'Erro desconhecido');
      alert(`Erro ao verificar tarefas: ${this.functionErrorMessage}`);
    }
  }
}