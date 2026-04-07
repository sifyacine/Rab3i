import { supabase } from '@/lib/supabase';
import { Category, CreateCategoryDTO } from '@/types/portfolio';

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('title_ar');
       
    if (error) throw error;
    return data as Category[];
  },

  async createCategory(category: CreateCategoryDTO) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        name: category.title_ar,
        title_ar: category.title_ar,
        title_en: category.title_en,
        slug: category.slug,
        description_ar: category.description_ar,
        description_en: category.description_en,
        sort_order: category.sort_order ?? 0,
        is_active: true
      }])
      .select()
      .single();
       
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<CreateCategoryDTO>) {
    const payload: Record<string, unknown> = {};
    if (updates.title_ar !== undefined) {
      payload.name = updates.title_ar;
      payload.title_ar = updates.title_ar;
    }
    if (updates.title_en !== undefined) payload.title_en = updates.title_en;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description_ar !== undefined) payload.description_ar = updates.description_ar;
    if (updates.description_en !== undefined) payload.description_en = updates.description_en;
    if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;
    
    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
       
    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
       
    if (error) throw error;
  }
};
