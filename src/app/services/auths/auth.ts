import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from, firstValueFrom } from 'rxjs'; 
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth) {
    this.user = this.afAuth.user;
  }

  register(email: string, password: string): Observable<firebase.auth.UserCredential> {
    return from(this.afAuth.createUserWithEmailAndPassword(email, password));
  }

  login(email: string, password: string): Observable<firebase.auth.UserCredential> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  loginWithGoogle(): Observable<firebase.auth.UserCredential> {
    const provider = new firebase.auth.GoogleAuthProvider();
    return from(this.afAuth.signInWithPopup(provider));
  }

  logout(): Observable<void> {
    return from(this.afAuth.signOut());
  }

  getCurrentUserId(): Promise<string | null> {
    return this.afAuth.currentUser.then(user => user ? user.uid : null);
  }

  sendPasswordResetEmail(email: string): Observable<void> {
    return from(this.afAuth.sendPasswordResetEmail(email));
  }

  sendEmailVerification(): Observable<void> {
    return from(this.afAuth.currentUser.then(user => {
      if (user) {
        return user.sendEmailVerification();
      } else {
        return Promise.reject(new Error('Nenhum usuário logado para verificar o email.'));
      }
    }));
  }

  isEmailVerified(): Observable<boolean> {
    return this.afAuth.user.pipe(
      map(user => user?.emailVerified || false)
    );
  }
}