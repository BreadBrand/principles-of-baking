/// <reference types="vite/client" />

declare namespace React {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required to match React.HTMLAttributes<T>'s generic arity for declaration merging
  interface HTMLAttributes<T> {
    inert?: "" | undefined;
  }
}

