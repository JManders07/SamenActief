import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Blog {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  author: {
    display_name: string;
  };
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    display_name: string;
  };
}

async function getBlog(id: string): Promise<Blog> {
  const response = await fetch(`/api/blogs/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch blog");
  }
  return response.json();
}

async function getComments(id: string): Promise<Comment[]> {
  const res = await fetch(`/api/blogs/${id}/comments`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

async function postComment({ id, content }: { id: string; content: string }) {
  const res = await fetch(`/api/blogs/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to post comment");
  return res.json();
}

export default function BlogDetail() {
  const [, navigate] = useLocation();
  const id = window.location.pathname.split("/").pop() || "";

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlog(id),
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [commentContent, setCommentContent] = useState("");

  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id),
  });

  const mutation = useMutation({
    mutationFn: ({ content }: { content: string }) => postComment({ id, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setCommentContent("");
    },
  });

  if (error) {
    return (
      <div className="text-red-500">
        Er is een fout opgetreden bij het laden van de blog. Probeer het later opnieuw.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button
        variant="ghost"
        className="mb-8"
        onClick={() => navigate("/blog")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Terug naar overzicht
      </Button>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ) : blog ? (
        <>
        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
          <div className="text-muted-foreground mb-8">
            {format(new Date(blog.created_at), "d MMMM yyyy", { locale: nl })} •{" "}
            {blog.author.display_name}
          </div>
          <div className="aspect-video relative mb-8">
            <img
              src={`/api/proxy-image?url=${encodeURIComponent(blog.image_url)}`}
              alt={blog.title}
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
          <div className="whitespace-pre-wrap">{blog.content}</div>
        </article>

        {/* Comments */}
        <section className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold">Reacties</h2>

          {comments && comments.length > 0 ? (
            <ul className="space-y-6">
              {comments.map((c) => (
                <li key={c.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{c.user.display_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(c.created_at), "d MMM yyyy HH:mm", { locale: nl })}
                    </span>
                  </div>
                  <p>{c.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Er zijn nog geen reacties.</p>
          )}

          {user ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (commentContent.trim()) {
                  mutation.mutate({ content: commentContent.trim() });
                }
              }}
            >
              <Textarea
                placeholder="Schrijf een reactie..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
              />
              <Button type="submit" disabled={mutation.isPending}>
                Plaats reactie
              </Button>
            </form>
          ) : (
            <p className="text-muted-foreground">
              Log in om een reactie te plaatsen.
            </p>
          )}
        </section>
        </>
      ) : null}
    </div>
  );
} 