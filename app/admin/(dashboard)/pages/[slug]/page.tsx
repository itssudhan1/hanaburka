import { notFound } from "next/navigation";
import PageContentEditor from "@/components/admin/PageContentEditor";
import { getPageContent } from "@/lib/config";
import { PAGE_DEFAULTS } from "@/lib/page-defaults";

export default async function AdminPageEditor({
  params,
}: {
  params: { slug: string };
}) {
  const defaults = PAGE_DEFAULTS[params.slug];
  if (!defaults) notFound();

  const { title, body } = await getPageContent(params.slug, defaults.title, defaults.body);

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Edit: {defaults.title}</h1>
      <PageContentEditor slug={params.slug} initialTitle={title} initialBody={body} />
    </div>
  );
}
