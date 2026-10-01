import { AuthModal } from "@/components/auth/auth-modal";
import { LoginForm } from "@/components/auth/login-form";

// Intercepts client-side navigation to /login and shows it over the current page.
export default function LoginModal() {
  return (
    <AuthModal label="Log in">
      <LoginForm />
    </AuthModal>
  );
}
