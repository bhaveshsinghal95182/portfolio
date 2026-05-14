import Link from "next/link";

export default function ResumePage() {
  return (
    <main className="w-full h-full flex flex-col">
      <div className="flex justify-end p-4">
        <a
          href={"/resume.pdf"}
          target="_blank"
          download="Bhavesh-Resume.pdf"
          className="group flex items-center gap-1 whitespace-nowrap text-[12px] font-poppins text-muted-black hover:text-accent lowercase"
        >
          Download Resume
        </a>
      </div>
      <iframe
        src="/resume.pdf#toolbar=0"
        className="w-full flex-1 border-0"
      />
    </main>
  );
}
