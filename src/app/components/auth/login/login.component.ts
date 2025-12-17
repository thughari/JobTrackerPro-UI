import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly API = environment.apiBaseUrl;

  authService = inject(AuthService);
  email = '';
  password = '';

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  async onSubmit() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      await this.authService.login({
        email: this.email,
        password: this.password,
      });
    } catch (err: any) {
      this.isLoading.set(false);
      if (err.error && err.error.message) {
        this.errorMessage.set(err.error.message);
      } else {
        this.errorMessage.set('Login failed. Please try again.');
      }
    }
  }

  clearMessages() {
    this.errorMessage.set('');
}

  socialLogin(provider: string) {
    window.location.href = `${this.API}/oauth2/authorization/${provider}`;
  }
}
