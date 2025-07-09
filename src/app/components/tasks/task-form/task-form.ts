import { Component, OnInit } from '@angular/core';
import { Task, TaskService } from '../../../services/tasks/task';
import { Category, CategoryService } from '../../../services/categories/category';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs'; 

@Component({
  selector: 'app-task-form',
  standalone: false,
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.scss']
})
export class TaskForm implements OnInit {
  task: Task = {
    title: '',
    description: null,
    dueDate: null,
    priority: 'medium',
    completed: false,
    categoryId: '',
    userId: ''
  };
  taskId: string | null = null;
  isEditMode: boolean = false;
  categories$!: Observable<Category[]>; 
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.isEditMode = true;
      this.loadTask(this.taskId);
    }
  }

  async loadTask(id: string): Promise<void> {
    try {
      const taskData = await firstValueFrom(this.taskService.getTask(id)); 
      if (taskData) {
        this.task = taskData;
        if (this.task.dueDate) {
          let date = this.task.dueDate;
          if (typeof (date as any).toDate === 'function') {
            date = (date as any).toDate();
          } else if (!(date instanceof Date)) {
            date = new Date(date);
          }
          this.task.dueDate = date;
        }
      } else {
        this.errorMessage = 'Tarefa não encontrada.';
        setTimeout(() => this.router.navigate(['/tasks']), 3000);
      }
    } catch (error: any) {
      console.error('Erro ao carregar tarefa:', error);
      this.errorMessage = 'Erro ao carregar tarefa: ' + error.message;
    }
  }


  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.task.title.trim()) {
      this.errorMessage = 'O título da tarefa é obrigatório.';
      return;
    }
    if (!this.task.categoryId) {
      this.errorMessage = 'A categoria é obrigatória.';
      return;
    }

    try {
      if (this.isEditMode && this.taskId) {
        const updateData: Partial<Task> = {
          title: this.task.title,
          description: this.task.description,
          dueDate: this.task.dueDate || null,
          priority: this.task.priority,
          categoryId: this.task.categoryId
        };

        await this.taskService.updateTask(this.taskId, updateData); 
        this.successMessage = 'Tarefa atualizada com sucesso!';
      } else {
        await this.taskService.addTask(this.task); 
        this.successMessage = 'Tarefa adicionada com sucesso!';
        this.task = { title: '', description: null, dueDate: null, priority: 'medium', completed: false, categoryId: '', userId: '' };
      }
      setTimeout(() => {
        this.router.navigate(['/tasks']);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar tarefa:', error);
      this.errorMessage = 'Erro ao salvar tarefa: ' + error.message;
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  get formattedDueDate(): string {
    if (this.task.dueDate) {
      let date = this.task.dueDate;
      if (typeof (date as any).toDate === 'function') {
        date = (date as any).toDate();
      } else if (!(date instanceof Date)) {
        date = new Date(date);
      }
      return date.toISOString().split('T')[0];
    }
    return '';
  }

  set formattedDueDate(value: string) {
    this.task.dueDate = value ? new Date(value) : undefined;
  }
}