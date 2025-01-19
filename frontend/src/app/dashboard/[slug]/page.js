export default async function ProjectPage({ params }) {
  const slug = (await params).slug;
  return (
    <div className="min-h-screen bg-background p-6 pt-48">
      <div className="mx-auto max-w-7xl space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight font-nf">
          {slug} Project Page
        </h1>
        
      </div>
    </div>
  );
}
