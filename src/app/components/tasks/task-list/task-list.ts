import { Component, OnInit } from '@angular/core';
import { Task, TaskService } from '../../../services/tasks/task';
import { Category, CategoryService } from '../../../services/categories/category';
import { Observable, combineLatest, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss']
})
export class TaskList implements OnInit {
  tasksWithCategory$!: Observable<(Task & { categoryName: string })[]>;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tasksWithCategory$ = combineLatest([
      this.taskService.getTasks(),
      this.categoryService.getCategories()
    ]).pipe(
      map(([tasks, categories]) => {
        return tasks.map(task => {
          const category = categories.find(cat => cat.id === task.categoryId);
          return { ...task, categoryName: category ? category.name : 'Sem Categoria' };
        });
      })
    );
  }

  onAddTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  onEditTask(taskId: string | undefined): void {
    if (taskId) {
      this.router.navigate(['/tasks/edit', taskId]);
    } else {
      this.errorMessage = 'ID da tarefa não encontrado para edição.';
    }
  }

  async onToggleCompleted(task: Task): Promise<void> {
    try {
      await this.taskService.updateTask(task.id!, { completed: !task.completed });
      this.successMessage = `Tarefa "${task.title}" marcada como ${task.completed ? 'pendente' : 'concluída'}!`;
      setTimeout(() => this.successMessage = null, 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar status da tarefa:', error);
      this.errorMessage = 'Erro ao atualizar status: ' + error.message;
      setTimeout(() => this.errorMessage = null, 5000);
    }
  }

  async onDeleteTask(taskId: string | undefined, taskTitle: string): Promise<void> {
    if (!taskId) {
      this.errorMessage = 'ID da tarefa não encontrado para exclusão.';
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}"?`)) {
      try {
        await this.taskService.deleteTask(taskId);
        this.successMessage = `Tarefa "${taskTitle}" excluída com sucesso!`;
        setTimeout(() => this.successMessage = null, 3000);
      } catch (error: any) {
        console.error('Erro ao excluir tarefa:', error);
        this.errorMessage = 'Erro ao excluir tarefa: ' + error.message;
        setTimeout(() => this.errorMessage = null, 5000);
      }
    }
  }

  formatDate(dateValue: Date | null | undefined): string {
    if (!dateValue) {
      return '';
    }

    let date: Date;

    if (typeof (dateValue as any).toDate === 'function') {
      date = (dateValue as any).toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      try {
        date = new Date(dateValue);
      } catch (e) {
        console.error('Não foi possível converter a data:', dateValue, e);
        return 'Data Inválida';
      }
    }

    if (isNaN(date.getTime())) {
      return 'Data Inválida';
    }

    return date.toLocaleDateString('pt-BR');
  }
}