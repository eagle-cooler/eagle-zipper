interface BreadcrumbProps {
  currentPath: string;
  onNavigateToFolder: (folderPath: string) => void;
  onNavigateToRoot: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  currentPath, 
  onNavigateToFolder, 
  onNavigateToRoot 
}) => {
  if (!currentPath) return null;

  return (
    <div className="breadcrumbs text-sm px-4 py-2 bg-base-100">
      <ul>
        <li>
          <button onClick={onNavigateToRoot} className="link">
            Root
          </button>
        </li>
        {currentPath.split('/').map((part, index, array) => (
          <li key={index}>
            <button
              onClick={() => onNavigateToFolder(array.slice(0, index + 1).join('/'))}
              className="link"
            >
              {part}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};