import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, from, of, firstValueFrom } from 'rxjs'; 
import { map, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../auths/auth';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  completed: boolean;
  categoryId: string;
  userId: string;
  attachmentUrl?: string | null;   
  attachmentName?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksCollection: AngularFirestoreCollection<Task>;

  constructor(
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private authService: AuthService
  ) {
    this.tasksCollection = afs.collection<Task>('tasks');
  }

  getTasks(): Observable<Task[]> {
    return this.authService.user.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.collection<Task>('tasks', ref => ref.where('userId', '==', user.uid))
                     .snapshotChanges().pipe(
                        map(actions => actions.map(a => {
                          const data = a.payload.doc.data() as Task;
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

  getTask(id: string): Observable<Task | undefined> {
    return this.tasksCollection.doc<Task>(id).valueChanges().pipe(
      map(task => {
        if (task) {
          return { id, ...task };
        }
        return undefined;
      })
    );
  }

  async addTask(task: Task, file?: File): Promise<DocumentReference<Task>> {
    const userId = await this.authService.getCurrentUserId();
    if (!userId) {
      return Promise.reject(new Error('Nenhum usuário logado para adicionar tarefa.'));
    }

    const taskToAdd = { ...task, userId, completed: false, dueDate: task.dueDate || null };

    if (file) {
      const filePath = `task_attachments/${userId}/${Date.now()}_${file.name}`;
      const fileRef = this.afStorage.ref(filePath);
      const uploadTask = this.afStorage.upload(filePath, file);

      await firstValueFrom(uploadTask.snapshotChanges().pipe(
        finalize(() => console.log('Upload de arquivo concluído')),
      ));

      const downloadURL = await firstValueFrom(fileRef.getDownloadURL()); 
      taskToAdd.attachmentUrl = downloadURL;
      taskToAdd.attachmentName = file.name;
    }

    return this.tasksCollection.add(taskToAdd);
  }

  async updateTask(id: string, task: Partial<Task>, file?: File): Promise<void> {
    if (file) {
      const existingTask = await firstValueFrom(this.getTask(id)); 
      if (existingTask?.attachmentUrl) {
        await this.deleteFile(existingTask.attachmentUrl);
      }

      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        return Promise.reject(new Error('Nenhum usuário logado para atualizar tarefa.'));
      }
      const filePath = `task_attachments/${userId}/${Date.now()}_${file.name}`;
      const fileRef = this.afStorage.ref(filePath);
      const uploadTask = this.afStorage.upload(filePath, file);

      await firstValueFrom(uploadTask.snapshotChanges().pipe(
        finalize(() => console.log('Upload de arquivo concluído')),
      ));

      const downloadURL = await firstValueFrom(fileRef.getDownloadURL()); 
      task.attachmentUrl = downloadURL;
      task.attachmentName = file.name;
    } else if (task.attachmentUrl === null) {
      const existingTask = await firstValueFrom(this.getTask(id)); 
      if (existingTask?.attachmentUrl) {
        await this.deleteFile(existingTask.attachmentUrl);
      }
      task.attachmentName = null;
    }

    return this.tasksCollection.doc<Task>(id).update(task);
  }

  async deleteTask(id: string): Promise<void> {
    const taskToDelete = await firstValueFrom(this.getTask(id));
    if (taskToDelete && taskToDelete.attachmentUrl) {
      await this.deleteFile(taskToDelete.attachmentUrl);
    }
    return this.tasksCollection.doc<Task>(id).delete();
  }

  deleteFile(fileUrl: string): Promise<void> {
    return firstValueFrom(this.afStorage.refFromURL(fileUrl).delete());
  }
}