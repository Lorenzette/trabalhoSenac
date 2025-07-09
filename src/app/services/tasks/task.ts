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

export interface Task {
  id?: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  categoryId: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksCollection: AngularFirestoreCollection<Task>;
  private _injector = inject(Injector);

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService
    ) {
    console.log('TaskService: Construtor chamado. AngularFirestore (afs):', this.afs);
    this.tasksCollection = afs.collection<Task>('tasks');
    console.log('TaskService: Coleção de Tarefas (tasksCollection):', this.tasksCollection);
  }

  getTasks(): Observable<Task[]> {
    console.log('TaskService: getTasks() chamado para buscar tarefas.');

    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          const userIdToQuery = user.uid;
          console.log('TaskService: Usuário logado encontrado. UID:', userIdToQuery);
          console.log('TaskService: Executando query Firestore: tasks onde userId ==', userIdToQuery);

          return runInInjectionContext(this._injector, () => {
            return this.afs.collection<Task>('tasks', ref => ref.where('userId', '==', userIdToQuery))
                            .snapshotChanges().pipe(
                                map(actions => {
                                    console.log('TaskService: *** SNAPSHOT DE TAREFAS RECEBIDO ***. Número de documentos (actions):', actions.length);
                                    if (actions.length === 0) {
                                        console.warn('TaskService: NENHUM DOCUMENTO DE TAREFA RETORNADO PELA QUERY PARA O UID:', userIdToQuery);
                                    }
                                    return actions.map(a => {
                                        const data = a.payload.doc.data() as Task;
                                        const id = a.payload.doc.id;
                                        console.log('TaskService: Processando documento de tarefa:', { id, ...data });
                                        return { id, ...data };
                                    });
                                })
                            );
          });
        } else {
          console.log('TaskService: Nenhum usuário logado, retornando array de tarefas vazio.');
          return of([]);
        }
      })
    );
  }

  getTask(id: string): Observable<Task | undefined> {
    return runInInjectionContext(this._injector, () => {
      return this.tasksCollection.doc<Task>(id).valueChanges().pipe(
        map(task => {
          if (task) {
            return { id, ...task };
          }
          return undefined;
        })
      );
    });
  }

  async addTask(task: Task): Promise<DocumentReference<Task>> {
    const userId = await this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Nenhum usuário logado para adicionar tarefa.');
    }

    const taskToAdd = { ...task, userId, completed: false, dueDate: task.dueDate || null };

    console.log('TaskService: Adicionando tarefa ao Firestore:', taskToAdd);
    return runInInjectionContext(this._injector, () => {
      return this.tasksCollection.add(taskToAdd);
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<void> {
    console.log('TaskService: Atualizando tarefa no Firestore:', id, task);
    return runInInjectionContext(this._injector, () => {
      return this.tasksCollection.doc<Task>(id).update(task);
    });
  }

  async deleteTask(id: string): Promise<void> {
    console.log('TaskService: Excluindo tarefa do Firestore:', id);
    return runInInjectionContext(this._injector, () => {
      return this.tasksCollection.doc<Task>(id).delete();
    });
  }
}