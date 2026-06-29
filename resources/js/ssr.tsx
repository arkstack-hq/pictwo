import { ComponentType } from 'react';
import ReactDOMServer from 'react-dom/server';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = import.meta.glob<{ default: ComponentType }>(
        './Pages/**/*.tsx',
        { eager: true },
      );

      return pages[`./Pages/${name}.tsx`];
    },
    setup: ({ App, props }) => <App {...props} />,
  }),
);
