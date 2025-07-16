import { Hero } from "@/components/layout/Hero";
import { HomeSearchBox } from "@/components/layout/HomeSearchBox";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="flex flex-col items-center justify-center p-4 pb-10 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col items-center w-full max-w-4xl">
          <HomeSearchBox />
        </main>
        <footer className="mt-8 flex gap-[24px] flex-wrap items-center justify-center">
          {/* Footer content removed */}
        </footer>
      </div>
    </>
  );
}
