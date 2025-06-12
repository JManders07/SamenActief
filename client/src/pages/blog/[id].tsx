import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

async function getBlog(id: string): Promise<Blog> {
  const response = await fetch(`/api/blogs/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch blog");
  }
  return response.json();
}

export default function BlogDetail() {
  const [, navigate] = useLocation();
  const id = window.location.pathname.split("/").pop() || "";

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlog(id),
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
      ) : null}
    </div>
  );
} 