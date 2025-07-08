import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';


@Component({
  selector: 'app-root', 
  standalone: false,
  templateUrl: './app.html', 
  styleUrls: ['./app.scss']  
})
export class App implements OnInit { 
  title = 'meu-app-firebase'; 

  constructor(
    private afAuth: AngularFireAuth,
    private afFirestore: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    console.log('Firebase Auth service:', this.afAuth);
    console.log('Firebase Firestore service:', this.afFirestore);
    console.log('Firebase Storage service:', this.afStorage);
  }
}