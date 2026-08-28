import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-[#0b0d0d] px-5 text-center text-white"><div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#c7a76b]">404 · APRISM</p><h1 className="mt-6 font-serif text-6xl">This record could not be found.</h1><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/45">The page may have moved or the property record is not available to this account.</p><Link href="/" className="mt-8 inline-flex min-h-12 items-center justify-center border border-[#c7a76b]/50 px-6 text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#d7ba82]">Return to APRISM</Link></div></main>;
}
