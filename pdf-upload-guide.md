# Dalal Classes - PDF Upload Guide

## 1. SQL: Create Chapter "Course Resource"

```sql
INSERT INTO chapters (id, course_id, title, order_index)
VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'Course Resource',
  1
)
RETURNING id;
```

---

## 2. SQL: Insert Module (replace `chapter_id` with result from step 1)

```sql
INSERT INTO modules (id, chapter_id, title, pdf_url, order_index)
VALUES (
  gen_random_uuid(),
  'YOUR_CHAPTER_ID_FROM_STEP_1',
  'Complete AI Course PDF',
  'PLACEHOLDER_URL',
  1
)
RETURNING id;
```

---

## 3. Supabase Storage Setup & Upload Code

### Bucket Setup (in Supabase Dashboard)
- **Bucket name**: `course-materials`
- **Public**: YES (checked)
- **File size limit**: 50MB

### TypeScript Upload Code

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Upload a PDF file to Supabase Storage
 * @param file - The PDF File object
 * @param courseId - Course ID for folder organization
 * @param moduleId - Module ID for unique file naming
 * @returns Public URL of uploaded file
 */
export async function uploadCourseMaterial(
  file: File,
  courseId: string,
  moduleId: string
): Promise<string> {
  if (!file.type.includes('pdf')) {
    throw new Error('Only PDF files are allowed');
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File size must be under 50MB');
  }

  const fileName = `${courseId}/${moduleId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from('course-materials')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/pdf',
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('course-materials')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
```

---

## 4. SQL: RLS Policy for Storage Bucket

```sql
-- Create storage bucket (run once in SQL Editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  52428800,
  ARRAY['application/pdf']
);

-- RLS: Only allow access if user is enrolled in the course
CREATE POLICY "Allow enrolled students to access course materials"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'course-materials'
  AND (
    -- Get the course_id from the file path (format: courseId/moduleId/filename)
    ( SELECT course_id::text FROM chapters 
      WHERE id = (
        SELECT chapter_id FROM modules 
        WHERE id = (storage.foldername(name)[1])::uuid
      ) LIMIT 1
    ) IN (
      SELECT course_id FROM enrollments WHERE user_id = auth.uid()
    )
    OR bucket_id != 'course-materials'
  )
);
```

**Note:** The RLS policy above is complex. A simpler approach is to make the bucket public (students can access any PDF). For course-specific access, you'd typically check enrollment on the application layer.

---

## 5. SQL: Update Module with Real PDF URL

```sql
UPDATE modules
SET pdf_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/course-materials/COURSE_ID/MODULE_ID/Complete_AI_Course.pdf'
WHERE id = 'YOUR_MODULE_ID';
```

---

## 6. React Component: PDF Viewer

```tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Module {
  id: string;
  title: string;
  pdf_url: string;
  chapter_id: string;
}

interface Chapter {
  id: string;
  course_id: string;
}

interface Props {
  courseId: string;
  moduleId: string;
  supabase: ReturnType<typeof createClient>;
}

export function CourseMaterialViewer({ courseId, moduleId, supabase }: Props) {
  const [module, setModule] = useState<Module | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        setLoading(true);

        // 1. Check if user is enrolled
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please sign in to access course materials');
          setLoading(false);
          return;
        }

        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (!enrollment) {
          setError('You must be enrolled to access this material');
          setLoading(false);
          return;
        }

        setIsEnrolled(true);

        // 2. Fetch module data
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('id, title, pdf_url, chapter_id')
          .eq('id', moduleId)
          .single();

        if (moduleError || !moduleData?.pdf_url) {
          setError('Material not found');
          setLoading(false);
          return;
        }

        setModule(moduleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [courseId, moduleId, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!module?.pdf_url) {
    return (
      <div className="p-6 bg-dark-card/60 border border-dark-border rounded-lg">
        <p className="text-slate-400">PDF not available</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card/60 border border-dark-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-white">{module.title}</h2>
      </div>
      
      <div className="aspect-[3/4] w-full h-[800px]">
        <iframe
          src={module.pdf_url}
          title={module.title}
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      </div>

      <div className="p-4 border-t border-dark-border">
        <a
          href={module.pdf_url}
          download={module.title}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-violet text-white rounded-lg hover:bg-accent-violet/80 transition-colors"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}

export default CourseMaterialViewer;
```

---

## Quick Reference

| Step | Description |
|------|-------------|
| 1 | Create chapter in DB, copy the returned `id` |
| 2 | Insert module with chapter_id from step 1 |
| 3 | Create `course-materials` bucket in Storage, use upload code |
| 4 | Make bucket public (easiest) or add RLS policy |
| 5 | Run UPDATE with real URL from step 3 |
| 6 | Use component in your lesson page |