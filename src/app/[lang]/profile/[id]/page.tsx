import ProfileView from "@/components/ProfileView";

export default async function ProfilePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  return <ProfileView profileId={id} lang={lang} />;
}
