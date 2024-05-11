/// <reference types="vite/client" />
interface ImportMeta {
  globEager: (globPattern: string) => { [key: string]: { default: string } };
}
