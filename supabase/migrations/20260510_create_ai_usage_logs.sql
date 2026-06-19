-- Create ai_usage_logs table
create table if not exists public.ai_usage_logs (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    organization_id uuid references public.organizations(id),
    user_id uuid references auth.users(id),
    action_type text not null, -- 'enhance_description', 'fix_orthography', 'generate_seo'
    prompt_tokens int default 0,
    completion_tokens int default 0,
    total_tokens int default 0,
    model_name text default 'gemini-1.5-flash'
);

-- Enable RLS
alter table public.ai_usage_logs enable row level security;

-- Policies
create policy "Super Admins can view all ai logs"
on public.ai_usage_logs for select
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'main_admin'
    )
);

create policy "Users can insert their own ai logs"
on public.ai_usage_logs for insert
to authenticated
with check (auth.uid() = user_id);

-- Add comment
comment on table public.ai_usage_logs is 'Logs of AI token usage per user and organization for SaaS resource management.';
