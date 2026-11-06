import { useRef, useState } from 'react'
import { loadCategories, saveCategories } from '../../services/categoryStorage.ts'
import type { Category } from '../../types/index.ts'
import { validateCategoryName } from './validateCategory.ts'

export type CategoryMutationResult =
  | { ok: true; category: Category }
  | { ok: false; message: string }

function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name))
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() =>
    sortCategories(loadCategories()),
  )
  const categoriesRef = useRef(categories)

  function commitCategories(nextCategories: Category[]): void {
    const sortedCategories = sortCategories(nextCategories)
    categoriesRef.current = sortedCategories
    setCategories(sortedCategories)
    saveCategories(sortedCategories)
  }

  function createCategory(name: string): CategoryMutationResult {
    const validation = validateCategoryName({
      name,
      existingCategories: categoriesRef.current,
    })

    if (!validation.ok) {
      return validation
    }

    const category: Category = {
      id: crypto.randomUUID(),
      name: validation.name,
    }

    commitCategories([...categoriesRef.current, category])
    return { ok: true, category }
  }

  function updateCategory(
    id: string,
    name: string,
  ): CategoryMutationResult {
    const existingCategory = categoriesRef.current.find(
      (category) => category.id === id,
    )

    if (!existingCategory) {
      return { ok: false, message: 'La categoría ya no existe.' }
    }

    const validation = validateCategoryName({
      name,
      existingCategories: categoriesRef.current,
      excludeCategoryId: id,
    })

    if (!validation.ok) {
      return validation
    }

    const category: Category = { ...existingCategory, name: validation.name }
    commitCategories(
      categoriesRef.current.map((currentCategory) =>
        currentCategory.id === id ? category : currentCategory,
      ),
    )
    return { ok: true, category }
  }

  function deleteCategory(id: string): void {
    const nextCategories = categoriesRef.current.filter(
      (category) => category.id !== id,
    )

    if (nextCategories.length !== categoriesRef.current.length) {
      commitCategories(nextCategories)
    }
  }

  return {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
