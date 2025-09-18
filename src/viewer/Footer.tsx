interface FooterProps {
  itemCount: number;
  currentPath: string;
}

export const Footer: React.FC<FooterProps> = ({ itemCount, currentPath }) => {
  return (
    <div className="footer footer-center p-4 bg-base-200 text-base-content">
      <div>
        <p>
          {itemCount} items 
          {currentPath && ` in ${currentPath}`}
        </p>
      </div>
    </div>
  );
};