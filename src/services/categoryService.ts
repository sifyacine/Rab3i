import { supabase } from '@/lib/supabase';
import { Category, CreateCategoryDTO } from '@/types/portfolio';

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data as Category[];
  },

  async createCategory(category: CreateCategoryDTO) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
      
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<CreateCategoryDTO>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
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
