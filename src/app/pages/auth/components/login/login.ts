import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth';
import { Router } from '@angular/router';

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

  constructor(
    private auth: AuthService,
    private router: Router,
  ) { }

  login(): void {
    this.loginResponse.set('');
    const data = this.loginForm.value;

    this.auth.login(data).subscribe({
      next: (response) => {
        if (response.status === 201 || response.status === 200) {
          this.router.navigate(['/cars']);
        }
      },
      error: (error) => {
        this.loginResponse.set('error');
        console.log(error);
      }
    })
  }
}
