> for gitops workflows, refer to [template](https://github.com/eagle-cooler/template)

# Eagle Zipper Extension

**Browse and edit compressed files directly in Eagle.cool - no extraction needed!**

Ever wanted to peek inside a ZIP file or quickly edit something without the hassle of extracting, modifying, and re-compressing? Eagle Zipper lets you browse archive contents like folders and edit ZIP files with just a right-click.

## What You Can Do

### 🔍 **Browse Any Archive Like a Folder**
- Open ZIP, RAR, and 7Z files directly in Eagle
- Navigate through folders with breadcrumb trails
- Sort files by name, size, or date
- Handle password-protected archives seamlessly

### ✏️ **Edit ZIP Files On-the-Fly**
- Right-click any ZIP file → "Edit Archive"
- Files automatically open in your default applications
- Make changes and save - Eagle Zipper handles the rest
- Original ZIP updates automatically when you're done

### 🔒 **Handle Protected Archives**
- Encrypted ZIP files? No problem - just enter the password
- RAR archives with passwords work seamlessly
- Secure handling ensures your passwords stay safe

### 🎨 **Fits Right Into Eagle**
- Matches your Eagle theme (dark/light mode)
- Native Eagle integration - feels like it's built-in
- No learning curve - works exactly how you'd expect

## What's Not Supported

### 🚫 **By Design** (Won't Be Added)
- **Creating new archives** - Eagle is for managing files, not creating them
- **Major archive restructuring** - Use dedicated archive tools for heavy modifications
- **Advanced compression settings** - Keeps the workflow simple and focused

### ⏳ **Not Yet** (Future Possibilities)  
- **Editing RAR/7Z files** - technical limitations with these formats

## How It Works

When you edit a ZIP file, Eagle Zipper:
1. Extracts files to a secure temporary folder
2. Opens them in your default applications
3. Monitors for changes automatically
4. Rebuilds the ZIP when you're finished
5. Replaces the original file in Eagle

Everything happens behind the scenes - you just edit and save like normal!

---

## For Developers

### Tech Stack
- **React 18** + **TypeScript** - Modern UI with type safety
- **Vite** - Fast build system with HMR  
- **TailwindCSS** + **DaisyUI** - Responsive styling with Eagle theme integration
- **Archive Libraries**: adm-zip (editing), node-unrar-js, 7zip-min

### Development

**Install dependencies**
```sh
pnpm i
```

**Development with watch mode**
```sh
pnpm dev
```

**Build for production**
```sh
pnpm build
```

### Architecture
The codebase is organized into focused modules:
- `components/` - React UI components
- `loaders/` - Format-specific archive parsing  
- `extractors/` - File extraction and ZIP rebuilding
- `updater/` - Archive editing orchestration with Eagle API
- `utils/` - File monitoring, crypto, and temp directory management

---

## Credits

Built on the [eagle-plugin-vite-react-ts](https://github.com/meetqy/eagle-plugin-vite-react-ts) template.
