import { Window } from "@/components/window"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Window title="GPA Calculator" width={290} height={500} />
    </main>
  )
}
