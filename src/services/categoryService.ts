import { supabase } from '@/lib/supabase';
import { Category, CreateCategoryDTO } from '@/types/portfolio';

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_ar', { ascending: true });
        
    if (error) {
      console.error('getCategories error:', error);
      throw error;
    }
    // Map DB fields (name_ar/name_en) to TypeScript fields (title_ar/title_en)
    return (data ?? []).map(cat => ({
      id: cat.id,
      name_ar: cat.name_ar,
      name_en: cat.name_en,
      slug: cat.slug,
      title_ar: cat.name_ar,
      title_en: cat.name_en,
      created_at: cat.created_at,
    }));
  },

  async createCategory(category: CreateCategoryDTO) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        name_ar: category.title_ar,
        name_en: category.title_en,
        slug: category.slug
      }])
      .select()
      .single();
       
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<CreateCategoryDTO>) {
    const payload: Record<string, unknown> = {};
    if (updates.title_ar !== undefined) payload.name_ar = updates.title_ar;
    if (updates.title_en !== undefined) payload.name_en = updates.title_en;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    
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
