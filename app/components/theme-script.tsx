export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const stored = localStorage.getItem('theme') || 'system';
              let effectiveTheme;
              if (stored === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                effectiveTheme = prefersDark ? 'dark' : 'light';
              } else {
                effectiveTheme = stored;
              }
              if (effectiveTheme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}

