import { AuthModal } from "@/components/auth/auth-modal";
import { RegisterForm } from "@/components/auth/register-form";

// Intercepts client-side navigation to /register and shows it over the current page.
export default function RegisterModal() {
  return (
    <AuthModal label="Create account" wide>
      <RegisterForm />
    </AuthModal>
  );
}
