import AnnouncementsAdmin from "@/components/AnnouncementsAdmin";
import { I18nProvider } from "@/components/I18nProvider";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

export default async function AnnouncementsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  return (
    <I18nProvider dictionary={dictionary} lang={lang as Locale}>
      <AnnouncementsAdmin />
    </I18nProvider>
  );
}
