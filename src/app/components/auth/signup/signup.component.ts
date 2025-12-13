import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

export interface SignUpUser {
  email: string;
  password: string;
  name: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly API = environment.apiBaseUrl;
  authService = inject(AuthService);

  signUpUser: SignUpUser = {
    email: '',
    password: '',
    name: '',
  };

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  async onSubmit() {
    if (
      !this.signUpUser.name ||
      !this.signUpUser.email ||
      !this.signUpUser.password
    ) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.signup(this.signUpUser);
    } catch (err: any) {
      this.isLoading.set(false);

      if (err.status === 400 && typeof err.error === 'string') {
        this.errorMessage.set(err.error);
      } else {
        this.errorMessage.set('Something went wrong. Please try again.');
      }
    }
  }

  socialSignUp(provider: string) {
    window.location.href = `${this.API}/oauth2/authorization/${provider}`;
  }
}
