import { Component, OnInit } from '@angular/core';
import { Category, CategoryService } from '../../../services/categories/category'; 
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs'; 

@Component({
  selector: 'app-category-form',
  standalone: false,
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.scss']
})
export class CategoryForm implements OnInit {
  category: Category = { name: '', description: '', userId: '' };
  categoryId: string | null = null;
  isEditMode: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  categories$!: Observable<Category[]>;


  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategory(this.categoryId);
    }
  }

  async loadCategory(id: string): Promise<void> {
    try {
      const categoryData = await firstValueFrom(this.categoryService.getCategory(id)); 
      if (categoryData) {
        this.category = categoryData;
      } else {
        this.errorMessage = 'Categoria não encontrada.';
        setTimeout(() => this.router.navigate(['/categories']), 3000);
      }
    } catch (error: any) {
      console.error('Erro ao carregar categoria:', error);
      this.errorMessage = 'Erro ao carregar categoria: ' + error.message;
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.category.name.trim()) {
      this.errorMessage = 'O nome da categoria é obrigatório.';
      return;
    }

    try {
      if (this.isEditMode && this.categoryId) {
        await this.categoryService.updateCategory(this.categoryId, {
            name: this.category.name,
            description: this.category.description,
        }); 
        this.successMessage = 'Categoria atualizada com sucesso!';
      } else {
        await this.categoryService.addCategory(this.category); 
        this.successMessage = 'Categoria adicionada com sucesso!';
        this.category = { name: '', description: '', userId: '' };
      }
      setTimeout(() => {
        this.router.navigate(['/categories']);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      this.errorMessage = 'Erro ao salvar categoria: ' + error.message;
    }
  }

  onCancel(): void {
    this.router.navigate(['/categories']);
  }
}