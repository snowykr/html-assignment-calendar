--
-- assignments 테이블 수정 및 RLS 설정
-- Supabase SQL Editor에서 실행하세요
--

-- 1. assignments 테이블에 user_id 컬럼 추가
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES next_auth.users(id) ON DELETE CASCADE;

-- 2. 기존 데이터 삭제 (user_id가 없는 데이터)
-- 주의: 기존 데이터가 모두 삭제됩니다!
DELETE FROM public.assignments WHERE user_id IS NULL;

-- 3. user_id를 NOT NULL로 설정
ALTER TABLE public.assignments 
ALTER COLUMN user_id SET NOT NULL;

-- 4. assignments 테이블에 RLS 활성화
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;