import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return <AuthForm mode="login" googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />;
}
