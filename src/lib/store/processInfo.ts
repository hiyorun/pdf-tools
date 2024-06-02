import type { ProcessInfo } from "$lib/types";
import { writable } from "svelte/store";
  
  export const progressStore = writable<Record<string, ProcessInfo>>({});