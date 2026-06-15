import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type Props = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  readTime: string;
  image: string;
  href?: string;
};

export function ArticleCard({ id, title, excerpt, date, tag, readTime, image, href }: Props) {
  const to = href ?? `/research/${id}`;

  return (
    <Link
      href={to}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/2 transition-all duration-300 hover:border-white/13 hover:bg-white/4"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <Badge variant="tag">{tag}</Badge>
          <span className="text-neutral-700">·</span>
          <span>{date}</span>
        </div>

        <h3 className="mt-3 text-[17px] font-semibold leading-tight tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-[13px] leading-6 text-neutral-400 line-clamp-3">
          {excerpt}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-[12px] text-neutral-500">
          <Clock size={13} className="text-neutral-600" />
          {readTime} read
        </div>
      </div>
    </Link>
  );
}
