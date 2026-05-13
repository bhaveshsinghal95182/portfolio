import Navbar from "@/components/nav";
import Links from "@/components/links";
import Projects from "@/components/projects";

const LINK_SIZE = 13;

export default function Home() {
  return (
    <section className="page flex justify-center px-4 ">
      <div className="max-w-100 md:max-w-150">
        <Navbar />
        <h1 className="tracking-[-0.06em] text-primary font-playfair text-4xl">
          Bhvavesh Singhal
        </h1>
        <div className="flex items-center gap-1">
          <div className="text-muted-black font-jost tracking-tighter text-[12px]">
            developer
          </div>
          <div className="bg-muted-black h-1 w-1 rounded"></div>
          <div className="text-muted-black font-jost tracking-tighter text-[12px]">
            designer
          </div>
          <div className="bg-muted-black h-1 w-1 rounded"></div>
          <div className="text-muted-black font-jost tracking-tighter text-[12px]">
            ai enthusiast
          </div>
        </div>
        {/* Intro Text */}
        <div className="intro-text">
          <p className="text-justify tracking-tight font-jost text-muted-black text-sm/snug">
            Hi there, I&apos;m Bhavesh, a 21 y/o CS Student at MMDU Haryana, who
            loves to <span className="font-semibold">code</span> and make my
            life a little easier with the help of{" "}
            <span className="font-semibold">technology</span>. In my spare time,
            I enjoy working on personal{" "}
            <span className="font-semibold">projects</span> and{" "}
            <span className="font-semibold">exploring</span> new technologies.
          </p>
        </div>

        {/* Links */}
        <Links LINK_SIZE={LINK_SIZE} />

        {/* Projects */}
        <Projects LINK_SIZE={LINK_SIZE} />

        {/* Signature */}
        <div className="w-full flex justify-center pt-8">
          <p className="font-southera select-none text-2xl">Bhavesh Singhal</p>
        </div>
      </div>
    </section>
  );
}
