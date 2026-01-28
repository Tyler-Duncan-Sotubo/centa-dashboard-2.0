import Link from "next/link";
import Data from "@/features/admin-layout/config/footerSocialLinks";

const AuthFooter = () => {
  return (
    <div className="w-full py-6 px-4 flex flex-col sm:flex-row justify-between items-center gap-10 ">
      <ul className="flex items-center gap-5">
        {Data.map(({ url, title, Icon }, i) => (
          <li key={i}>
            <Link
              href={url}
              target="_blank"
              rel="noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full border-2 border-white/45 transition hover:border-black/30"
              aria-label={title}
              title={title}
            >
              <Icon className={`h-6 w-6 transition text-white`} />
            </Link>
          </li>
        ))}
      </ul>
      <div className="text-text text-white font-medium sm:text-black">
        <p className="m-0">
          &copy; 2025{" "}
          <Link href="#" className="hover:text-title transition">
            Centa HR
          </Link>
          . All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthFooter;
