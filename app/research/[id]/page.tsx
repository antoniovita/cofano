import ResearchPageClient from "./ResearchPageClient";

export default async function ResearchArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResearchPageClient id={id} />;
}
