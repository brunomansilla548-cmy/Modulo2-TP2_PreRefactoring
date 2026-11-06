import type { Category } from '../../types/index.ts'
import {
  categoryNameMaxLength,
  categoryNameMinLength,
} from './categoryConfig.ts'

export type ValidateCategoryNameInput = {
  name: string
  existingCategories: Category[]
  excludeCategoryId?: string
}

export type ValidateCategoryNameResult =
  | { ok: true; name: string }
  | { ok: false; message: string }

function isDuplicateName(
  normalizedName: string,
  existingCategories: Category[],
  excludeCategoryId: string | undefined,
): boolean {
  return existingCategories.some((category) => {
    if (excludeCategoryId !== undefined && category.id === excludeCategoryId) {
      return false
    }
    return category.name.trim().toLowerCase() === normalizedName
  })
}

export function validateCategoryName(
  input: ValidateCategoryNameInput,
): ValidateCategoryNameResult {
  const trimmedName = input.name.trim()

  if (trimmedName.length === 0) {
    return { ok: false, message: 'El nombre no puede estar vacío.' }
  }

  if (trimmedName.length < categoryNameMinLength) {
    return {
      ok: false,
      message: `El nombre debe tener al menos ${categoryNameMinLength} caracteres.`,
    }
  }

  if (trimmedName.length > categoryNameMaxLength) {
    return {
      ok: false,
      message: `El nombre no puede superar los ${categoryNameMaxLength} caracteres.`,
    }
  }

  const normalizedName = trimmedName.toLowerCase()

  if (
    isDuplicateName(
      normalizedName,
      input.existingCategories,
      input.excludeCategoryId,
    )
  ) {
    return {
      ok: false,
      message: 'Ya existe una categoría con ese nombre.',
    }
  }

  return { ok: true, name: trimmedName }
}
