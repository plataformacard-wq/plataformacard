import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OrgEntrarPage(props: PageProps) {
  const { slug } = await props.params;
  redirect(`/${slug}/login`);
}
