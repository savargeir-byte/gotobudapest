import Image from "next/image";
import Link from "next/link";
export default function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={footer ? "brand-image footer-logo" : "brand-image"}
      aria-label="GoToBudapest home"
    >
      <Image
        src="/assets/gotobudapest-logo.svg"
        alt="GoToBudapest"
        width={1944}
        height={809}
        priority={!footer}
      />
    </Link>
  );
}
