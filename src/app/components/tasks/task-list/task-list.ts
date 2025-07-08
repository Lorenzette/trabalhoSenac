import { Component, OnInit } from '@angular/core';
import { Task, TaskService } from '../../../services/tasks/task'; 
import { Category, CategoryService } from '../../../services/categories/category';
import { Observable, combineLatest, firstValueFrom } from 'rxjs'; 
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
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