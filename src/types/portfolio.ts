export interface Category {
  id: string;
  name: string;
  slug: string;
  title_ar: string;
  title_en: string;
}

export interface Service {
  id: string;
  title_ar: string;
  title_en: string;
  slug: string;
  description_ar: string | null;
  description_en: string | null;
  icon: string | null;
  image_url: string | null;
  price_from: string | null;
  price_note_ar: string | null;
  price_note_en: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
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
  services?: Service[];
}

export interface CreateProjectDTO {
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  category_id?: string;
  is_published?: boolean;
  service_ids?: string[];
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  title_ar: string;
  title_en: string;
}

export interface CreateServiceDTO {
  title_ar: string;
  title_en: string;
  slug: string;
  description_ar?: string;
  description_en?: string;
  icon?: string;
  image_url?: string;
  price_from?: string;
  price_note_ar?: string;
  price_note_en?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {}
