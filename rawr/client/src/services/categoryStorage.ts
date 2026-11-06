import { categoryStorageKey } from '../features/categories/categoryConfig.ts'
import type { Category } from '../types/index.ts'

function isCategory(value: unknown): value is Category {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === 'string' &&
    record.id.length > 0 &&
    typeof record.name === 'string'
  )
}

function parseStoredCategories(raw: string): Category[] {
  try {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      console.warn(
        '[categoryStorage] Formato inválido; se usa lista vacía.',
      )
      return []
    }

    if (!parsed.every(isCategory)) {
      console.warn(
        '[categoryStorage] Categorías inválidas; se usa lista vacía.',
      )
      return []
    }

    return parsed
  } catch {
    console.warn('[categoryStorage] Datos corruptos; se usa lista vacía.')
    return []
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(categoryStorageKey)
    if (raw === null) {
      return []
    }
    return parseStoredCategories(raw)
  } catch {
    console.warn(
      '[categoryStorage] No se pudo leer localStorage; se usa lista vacía.',
    )
    return []
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(categoryStorageKey, JSON.stringify(categories))
  } catch {
    console.warn('[categoryStorage] No se pudo guardar en localStorage.')
  }
}
