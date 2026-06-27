import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import AuthLayout from "@/layouts/auth-layout";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
    // Already authenticated → skip the form (server-side, same source as the
    // dashboard guard — avoids client/server redirect loops).
    if (await getUser()) redirect("/dashboard");

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <RegisterForm />
        </AuthLayout>
    );
}
