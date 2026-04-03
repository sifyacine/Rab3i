import { supabase } from '@/lib/supabase';
import { ProjectMedia } from '@/types/portfolio';

export const mediaService = {
  async uploadMedia(file: File, path: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from('projects-media')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('projects-media')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async addProjectMedia(projectId: string, mediaUrls: string[], type: 'image' | 'video' = 'image') {
    const mediaInserts = mediaUrls.map((url, index) => ({
      project_id: projectId,
      media_url: url,
      type,
      order_index: index
    }));

    const { data, error } = await supabase
      .from('project_media')
      .insert(mediaInserts)
      .select();

    if (error) throw error;
    return data as ProjectMedia[];
  },

  async deleteProjectMedia(id: string) {
    // First, get the media to delete from storage if needed. 
    // Wait, the DB only deletes the reference. We might also want to delete it from storage, 
    // but typically we can just let Supabase delete the DB row for now.
    const { error } = await supabase
      .from('project_media')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
