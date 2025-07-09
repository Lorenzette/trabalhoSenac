import { Component, OnInit } from '@angular/core';
import { Category, CategoryService } from '../../../services/categories/category'; 
import { Observable, firstValueFrom } from 'rxjs'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  standalone: false,
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss']
})
export class CategoryList implements OnInit {
  categories$!: Observable<Category[]>;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private categoryService: CategoryService, private router: Router) { }

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  onAddCategory(): void {
    this.router.navigate(['/categories/new']);
  }

  onEditCategory(categoryId: string | undefined): void {
    if (categoryId) {
      this.router.navigate(['/categories/edit', categoryId]);
    } else {
      this.errorMessage = 'ID da categoria não encontrado para edição.';
    }
  }

  async onDeleteCategory(categoryId: string | undefined): Promise<void> {
    if (!categoryId) {
      this.errorMessage = 'ID da categoria não encontrado para exclusão.';
      return;
    }

    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await this.categoryService.deleteCategory(categoryId); 
        this.successMessage = 'Categoria excluída com sucesso!';
        setTimeout(() => this.successMessage = null, 3000);
      } catch (error: any) {
        console.error('Erro ao excluir categoria:', error);
        this.errorMessage = 'Erro ao excluir categoria: ' + error.message;
        setTimeout(() => this.errorMessage = null, 5000);
      }
    }
  }
}