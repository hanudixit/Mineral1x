import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <SignUp />
    </main>
  );
}