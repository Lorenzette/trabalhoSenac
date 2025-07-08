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
  task: Task = { title: '', completed: false, categoryId: '', userId: '' };
  taskId: string | null = null;
  isEditMode: boolean = false;
  categories$!: Observable<Category[]>;
  selectedFile: File | null = null;
  attachmentPreviewUrl: string | null = null;
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
          let dueDate = this.task.dueDate;
          if (typeof (dueDate as any).toDate === 'function') {
            dueDate = (dueDate as any).toDate();
          } else if (!(dueDate instanceof Date)) {
            dueDate = new Date(dueDate);
          }
          this.task.dueDate = dueDate;
          this.attachmentPreviewUrl = this.task.attachmentUrl || null;
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

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.attachmentPreviewUrl = null;
    }
  }

  onRemoveAttachment(): void {
    if (confirm('Tem certeza que deseja remover o anexo?')) {
      this.task.attachmentUrl = undefined;
      this.task.attachmentName = undefined;
      this.attachmentPreviewUrl = null;
      this.selectedFile = null;
      this.successMessage = 'Anexo marcado para remoção ao salvar.';
      setTimeout(() => this.successMessage = null, 3000);
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
          categoryId: this.task.categoryId
        };
        if (this.task.attachmentUrl === undefined && this.attachmentPreviewUrl !== null) {
            updateData.attachmentUrl = null;
            updateData.attachmentName = null;
        } else if (this.selectedFile) {
        } else if (!this.attachmentPreviewUrl && !this.selectedFile) {
            updateData.attachmentUrl = null;
            updateData.attachmentName = null;
        }

        await this.taskService.updateTask(this.taskId, updateData, this.selectedFile || undefined); 
        this.successMessage = 'Tarefa atualizada com sucesso!';
      } else {
        await this.taskService.addTask(this.task, this.selectedFile || undefined); 
        this.successMessage = 'Tarefa adicionada com sucesso!';
        this.task = { title: '', completed: false, categoryId: '', userId: '' };
        this.selectedFile = null;
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