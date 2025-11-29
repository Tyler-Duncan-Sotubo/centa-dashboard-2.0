import {
  FaFacebookF,
  FaXTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa6";

type SocialItem = {
  title: string;
  url: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
};

const Data: SocialItem[] = [
  {
    title: "facebook",
    url: "#",
    Icon: FaFacebookF,
    color: "#1877F2", // Facebook Blue
  },
  {
    title: "twitter",
    url: "#",
    Icon: FaXTwitter,
    color: "#000000", // Twitter (X) Black
  },
  {
    title: "linkedin",
    url: "https://www.linkedin.com/company/centa-hr/",
    Icon: FaLinkedinIn,
    color: "#0A66C2", // LinkedIn Blue
  },
  {
    title: "instagram",
    url: "#",
    Icon: FaInstagram,
    color: "#E4405F", // Instagram Pinkish Red
  },
];

export default Data;
