import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators'; 
import { AuthService } from '../auths/auth'; 

export interface Category {
  id?: string;
  name: string;
  description: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesCollection: AngularFirestoreCollection<Category>;

  constructor(private afs: AngularFirestore, private authService: AuthService) {
    this.categoriesCollection = afs.collection<Category>('categories');
  }

  getCategories(): Observable<Category[]> {
    return this.authService.user.pipe(
      take(1), 
      switchMap(user => {
        if (user) {
          return this.afs.collection<Category>('categories', ref => ref.where('userId', '==', user.uid))
                     .snapshotChanges().pipe(
                        map(actions => actions.map(a => {
                          const data = a.payload.doc.data() as Category;
                          const id = a.payload.doc.id;
                          return { id, ...data };
                        }))
                     );
        } else {
          return of([]);
        }
      })
    );
  }

  getCategory(id: string): Observable<Category | undefined> {
    return this.categoriesCollection.doc<Category>(id).valueChanges().pipe(
      map(category => {
        if (category) {
          return { id, ...category };
        }
        return undefined;
      })
    );
  }

  async addCategory(category: Category): Promise<DocumentReference<Category>> {
    const userId = await this.authService.getCurrentUserId();
    if (userId) {
      const categoryToAdd = { ...category, userId };
      return this.categoriesCollection.add(categoryToAdd);
    } else {
      return Promise.reject(new Error('Nenhum usuário logado para adicionar categoria.'));
    }
  }

  updateCategory(id: string, category: Partial<Category>): Promise<void> { 
    return this.categoriesCollection.doc<Category>(id).update(category);
  }

  deleteCategory(id: string): Promise<void> {
    return this.categoriesCollection.doc<Category>(id).delete();
  }
}