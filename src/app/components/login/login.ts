import { Component, signal } from '@angular/core';
import { Api } from '../../services/api';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginResponse = signal('');

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(private apiService: Api) { }

  login(): void {
    this.loginResponse.set('');
    const data = this.loginForm.value;

    this.apiService.login(data).subscribe({
      next: (response) => {
        if (response.status === 201 || response.status === 200) {
          this.loginResponse.set('connected');
        }
      },
      error: (error) => {
        this.loginResponse.set('error');
        console.log(error);
      }
    })
  }
}
