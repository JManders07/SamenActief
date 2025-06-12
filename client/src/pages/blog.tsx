import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

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

async function getBlogs(): Promise<Blog[]> {
  const response = await fetch("/api/blogs");
  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }
  return response.json();
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={blog.image_url}
          alt={blog.title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-2xl">{blog.title}</CardTitle>
        <CardDescription>
          {format(new Date(blog.created_at), "d MMMM yyyy", { locale: nl })} •{" "}
          {blog.author.display_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{blog.content}</p>
      </CardContent>
    </Card>
  );
}

function BlogSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardContent>
    </Card>
  );
}

export default function Blog() {
  const { data: blogs, isLoading, error } = useQuery({
    queryKey: ["blogs"],
    queryFn: getBlogs,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-muted-foreground">
          Ontdek de laatste nieuwtjes, tips en verhalen over activiteiten en evenementen.
        </p>
      </div>

      {error && (
        <div className="text-red-500">
          Er is een fout opgetreden bij het laden van de blogs. Probeer het later opnieuw.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Toon skeletons tijdens het laden
          Array.from({ length: 6 }).map((_, i) => (
            <BlogSkeleton key={i} />
          ))
        ) : (
          // Toon blogs wanneer ze geladen zijn
          blogs?.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))
        )}
      </div>
    </div>
  );
} 