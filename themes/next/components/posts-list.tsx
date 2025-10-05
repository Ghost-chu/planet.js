"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlanetPost } from "@/lib/data";

type PostsListProps = {
  posts: PlanetPost[];
  totalAvailable: number;
  displayLength: number;
  renderFull: boolean;
  itemsPerPage: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getInitialPage(
  params: URLSearchParams | null,
  totalPages: number
): number {
  const raw = params?.get("page");
  const parsed = raw ? Number.parseInt(raw, 10) : 1;

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return clamp(parsed, 1, totalPages);
}

function PostsListContent({
  posts,
  totalAvailable,
  displayLength,
  renderFull,
  itemsPerPage,
}: PostsListProps) {
  const perPage = Math.max(1, Number.isFinite(itemsPerPage) ? itemsPerPage : 10);
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [currentPage, setCurrentPage] = useState(() =>
    getInitialPage(searchParams, totalPages)
  );

  useEffect(() => {
    setCurrentPage(getInitialPage(searchParams, totalPages));
  }, [searchParams, totalPages]);

  const visiblePosts = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return posts.slice(start, start + perPage);
  }, [currentPage, perPage, posts]);

  const showingStart =
    visiblePosts.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const showingEnd = visiblePosts.length
    ? (currentPage - 1) * perPage + visiblePosts.length
    : 0;

  const updatePage = useCallback(
    (nextPage: number) => {
      const clamped = clamp(nextPage, 1, totalPages);
      setCurrentPage(clamped);

      if (typeof window === "undefined") {
        return;
      }

      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (clamped === 1) {
        params.delete("page");
      } else {
        params.set("page", String(clamped));
      }

      const query = params.toString();
      const target = query ? `${pathname}?${query}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router, searchParams, totalPages]
  );

  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent posts</h2>
          <p className="text-muted-foreground text-sm">No posts available</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nothing to show yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Recent posts</h2>
        <p className="text-muted-foreground text-sm">
          Showing {showingStart}-{showingEnd} of {posts.length} loaded
          {totalAvailable > posts.length
            ? ` (${totalAvailable} total)`
            : ""}
        </p>
      </div>

      <div className="space-y-6">
        {visiblePosts.map((post) => {
          const authorName = (post.author ?? "").trim() || "Unknown";
          const fallbackInitials =
            authorName.slice(0, 2).toUpperCase() || "??";
          const shouldUseSummary =
            !renderFull && post.summary && post._length > displayLength;
          const content = shouldUseSummary
            ? post.summary ?? post.content
            : post.content;

          return (
            <Card key={`${post._t_rfc3339}-${post.link}`}>
              <CardHeader className="gap-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    {post.avatar ? (
                      <AvatarImage src={post.avatar} alt={authorName} />
                    ) : null}
                    <AvatarFallback>{fallbackInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-2">
                    <CardTitle className="text-pretty text-lg font-semibold md:text-xl">
                      <a
                        href={post.link}
                        className="text-foreground transition-colors hover:text-primary"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {post.title}
                      </a>
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span>{authorName}</span>
                      <span aria-hidden="true">•</span>
                      <time dateTime={post._t_rfc3339}>{post.date}</time>
                      {post.update && post.update !== post.date ? (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>Updated {post.update}</span>
                        </>
                      ) : null}
                    </CardDescription>
                    {post.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {post.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </CardContent>
              <CardFooter className="justify-between gap-4">
                <Button asChild variant="link" className="px-0">
                  <a href={post.link} rel="noopener noreferrer" target="_blank">
                    Continue reading
                  </a>
                </Button>
                <Button asChild variant="link" className="px-0 text-sm">
                  <a
                    href={post.channel}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Visit source
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PostsList(props: PostsListProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Recent posts</h2>
            <p className="text-muted-foreground text-sm">Loading posts…</p>
          </div>
        </div>
      }
    >
      <PostsListContent {...props} />
    </Suspense>
  );
}
