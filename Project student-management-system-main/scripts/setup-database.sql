-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  roll_number TEXT UNIQUE,
  grade TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  total_marks INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  submission_date TIMESTAMP NOT NULL,
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  subject TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for students
CREATE POLICY "Students can view their own profile" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update their own profile" ON students
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS Policies for marks
CREATE POLICY "Students can view their own marks" ON marks
  FOR SELECT USING (auth.uid() = student_id);

-- Create RLS Policies for assignments
CREATE POLICY "Students can view their own assignments" ON assignments
  FOR SELECT USING (auth.uid() = student_id);

-- Create RLS Policies for submissions
CREATE POLICY "Students can view their own submissions" ON submissions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Create RLS Policies for timetable
CREATE POLICY "Students can view their own timetable" ON timetable
  FOR SELECT USING (auth.uid() = student_id);

-- Create RLS Policies for attendance
CREATE POLICY "Students can view their own attendance" ON attendance
  FOR SELECT USING (auth.uid() = student_id);
