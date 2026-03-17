// Auto-generated types for Rankwise DB schema
// Re-run: npx supabase gen types typescript --local > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      academies: {
        Row: {
          id: string; name: string; slug: string; logo_url: string | null
          city: string | null; state: string | null; phone: string | null
          email: string; plan: 'trial' | 'starter' | 'pro' | 'enterprise'
          is_active: boolean; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['academies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['academies']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string; academy_id: string | null
          role: 'super_admin' | 'academy_admin' | 'teacher' | 'student'
          full_name: string; phone: string | null; avatar_url: string | null
          is_active: boolean; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      exam_categories: {
        Row: { id: string; code: string; name: string; description: string | null; icon: string | null; is_active: boolean; sort_order: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['exam_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['exam_categories']['Insert']>
      }
      exams: {
        Row: {
          id: string; category_id: string; code: string; name: string
          conducting_body: string | null; description: string | null
          total_marks: number | null; duration_mins: number | null
          negative_marking: number; tiers: number; eligibility: string | null
          official_url: string | null; is_active: boolean; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['exams']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['exams']['Insert']>
      }
      exam_patterns: {
        Row: { id: string; exam_id: string; tier_number: number; section_name: string; subject_code: string; total_questions: number; marks_per_q: number; time_mins: number | null; sort_order: number }
        Insert: Omit<Database['public']['Tables']['exam_patterns']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['exam_patterns']['Insert']>
      }
      subjects: {
        Row: { id: string; code: string; name: string; description: string | null; color: string | null; icon: string | null; is_shared: boolean; sort_order: number; is_active: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
      }
      exam_subjects: {
        Row: { exam_id: string; subject_id: string; weightage_pct: number | null }
        Insert: Database['public']['Tables']['exam_subjects']['Row']
        Update: Partial<Database['public']['Tables']['exam_subjects']['Insert']>
      }
      chapters: {
        Row: { id: string; subject_id: string; name: string; description: string | null; sort_order: number; is_active: boolean }
        Insert: Omit<Database['public']['Tables']['chapters']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['chapters']['Insert']>
      }
      topics: {
        Row: { id: string; chapter_id: string; name: string; description: string | null; difficulty: 'easy' | 'medium' | 'hard'; expected_time_mins: number; sort_order: number; is_active: boolean }
        Insert: Omit<Database['public']['Tables']['topics']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['topics']['Insert']>
      }
      teachers: {
        Row: { id: string; academy_id: string; user_id: string | null; name: string; email: string; phone: string | null; bio: string | null; photo_url: string | null; experience_yrs: number; rating: number; whatsapp_number: string | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: Omit<Database['public']['Tables']['teachers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['teachers']['Insert']>
      }
      questions: {
        Row: { id: string; academy_id: string | null; topic_id: string; question_text: string; question_html: string | null; question_type: 'mcq' | 'true_false' | 'integer' | 'descriptive'; difficulty: 'easy' | 'medium' | 'hard'; is_pyq: boolean; pyq_year: number | null; pyq_exam_code: string | null; solution_text: string | null; solution_html: string | null; solution_video_url: string | null; time_limit_secs: number; marks: number; tags: string[] | null; source: string | null; created_by: string | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }
      question_options: {
        Row: { id: string; question_id: string; option_text: string; option_html: string | null; is_correct: boolean; sort_order: number }
        Insert: Omit<Database['public']['Tables']['question_options']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['question_options']['Insert']>
      }
      events: {
        Row: { id: string; academy_id: string; title: string; description: string | null; event_type: 'class' | 'mock_test' | 'revision' | 'doubt_session' | 'announcement' | 'exam_alert'; starts_at: string; ends_at: string | null; is_online: boolean; meeting_url: string | null; whatsapp_group_id: string | null; notify_whatsapp: boolean; exam_id: string | null; subject_id: string | null; teacher_id: string | null; max_students: number | null; created_by: string | null; status: 'scheduled' | 'live' | 'completed' | 'cancelled'; created_at: string; updated_at: string }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      batches: {
        Row: { id: string; academy_id: string; name: string; description: string | null; exam_id: string | null; teacher_id: string | null; starts_on: string | null; ends_on: string | null; whatsapp_group_link: string | null; max_students: number | null; is_active: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['batches']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['batches']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Convenience types
export type Academy       = Database['public']['Tables']['academies']['Row']
export type UserProfile   = Database['public']['Tables']['user_profiles']['Row']
export type ExamCategory  = Database['public']['Tables']['exam_categories']['Row']
export type Exam          = Database['public']['Tables']['exams']['Row']
export type ExamPattern   = Database['public']['Tables']['exam_patterns']['Row']
export type Subject       = Database['public']['Tables']['subjects']['Row']
export type Chapter       = Database['public']['Tables']['chapters']['Row']
export type Topic         = Database['public']['Tables']['topics']['Row']
export type Teacher       = Database['public']['Tables']['teachers']['Row']
export type Question      = Database['public']['Tables']['questions']['Row']
export type QuestionOption = Database['public']['Tables']['question_options']['Row']
export type Event         = Database['public']['Tables']['events']['Row']
export type Batch         = Database['public']['Tables']['batches']['Row']
