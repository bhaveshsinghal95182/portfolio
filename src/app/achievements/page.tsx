import Navbar from "@/components/nav";

export default function AchievementsPage() {
  return (
    <section className="page flex justify-center px-4 ">
      <div className="w-[400px] md:w-[600px]">
        <Navbar />
        <h1 className="-tracking-[0.06em] text-primary font-playfair text-4xl">
          Achievements
        </h1>
        <p className="font-poppins text-muted-black text-sm pt-4">
          This is just a little page to talk about my own personal achievements
          I have made throughout my journey.
        </p>

        <ul className="list-disc pl-5 pt-6 space-y-0.5">
          <li className="font-poppins text-muted-black text-sm">
            Created 2 npm packages for public use and DX improvement.
          </li>
          <li className="font-poppins text-muted-black text-sm">
            Scaled a package to <span className="font-bold">1k+</span> weekly
            downloads on npm.
          </li>
          <li className="font-poppins text-muted-black text-sm">
            Contributed to <span className="font-bold">open-source</span>{" "}
            projects on GitHub.
          </li>
        </ul>
      </div>
    </section>
  );
}
