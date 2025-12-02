import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error: string | null = null;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    display_name: ['']
  });

  onSubmit() {
    this.error = null;
    if (this.form.invalid) {
      this.error = 'Please fix the errors above.';
      return;
    }
    this.auth.register(this.form.value as any).subscribe((ok) => {
      if (ok) this.router.navigateByUrl('/dashboard');
      else this.error = 'Registration failed. Email may already be in use.';
    });
  }
}
