import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as renderers from './src/build/render.js';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Build-time HTML composition.
 *
 * Two directives, both resolved before the HTML ever reaches a browser:
 *
 *   <!--@include:nav-->     inlines src/partials/nav.html
 *   <!--@render:industries--> inlines the output of a renderer in src/build/render.js
 *
 * Why not a runtime template or a framework: this site is content that must be
 * crawlable and instantly readable. Composing at build time keeps the shipped
 * HTML complete and static, while the source keeps a single definition of the
 * nav, the footer, and the solution matrix.
 *
 * Renderers are imported statically. Vite treats anything the config imports as
 * a config dependency, so editing render.js or a data file restarts the dev
 * server automatically — which is why this does not need (and must not use) a
 * cache-busting query import: the config is bundled, and a `?t=` specifier
 * cannot be resolved inside that bundle.
 */
export default function contentPlugin() {
  const readPartial = (name) => {
    const path = resolve(root, 'src/partials', `${name}.html`);
    if (!existsSync(path)) {
      throw new Error(`[content] missing partial: src/partials/${name}.html`);
    }
    return readFileSync(path, 'utf8');
  };

  return {
    name: 'naaz-content',
    enforce: 'pre',

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        let output = html;

        // 1. Partials.
        output = output.replace(/<!--@include:([\w-]+)-->/g, (_, name) => readPartial(name));

        // 2. Data-driven blocks. An optional `:arg` after the name is passed
        //    straight to the renderer — used by the per-industry landing pages,
        //    which are one renderer over eight real data rows.
        output = output.replace(/<!--@render:(\w+)(?::([a-z0-9-]+))?-->/g, (match, name, arg) => {
          const fn = renderers[`render${name[0].toUpperCase()}${name.slice(1)}`];
          if (typeof fn !== 'function') {
            this.warn(`[content] unknown renderer "${name}"`);
            return match;
          }
          return arg ? fn(arg) : fn();
        });

        // 3. Mark the current page in the nav. Doing this here rather than in
        //    JS means the correct item is highlighted in the first paint.
        //    Matched on the exact markup the nav partial emits (class before
        //    href) rather than a permissive attribute-order regex, so a
        //    partial edit that breaks this fails loudly in review instead of
        //    silently un-highlighting the nav.
        const page = basename(ctx.filename).replace(/\.html$/, '');
        const href = page === 'index' ? '/' : `/${page}.html`;
        output = output.replaceAll(
          `<a class="nav__link" href="${href}">`,
          `<a class="nav__link" href="${href}" aria-current="page">`,
        );

        // 4. Seed the nav's colour context from the page's own header.
        //    nav.js re-derives this on every scroll, but the *first* paint
        //    happens before any JS runs — and a nav that assumes a dark hero
        //    is invisible on the pages whose header is ivory. Deciding it here
        //    means the rail is legible in the very first frame.
        const hasDarkHeader = /class="hero[\s"]|page-head--dark/.test(output);
        output = output.replace(
          'data-nav-context="dark"',
          `data-nav-context="${hasDarkHeader ? 'dark' : 'light'}"`,
        );

        return output;
      },
    },

    // Editing a partial or a data file must reload every page that uses it.
    handleHotUpdate({ file, server }) {
      if (/src[\\/](partials|data|build)[\\/]/.test(file)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
