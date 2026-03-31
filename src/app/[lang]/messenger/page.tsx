import MessengerTab from "@/components/MessengerTab";
import { I18nProvider } from "@/components/I18nProvider";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

export default async function MessengerPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { lang } = await params;
  const sp = await searchParams;
  const chatId = sp.chatId || null;
  const dictionary = await getDictionary(lang as Locale);
  return (
    <I18nProvider dictionary={dictionary} lang={lang as Locale}>
      <MessengerTab initialChatId={chatId} />
    </I18nProvider>
  );
}
