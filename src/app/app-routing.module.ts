import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { AuthGuard } from './guards/auth-guard';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password'; 

import { CategoryList } from './components/categories/category-list/category-list'; 
import { CategoryForm } from './components/categories/category-form/category-form'; 

import { TaskList } from './components/tasks/task-list/task-list'; 
import { TaskForm } from './components/tasks/task-form/task-form'; 

const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword }, 
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'categories', component: CategoryList, canActivate: [AuthGuard] }, 
  { path: 'categories/new', component: CategoryForm, canActivate: [AuthGuard] }, 
  { path: 'categories/edit/:id', component: CategoryForm, canActivate: [AuthGuard] }, 
  { path: 'tasks', component: TaskList, canActivate: [AuthGuard] }, 
  { path: 'tasks/new', component: TaskForm, canActivate: [AuthGuard] },
  { path: 'tasks/edit/:id', component: TaskForm, canActivate: [AuthGuard] }, 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
