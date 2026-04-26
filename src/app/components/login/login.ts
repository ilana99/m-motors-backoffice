import { Component } from '@angular/core';
import { Api } from '../../services/api';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginResponse: string = '';

loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(private apiService: Api) {}

 login(): void {
   const data = this.loginForm.value;

      this.apiService.login(data).subscribe({
      next: (response) => {
        if (response.status === 201) {
          this.loginResponse = 'connected';
      }
    },
      error: (error) => {
          this.loginResponse = 'error';
          console.log(error);
      }
    })
  }
}
