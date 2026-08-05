const fs = require('fs');

const mapping = {
  AlertCircle: 'Alert01Icon',
  AlertTriangle: 'Alert02Icon',
  ArrowDownAz: 'SortingZA01Icon',
  ArrowDownLeft: 'ArrowDownLeft01Icon',
  ArrowLeft: 'ArrowLeft01Icon',
  ArrowRight: 'ArrowRight01Icon',
  ArrowUpAz: 'TextSquareIcon',
  ArrowUpRight: 'ArrowUpRight01Icon',
  Bell: 'Notification01Icon',
  Building2: 'Building03Icon',
  Calendar: 'Calendar01Icon',
  Camera: 'Camera01Icon',
  Check: 'Tick02Icon',
  CheckCircle2: 'CheckmarkCircle01Icon',
  CheckIcon: 'Tick01Icon',
  ChevronDown: 'ArrowDown01Icon',
  ChevronDownIcon: 'ArrowDown02Icon',
  ChevronLeft: 'ArrowLeft01Icon',
  ChevronLeftIcon: 'ArrowLeft02Icon',
  ChevronRight: 'ArrowRight01Icon',
  ChevronRightIcon: 'ArrowRight02Icon',
  ChevronUpIcon: 'ArrowUp02Icon',
  ChevronsUpDown: 'ArrowUpDownIcon',
  CircleCheckIcon: 'CheckmarkCircle02Icon',
  Clock: 'Clock01Icon',
  CreditCard: 'CreditCardIcon',
  DollarSign: 'DollarCircleIcon',
  Eye: 'ViewIcon',
  EyeOff: 'ViewOffIcon',
  FileSpreadsheet: 'File01Icon',
  FileText: 'File02Icon',
  Filter: 'FilterIcon',
  Globe: 'GlobalIcon',
  Hash: 'HashtagIcon',
  Home: 'Home01Icon',
  Image: 'Image01Icon',
  InfoIcon: 'InformationCircleIcon',
  Landmark: 'BankIcon',
  Languages: 'TranslateIcon',
  LayoutGrid: 'LayoutGridIcon',
  Loader2Icon: 'Loading02Icon',
  LogOut: 'Logout01Icon',
  LucideIcon: 'HugeiconsIconProps',
  Mail: 'Mail01Icon',
  MapPin: 'Location01Icon',
  OctagonXIcon: 'CancelCircleIcon',
  Pencil: 'PencilEdit01Icon',
  Phone: 'CallIcon',
  Plus: 'PlusSignIcon',
  PlusCircle: 'PlusSignCircleIcon',
  ReceiptText: 'Invoice01Icon',
  Search: 'Search01Icon',
  SearchIcon: 'Search02Icon',
  Settings2: 'Settings02Icon',
  ShieldAlert: 'Alert02Icon',
  ShieldCheck: 'SecurityCheckIcon',
  Trash2: 'Delete02Icon',
  TriangleAlertIcon: 'Alert01Icon',
  User: 'UserIcon',
  Users: 'UserGroupIcon',
  Wallet: 'Wallet01Icon',
  X: 'Cancel01Icon',
  XIcon: 'Cancel02Icon',
  Zap: 'FlashIcon'
};

const files = [
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/signup/page.tsx',
  'src/app/(dashboard)/accounts/[id]/edit/page.tsx',
  'src/app/(dashboard)/accounts/[id]/page.tsx',
  'src/app/(dashboard)/accounts/create/page.tsx',
  'src/app/(dashboard)/accounts/page.tsx',
  'src/app/(dashboard)/businesses/create/page.tsx',
  'src/app/(dashboard)/businesses/page.tsx',
  'src/app/(dashboard)/cheques/create/page.tsx',
  'src/app/(dashboard)/cheques/page.tsx',
  'src/app/(dashboard)/features/page.tsx',
  'src/app/(dashboard)/page.tsx',
  'src/app/(dashboard)/parties/[id]/edit/page.tsx',
  'src/app/(dashboard)/parties/[id]/page.tsx',
  'src/app/(dashboard)/parties/create/page.tsx',
  'src/app/(dashboard)/parties/page.tsx',
  'src/app/(dashboard)/settings/page.tsx',
  'src/app/onboarding/page.tsx',
  'src/components/bank-selector.tsx',
  'src/components/bottom-nav.tsx',
  'src/components/business-switcher.tsx',
  'src/components/cheque-card.tsx',
  'src/components/global-search.tsx',
  'src/components/top-nav.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/combobox.tsx',
  'src/components/ui/command.tsx',
  'src/components/ui/data-state.tsx',
  'src/components/ui/delete-dialog.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/empty-state.tsx',
  'src/components/ui/entity-avatar.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/toast.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. Process `import * as LucideIcons from 'lucide-react'`
    if (content.includes("import * as LucideIcons from 'lucide-react'")) {
      content = content.replace("import * as LucideIcons from 'lucide-react'", "import { HugeiconsIcon } from '@hugeicons/react';
import * as HugeIcons from '@hugeicons/core-free-icons';");
      content = content.replace(/LucideIcons\s+as\s+any/g, "HugeIcons as any");
      content = content.replace(/<IconComponent\s+className=/g, "<IconComponent variant=\"bulk\" className=");
    }

    // 2. Process standard imports
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
    let match;
    let newImports = [];
    let replacements = [];

    while ((match = importRegex.exec(content)) !== null) {
      const fullImport = match[0];
      const icons = match[1].split(',').map(s => s.trim()).filter(s => s);
      
      let mappedIcons = [];
      icons.forEach(iconStr => {
        let originalName = iconStr;
        let alias = null;
        if (iconStr.includes(' as ')) {
          const parts = iconStr.split(' as ');
          originalName = parts[0].trim();
          alias = parts[1].trim();
        }

        const newName = mapping[originalName] || originalName;
        
        if (alias) {
          mappedIcons.push(`${newName} as ${alias}`);
        } else {
          // If we map it to a new name, we probably want to alias it back to the original name to avoid changing all code references
          // Wait, if I do `ArrowDown01Icon as ChevronDown`, I can keep the code as `<ChevronDown />`.
          if (newName !== originalName) {
            mappedIcons.push(`${newName} as ${originalName}`);
          } else {
            mappedIcons.push(newName);
          }
        }
      });
      
      replacements.push({
        old: fullImport,
        new: `import { ${mappedIcons.join(', ')} } from 'hugeicons-react'`
      });
      
      // Also we need to add variant="bulk" to the usages.
      // E.g. <ChevronDown -> <ChevronDown variant="bulk"
      // Note: Some might be used as props like `icon: ChevronDown`.
      // We will blindly replace `<IconName ` with `<IconName variant="bulk" ` or `<IconName>` with `<IconName variant="bulk">`
      icons.forEach(iconStr => {
        let alias = iconStr;
        if (iconStr.includes(' as ')) {
          alias = iconStr.split(' as ')[1].trim();
        }
        
        if (alias === 'LucideIcon') return; // Type doesn't need variant
        
        // Replace <IconName ... with <IconName variant="bulk" ...
        // Replace <IconName> with <IconName variant="bulk">
        const jsxRegex1 = new RegExp(`<${alias}(?=\\s|>)`, 'g');
        content = content.replace(jsxRegex1, (m) => {
          return `<${alias} variant="bulk"`;
        });
        
        // Also handle cases like <item.icon ... 
        // We'll just do a global replace for `<item.icon `
        // Wait, bottom-nav.tsx has `<item.icon className={`
        content = content.replace(/<item\.icon(?=\s|>)/g, `<item.icon variant="bulk"`);
        // cheque-card.tsx has `<Icon ` (where Icon is mapped from a dictionary maybe? Let's check cheque-card)
      });
    }

    // Apply import replacements
    replacements.forEach(rep => {
      content = content.replace(rep.old, rep.new);
    });

    // Special fix for `LucideIcon` type if mapped to `HugeiconsIconProps`
    // We should change `LucideIcon` to `React.FC<HugeiconsIconProps>` or just `React.FC<any>` to be safe, 
    // or just leave it as is if we mapped it, wait `HugeiconsIconProps` is not a component type.
    content = content.replace(/import \{ ([^}]*)HugeiconsIconProps([^}]*) \} from 'hugeicons-react'/, (m, p1, p2) => {
      return `import { ${p1}HugeiconsIconProps${p2} } from '@hugeicons/react'`;
    });
    // Actually hugeicons-react exports the icons, @hugeicons/react exports props. 
    // Let's just manually fix `empty-state.tsx` where `LucideIcon` is used.
    
    fs.writeFileSync(file, content);
  }
});
