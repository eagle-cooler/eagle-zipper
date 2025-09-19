import { useState } from 'react';

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
        <h3 className="font-bold text-lg">Archive is Password Protected</h3>
        <form onSubmit={handleSubmit} className="py-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Enter Password:</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Password"
              autoFocus
            />
          </div>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Open
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};