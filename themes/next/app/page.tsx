import { Suspense } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { PostsList } from "@/components/posts-list";
import { loadPlanetData } from "@/lib/data";

function pickPostsLimit<T>(items: number | undefined, data: T[]): T[] {
  if (!items || items <= 0) {
    return data;
  }

  return data.slice(0, items);
}

const data = loadPlanetData();
const posts = pickPostsLimit(data.site.items, data.posts);
const itemsPerPage =
  data.site.items_per_page && data.site.items_per_page > 0
    ? data.site.items_per_page
    : 10;
const renderFull = data.site.render_full ?? false;

export default function Home() {
  const displayLength = data.site.display_length ?? Number.MAX_SAFE_INTEGER;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 pb-16 pt-10 md:px-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {data.site.name}
            </h1>
            {data.site.tagline ? (
              <p className="text-muted-foreground text-base">
                {data.site.tagline}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 self-start">
            <Button asChild variant="link">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="link">
              <a href="atom.xml">Atom</a>
            </Button>
            <Button asChild variant="link">
              <a href="rss.xml">RSS</a>
            </Button>
            <ModeToggle />
          </div>
        </div>
        {data.site.description ? (
          <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
            {data.site.description}
          </p>
        ) : null}
      </header>

      <main className="flex flex-col gap-10">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Recent posts</h2>
                <p className="text-muted-foreground text-sm">
                  Loading posts…
                </p>
              </div>
            </div>
          }
        >
          <PostsList
            posts={posts}
            totalAvailable={data.posts.length}
            displayLength={displayLength}
            renderFull={renderFull}
            itemsPerPage={itemsPerPage}
          />
        </Suspense>

        {data.people.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Sources</h2>
            <div className="flex flex-wrap gap-2">
              {data.people.map((person) => (
                <Button
                  key={person.link}
                  asChild
                  variant="link"
                  className="px-1 text-sm"
                >
                  <a
                    href={person.link}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {person.name}
                  </a>
                </Button>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
