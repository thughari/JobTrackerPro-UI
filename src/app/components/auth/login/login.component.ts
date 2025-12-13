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
      if (err.status === 400 || err.status === 401) {
        this.errorMessage.set(
          typeof err.error === 'string' ? err.error : 'Invalid credentials'
        );
      } else {
        this.errorMessage.set('Login failed. Please try again.');
      }
    }
  }

  socialLogin(provider: string) {
    window.location.href = `${this.API}/oauth2/authorization/${provider}`;
  }
}
