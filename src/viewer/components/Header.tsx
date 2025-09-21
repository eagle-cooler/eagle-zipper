interface HeaderProps {
  filePath: string | null;
  archiveType: 'zip' | 'rar' | '7z' | 'tar' | null;
}

export const Header: React.FC<HeaderProps> = ({ filePath, archiveType }) => {
  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        {filePath && (
          <span className="ml-4 text-sm opacity-70">
            {filePath.split('/').pop() || filePath.split('\\').pop()}
          </span>
        )}
      </div>
      <div className="flex-none">
        <span className="badge badge-primary">
          {archiveType?.toUpperCase()}
        </span>
      </div>
    </div>
  );
};