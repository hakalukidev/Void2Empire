import { AuthModal } from "@/components/auth/auth-modal";
import { RegisterForm } from "@/components/auth/register-form";

// Intercepts client-side navigation to /register and shows it over the current page.
export default function RegisterModal() {
  return (
    <AuthModal labelKey="auth.register_btn" wide>
      <RegisterForm />
    </AuthModal>
  );
}
