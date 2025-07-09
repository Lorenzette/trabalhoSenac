import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../services/auths/auth';

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
  private _injector = inject(Injector); 

  constructor(private afs: AngularFirestore, private authService: AuthService) {
    console.log('CategoryService: Construtor chamado. AngularFirestore (afs):', this.afs);
    this.categoriesCollection = afs.collection<Category>('categories');
    console.log('CategoryService: Coleção de Categorias (categoriesCollection):', this.categoriesCollection);
  }

  getCategories(): Observable<Category[]> {
    console.log('CategoryService: getCategories() chamado para buscar categorias.');

    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          const userIdToQuery = user.uid;
          console.log('CategoryService: Usuário logado encontrado. UID:', userIdToQuery);
          console.log('CategoryService: Executando query Firestore: categories onde userId ==', userIdToQuery);

          return runInInjectionContext(this._injector, () => {
            return this.afs.collection<Category>('categories', ref => ref.where('userId', '==', userIdToQuery))
                            .snapshotChanges().pipe(
                                map(actions => {
                                    console.log('CategoryService: *** SNAPSHOT RECEBIDO ***. Número de documentos (actions):', actions.length);
                                    if (actions.length === 0) {
                                        console.warn('CategoryService: NENHUM DOCUMENTO RETORNADO PELA QUERY PARA O UID:', userIdToQuery);
                                    }
                                    return actions.map(a => {
                                        const data = a.payload.doc.data() as Category;
                                        const id = a.payload.doc.id;
                                        console.log('CategoryService: Processando documento:', { id, ...data });
                                        return { id, ...data };
                                    });
                                })
                            );
          });

        } else {
          console.log('CategoryService: Nenhum usuário logado, retornando array de categorias vazio.');
          return of([]);
        }
      })
    );
  }

  getCategory(id: string): Observable<Category | undefined> {
    return runInInjectionContext(this._injector, () => {
      return this.categoriesCollection.doc<Category>(id).valueChanges().pipe(
        map(category => {
          if (category) {
            return { id, ...category };
          }
          return undefined;
        })
      );
    });
  }

  async addCategory(category: Category): Promise<DocumentReference<Category>> {
    const userId = await this.authService.getCurrentUserId();
    if (userId) {
      const categoryToAdd = { ...category, userId };
      console.log('CategoryService: Adicionando categoria ao Firestore:', categoryToAdd);
      return runInInjectionContext(this._injector, () => {
        return this.categoriesCollection.add(categoryToAdd);
      });
    } else {
      return Promise.reject(new Error('Nenhum usuário logado para adicionar categoria.'));
    }
  }

  updateCategory(id: string, category: Partial<Category>): Promise<void> {
    console.log('CategoryService: Atualizando categoria no Firestore:', id, category);
    return runInInjectionContext(this._injector, () => {
      return this.categoriesCollection.doc<Category>(id).update(category);
    });
  }

  deleteCategory(id: string): Promise<void> {
    console.log('CategoryService: Excluindo categoria do Firestore:', id);
    return runInInjectionContext(this._injector, () => {
      return this.categoriesCollection.doc<Category>(id).delete();
    });
  }
}