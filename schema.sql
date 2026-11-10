-- Run this once in the Neon SQL Editor
create table if not exists students (
  id serial primary key,
  qr_token text unique not null,
  name text not null,
  class text not null,
  photo text,
  created_at timestamptz not null default now()
);
create unique index if not exists students_name_class on students (lower(name), class);

create table if not exists attendance_logs (
  id bigserial primary key,
  student_id int not null references students(id) on delete cascade,
  direction text not null check (direction in ('IN','OUT')),
  scanned_at timestamptz not null default now()
);
create index if not exists logs_time on attendance_logs (scanned_at);
create index if not exists logs_student on attendance_logs (student_id, scanned_at desc);
