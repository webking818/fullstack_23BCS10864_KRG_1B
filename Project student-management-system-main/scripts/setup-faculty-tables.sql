-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  department TEXT,
  specialization TEXT,
  phone TEXT,
  office_room TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create faculty_courses junction table
CREATE TABLE IF NOT EXISTS faculty_courses (
  id BIGSERIAL PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_code TEXT,
  grade TEXT,
  semester INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create student_faculty_mapping table
CREATE TABLE IF NOT EXISTS student_faculty_mapping (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Modify assignments to include faculty_id
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS class_name TEXT;

-- Modify marks to include faculty_id
ALTER TABLE marks ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_faculty_mapping ENABLE ROW LEVEL SECURITY;

-- Faculty RLS Policies
CREATE POLICY "Faculty can view their own profile" ON faculty
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Faculty can update their own profile" ON faculty
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Faculty can view their own courses" ON faculty_courses
  FOR SELECT USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can create courses" ON faculty_courses
  FOR INSERT WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can update their courses" ON faculty_courses
  FOR UPDATE USING (auth.uid() = faculty_id);

-- Student-Faculty mapping policies
CREATE POLICY "Faculty can view their student mappings" ON student_faculty_mapping
  FOR SELECT USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can create student mappings" ON student_faculty_mapping
  FOR INSERT WITH CHECK (auth.uid() = faculty_id);

-- Extended assignment policies for faculty
CREATE POLICY "Faculty can view their assignments" ON assignments
  FOR SELECT USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can create assignments" ON assignments
  FOR INSERT WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can update their assignments" ON assignments
  FOR UPDATE USING (auth.uid() = faculty_id);

-- Extended marks policies for faculty
CREATE POLICY "Faculty can view marks for their students" ON marks
  FOR SELECT USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can create marks" ON marks
  FOR INSERT WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can update marks" ON marks
  FOR UPDATE USING (auth.uid() = faculty_id);

-- Submissions policy for faculty feedback
CREATE POLICY "Faculty can view submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a 
      WHERE a.id = submissions.assignment_id 
      AND auth.uid() = a.faculty_id
    )
  );

CREATE POLICY "Faculty can update submissions with feedback" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assignments a 
      WHERE a.id = submissions.assignment_id 
      AND auth.uid() = a.faculty_id
    )
  );
