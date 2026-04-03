export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  media_url: string;
  type: 'image' | 'video';
  order_index: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  category_id: string | null;
  is_published: boolean;
  views: number;
  category?: Category;
  project_media?: ProjectMedia[];
}

export interface CreateProjectDTO {
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  category_id?: string;
  is_published?: boolean;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export interface CreateCategoryDTO {
  name: string;
  slug: string;
}
