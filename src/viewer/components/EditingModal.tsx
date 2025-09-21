// Modal component for archive editing interface

interface EditingModalProps {
  isOpen: boolean;
  archiveName: string;
  tempDirectory: string;
  changedFiles: string[];
  onUpdate: () => void;
  onCancel: () => void;
  onOpenDirectory: () => void;
}

export const EditingModal: React.FC<EditingModalProps> = ({
  isOpen,
  archiveName,
  tempDirectory,
  changedFiles,
  onUpdate,
  onOpenDirectory
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="alert alert-info shadow-lg mb-4 mx-4">
      <div className="flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">Editing: {archiveName}</h3>
          <div className="text-sm opacity-75 font-mono break-all">
            {tempDirectory}
          </div>
          {changedFiles.length > 0 && (
            <div className="text-sm text-warning mt-1">
              📝 {changedFiles.length} file(s) modified
            </div>
          )}
        </div>
      </div>
      <div className="flex-none">
        <button 
          className="btn btn-sm btn-ghost mr-2"
          onClick={onOpenDirectory}
          title="Open extracted files directory"
        >
          📁 Open Directory
        </button>
        <button 
          className="btn btn-sm btn-success"
          onClick={onUpdate}
          title="Finish editing and update archive"
        >
          ✅ Finish Editing
        </button>
      </div>
    </div>
  );
};