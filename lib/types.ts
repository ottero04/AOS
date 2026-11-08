export interface Project {
  id: string
  title: string
  shortDescription: string
  longDescription: string
  mainImage: string
  additionalImages: string[]
  liveUrl: string
  status: 'draft' | 'published'
  featured?: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  title: string
  description: string
  icon: string
}

export interface ContactFormData {
  nombre: string
  email: string
  mensaje: string
}
