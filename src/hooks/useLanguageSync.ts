import { useEffect } from "react";
import i18n from "../shared/i18n";
import { resolveLanguage, type LanguageSetting } from "../shared/i18n";
import { onSettingsChange } from "../settings/service";

export function useLanguageSync() {
  useEffect(() => {
    const cleanup = onSettingsChange((s) => {
      const lang = s.language as LanguageSetting | undefined;
      if (lang) {
        const resolved = resolveLanguage(lang);
        if (i18n.language !== resolved) {
          i18n.changeLanguage(resolved);
        }
      }
    });
    return () => {
      cleanup.then((fn) => fn());
    };
  }, []);
}
