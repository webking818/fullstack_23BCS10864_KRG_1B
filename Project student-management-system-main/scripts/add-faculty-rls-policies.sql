-- Add faculty_id to relevant tables if not exists
ALTER TABLE marks ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL;

-- Drop existing policies on students table
DROP POLICY IF EXISTS "Students can view their own profile" ON students;
DROP POLICY IF EXISTS "Students can update their own profile" ON students;

-- Enhanced RLS Policies for students - allow faculty to view and update their students
CREATE POLICY "Students can view their own profile" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update their own profile" ON students
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Faculty can view their assigned students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_faculty_mapping
      WHERE student_faculty_mapping.student_id = students.id
      AND student_faculty_mapping.faculty_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can update student profile" ON students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM student_faculty_mapping
      WHERE student_faculty_mapping.student_id = students.id
      AND student_faculty_mapping.faculty_id = auth.uid()
    )
  );

-- Enhanced RLS Policies for marks
DROP POLICY IF EXISTS "Faculty can create marks" ON marks;
DROP POLICY IF EXISTS "Faculty can view marks for their students" ON marks;
DROP POLICY IF EXISTS "Faculty can update marks" ON marks;
DROP POLICY IF EXISTS "Students can view their own marks" ON marks;

CREATE POLICY "Faculty can create marks" ON marks
  FOR INSERT WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can view marks for their students" ON marks
  FOR SELECT USING (
    faculty_id = auth.uid() OR
    student_id = auth.uid()
  );

CREATE POLICY "Faculty can update marks" ON marks
  FOR UPDATE USING (faculty_id = auth.uid());

CREATE POLICY "Students can view their own marks" ON marks
  FOR SELECT USING (auth.uid() = student_id);

-- Enhanced RLS Policies for assignments
DROP POLICY IF EXISTS "Faculty can create assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty can view their assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty can update their assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view their own assignments" ON assignments;

CREATE POLICY "Faculty can create assignments" ON assignments
  FOR INSERT WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can view their assignments" ON assignments
  FOR SELECT USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can update their assignments" ON assignments
  FOR UPDATE USING (faculty_id = auth.uid());

CREATE POLICY "Students can view their own assignments" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_faculty_mapping
      WHERE student_faculty_mapping.student_id = assignments.student_id
      AND student_faculty_mapping.faculty_id = assignments.faculty_id
    ) AND auth.uid() = assignments.student_id
  );

-- Enhanced RLS Policies for timetable
DROP POLICY IF EXISTS "Students can view their own timetable" ON timetable;

CREATE POLICY "Students can view their own timetable" ON timetable
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Faculty can manage timetable for their students" ON timetable
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM student_faculty_mapping
      WHERE student_faculty_mapping.student_id = timetable.student_id
      AND student_faculty_mapping.faculty_id = auth.uid()
    )
  );

-- Enhanced RLS Policies for attendance
DROP POLICY IF EXISTS "Students can view their own attendance" ON attendance;

CREATE POLICY "Students can view their own attendance" ON attendance
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Faculty can mark attendance for their students" ON attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_faculty_mapping
      WHERE student_faculty_mapping.student_id = attendance.student_id
      AND student_faculty_mapping.faculty_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can view attendance for their students" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_faculty_mapping
      WHERE student_faculty_mapping.student_id = attendance.student_id
      AND student_faculty_mapping.faculty_id = auth.uid()
    )
  );

-- Enhanced RLS Policies for submissions
DROP POLICY IF EXISTS "Faculty can update submissions with feedback" ON submissions;
DROP POLICY IF EXISTS "Faculty can view submissions" ON submissions;
DROP POLICY IF EXISTS "Students can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can create their own submissions" ON submissions;

CREATE POLICY "Faculty can update submissions with feedback" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = submissions.assignment_id
      AND assignments.faculty_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can view submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = submissions.assignment_id
      AND assignments.faculty_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own submissions" ON submissions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);
