import { t } from '../utils/i18n';
import { normalizePath } from '../utils';

interface FooterProps {
  itemCount: number;
  currentPath: string;
}

export const Footer: React.FC<FooterProps> = ({ itemCount, currentPath }) => {
  const normalizedPath = normalizePath(currentPath);
  
  return (
    <div className="footer footer-center p-4 bg-base-200 text-base-content">
      <div>
        <p>
          {currentPath 
            ? t('app.ui.footer.itemsIn').replace('{{count}}', itemCount.toString()).replace('{{path}}', normalizedPath)
            : `${itemCount} ${t('app.ui.footer.items')}`
          }
        </p>
      </div>
    </div>
  );
};