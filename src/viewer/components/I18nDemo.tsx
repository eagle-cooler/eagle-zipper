// i18n Demo Component - Shows how the translation system works

import { t } from '../utils/i18n';

export const I18nDemo: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">i18n Translation Demo</h2>
      
      <div className="space-y-2">
        <h3 className="font-semibold">UI Translations:</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t('app.ui.editing.title', { archiveName: 'example.zip' })}</li>
          <li>{t('app.ui.editing.filesModified', { count: 3 })}</li>
          <li>{t('app.ui.editing.openDirectory')}</li>
          <li>{t('app.ui.editing.finishEditing')}</li>
          <li>{t('app.ui.password.title')}</li>
          <li>{t('app.ui.contextMenu.editFile')}</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Notification Translations:</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>{t('app.notifications.editUnavailable.title')}:</strong> {t('app.notifications.editUnavailable.description')}</li>
          <li><strong>{t('app.notifications.fileOpened.title')}:</strong> {t('app.notifications.fileOpened.description', { fileName: 'test.txt' })}</li>
          <li><strong>{t('app.notifications.updateSuccess.title')}:</strong> {t('app.notifications.updateSuccess.description')}</li>
        </ul>
      </div>

      <div className="alert alert-info">
        <div>
          <h4 className="font-semibold">How it works:</h4>
          <p>This extension uses Eagle's built-in i18next integration. Translations are stored in <code>_locales/</code> files and accessed via the <code>t()</code> function.</p>
          <p>Supported languages: English, Japanese, Chinese (Simplified), Chinese (Traditional)</p>
        </div>
      </div>
    </div>
  );
};