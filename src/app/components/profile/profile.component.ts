import { Component, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly API = environment.apiBaseUrl;

  authService = inject(AuthService);

  profileForm = signal({ name: '', imageUrl: '' });
  passwordForm = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  isEditingProfile = signal(false);
  isEditingPassword = signal(false);

  userHasPassword = signal(false);

  isUploading = signal(false);
  imageTimestamp = signal(Date.now());
  showImageModal = signal(false);
  tempImageUrl = signal('');

  successMessage = signal('');
  errorMessage = signal('');

  pendingFile: File | null = null;

  localPreviewUrl = signal<string | null>(null);

  constructor() {
    effect(
      () => {
        const user = this.authService.userProfile();
        if (user) {
          this.profileForm.set({
            name: user.name || '',
            imageUrl: user.imageUrl || '',
          });
          this.pendingFile = null;
          this.localPreviewUrl.set(null);
          this.userHasPassword.set(user.hasPassword);
        }
      },
      { allowSignalWrites: true }
    );
  }

  toggleEditProfile() {
    this.isEditingProfile.update((v) => !v);
    if (!this.isEditingProfile()) {
      this.resetProfileForm(this.authService.userProfile());
    }
    this.resetMessages();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('Image size must be less than 5MB');
        this.closeImageModal();
        return;
      }

      this.pendingFile = file;
      this.closeImageModal();

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.localPreviewUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async onUpdateProfile() {
    this.resetMessages();
    this.isUploading.set(true);
    try {
      await this.authService.updateProfile(
        this.profileForm().name,
        this.profileForm().imageUrl,
        this.pendingFile
      );

      this.successMessage.set('Profile updated successfully!');
      this.isEditingProfile.set(false);

      this.pendingFile = null;
      this.localPreviewUrl.set(null);
      this.imageTimestamp.set(Date.now());
    } catch (err: any) {
      if (err.error && err.error.message) {
        this.errorMessage.set(err.error.message);
      } else {
        this.errorMessage.set('Failed to update profile. Please try again.');
      }
    } finally {
      this.isUploading.set(false);
    }
  }

  clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  toggleEditPassword() {
    this.isEditingPassword.update((v) => !v);
    this.passwordForm.set({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    this.resetMessages();
  }

  async onChangePassword() {
    this.resetMessages();
    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm();

    if (newPassword.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    try {
      await this.authService.changePassword({ currentPassword, newPassword });
      this.successMessage.set('Password updated successfully.');
      this.isEditingPassword.set(false);
      this.passwordForm.set({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      this.authService.fetchUserProfile();
    } catch (err: any) {
      if (err.error && err.error.message) {
        this.errorMessage.set(err.error.message);
      } else {
        this.errorMessage.set('Failed to update password. Please try again.');
      }
    }
  }

  openImageModal() {
    const currentUrl = this.profileForm().imageUrl;
    const isExternal =
      currentUrl &&
      !currentUrl.includes(this.API) &&
      !currentUrl.includes('r2.dev');
    if (isExternal) {
      this.tempImageUrl.set(currentUrl);
    } else {
      this.tempImageUrl.set('');
    }
    this.showImageModal.set(true);
  }

  closeImageModal() {
    this.showImageModal.set(false);
  }

  applyImageUrl() {
    if (this.tempImageUrl()) {
      this.profileForm.update((f) => ({ ...f, imageUrl: this.tempImageUrl() }));

      this.pendingFile = null;
      this.localPreviewUrl.set(null);

      this.closeImageModal();
    }
  }

  getProfileImage(): string {
    if (this.localPreviewUrl()) {
      return this.localPreviewUrl()!;
    }

    const url = this.profileForm().imageUrl;
    const isManaged = url.includes(this.API) || url.includes('r2.dev');
    if (isManaged) {
      return `${url}?t=${this.imageTimestamp()}`;
    }
    return url || '';
  }

  resetMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  resetProfileForm(user: any) {
    if (user) {
      this.profileForm.set({
        name: user.name || '',
        imageUrl: user.imageUrl || '',
      });
    }
  }
}
