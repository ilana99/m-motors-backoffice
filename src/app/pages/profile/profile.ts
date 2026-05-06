import { Component, OnInit, signal } from '@angular/core';
import { Api } from '../../services/api';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user = signal<any | null>(null);
  constructor(private api: Api) { }

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (response) => {
        this.user.set(response.body);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
