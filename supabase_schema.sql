-- 1. Brains Table
create table if not exists brains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  content text,
  last_refactored timestamptz
);

-- 2. Articles Table
create table if not exists articles (
  id text primary key, -- client-side generated UUID
  user_id uuid references auth.users(id) not null,
  url text not null,
  title text,
  summary text,
  content text,
  practice_guide text,
  status text check (status in ('new', 'reading', 'practice', 'mastered')),
  frequent_words jsonb,
  tags text[], -- or jsonb
  is_test_passed boolean default false,
  added_at timestamptz default now()
);

-- 3. Activity Logs Table
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date text not null, -- YYYY-MM-DD
  count integer default 0,
  unique(user_id, date)
);

-- 4. Diary Entries Table
create table if not exists diary_entries (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  content text,
  date timestamptz
);

-- 5. Learning Tweets Table
create table if not exists learning_tweets (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  content text,
  timestamp bigint -- Storing Date.now()
);

-- 6. Bookmarks Table
create table if not exists bookmarks (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  url text not null,
  note text,
  added_at timestamptz default now()
);

-- 7. Documents Table (Fixed 404 Error)
create table if not exists documents (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  type text not null, -- 'pdf', 'slide', 'paper'
  content text,
  summary text,
  key_points jsonb, -- array of strings
  chapters jsonb, -- array of chapter objects
  file_size bigint,
  added_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table brains enable row level security;
alter table articles enable row level security;
alter table activity_logs enable row level security;
alter table diary_entries enable row level security;
alter table learning_tweets enable row level security;
alter table bookmarks enable row level security;
alter table documents enable row level security;

-- Create Policies (Allow all actions for authenticated users on their own data)
create policy "Users can manage their own brains" on brains for all using (auth.uid() = user_id);
create policy "Users can manage their own articles" on articles for all using (auth.uid() = user_id);
create policy "Users can manage their own activity logs" on activity_logs for all using (auth.uid() = user_id);
create policy "Users can manage their own diary entries" on diary_entries for all using (auth.uid() = user_id);
create policy "Users can manage their own tweets" on learning_tweets for all using (auth.uid() = user_id);
create policy "Users can manage their own bookmarks" on bookmarks for all using (auth.uid() = user_id);
create policy "Users can manage their own documents" on documents for all using (auth.uid() = user_id);
