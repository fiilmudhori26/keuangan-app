import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return <AuthForm mode="register" googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />;
}
