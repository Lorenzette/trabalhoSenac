import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module'; 
import { App } from './app'; 
import { FormsModule } from '@angular/forms'; 

// Módulos Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
// Removida importação de AngularFireStorageModule

import { environment } from '../environments/environment';

// Componentes Auth
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';

import { CategoryList } from './components/categories/category-list/category-list'; 
import { CategoryForm } from './components/categories/category-form/category-form';
import { TaskList } from './components/tasks/task-list/task-list'; 
import { TaskForm } from './components/tasks/task-form/task-form'; 

@NgModule({
  declarations: [
    App,
    Login,
    Register,
    Dashboard,
    ForgotPassword,
    CategoryList, 
    CategoryForm,
    TaskList,   
    TaskForm   
  ],
  imports: [
    BrowserModule,
    FormsModule, 
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    // Removida importação de AngularFireStorageModule
  ],
  providers: [],
  bootstrap: [App] 
})
export class AppModule { }