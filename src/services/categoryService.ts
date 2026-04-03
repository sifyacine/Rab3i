import { supabase } from '@/lib/supabase';
import { Category, CreateCategoryDTO } from '@/types/portfolio';

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('title_ar');
      
    if (error) throw error;
    return data as Category[];
  },

  async createCategory(category: CreateCategoryDTO) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, name: category.title_ar }])
      .select()
      .single();
      
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<CreateCategoryDTO>) {
    const payload: Record<string, string | undefined> = { ...updates };
    if (updates.title_ar) payload.name = updates.title_ar;
    
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
