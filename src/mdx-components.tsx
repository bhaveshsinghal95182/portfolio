import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * Typography for MDX post bodies. Keeps written content on the same type scale
 * as the rest of the site instead of falling back to browser defaults.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="font-jost font-medium tracking-tight text-title text-lg mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-jost font-medium tracking-tight text-title mt-6">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="font-poppins text-body text-sm/relaxed mt-3">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-3 space-y-1 list-disc pl-5 font-poppins text-body text-sm/relaxed">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-3 space-y-1 list-decimal pl-5 font-poppins text-body text-sm/relaxed">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-l-2 border-accent/60 pl-4 font-jost text-body text-sm/relaxed italic">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <Link
        href={href ?? "#"}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-accent underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </Link>
    ),
    code: ({ children }) => (
      <code className="font-mono text-[0.85em] rounded bg-muted-black/10 px-1 py-0.5">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="mt-4 overflow-x-auto rounded-lg border border-muted-black/20 bg-surface p-3 font-mono text-xs text-body">
        {children}
      </pre>
    ),
    hr: () => <hr className="my-8 border-muted-black/20" />,
    ...components,
  };
}
