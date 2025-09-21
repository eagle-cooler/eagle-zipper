import { useState } from 'react';
import { t } from '../utils/i18n';

interface PasswordPromptProps {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({ isOpen, onSubmit, onCancel }) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword('');
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{t('app.ui.password.title')}</h3>
        <form onSubmit={handleSubmit} className="py-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t('app.ui.password.enterPassword')}</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              placeholder={t('app.ui.password.placeholder')}
              autoFocus
            />
          </div>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onCancel}>
              {t('app.ui.password.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {t('app.ui.password.open')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};