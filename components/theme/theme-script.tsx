export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('postpurush-theme') || 'og-shadcn';
        var mode = localStorage.getItem('postpurush-mode') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-mode', mode);
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch(e) {
        document.documentElement.setAttribute('data-theme', 'og-shadcn');
        document.documentElement.setAttribute('data-mode', 'dark');
        document.documentElement.classList.add('dark');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
