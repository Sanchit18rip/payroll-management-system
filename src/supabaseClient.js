import { createClient }
  from '@supabase/supabase-js'

const supabaseUrl =
  'https://eikeuvwyjxghyzjepcfm.supabase.co'

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa2V1dnd5anhnaHl6amVwY2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5Nzc4OTksImV4cCI6MjA5NjU1Mzg5OX0.1YL14VeD8KF7JFuOlBY8zzoF34XYqTJZG6bDG9AaEkc'

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  )