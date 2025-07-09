--
-- assignments 테이블 RLS 정책 생성
-- Supabase SQL Editor에서 실행하세요
--

-- 기존 정책들 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can insert their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete their own assignments" ON public.assignments;

-- 1. SELECT 정책: 사용자는 자신의 과제만 조회 가능
CREATE POLICY "Users can view their own assignments" ON public.assignments
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 2. INSERT 정책: 사용자는 자신의 과제만 생성 가능
CREATE POLICY "Users can insert their own assignments" ON public.assignments
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 3. UPDATE 정책: 사용자는 자신의 과제만 수정 가능
CREATE POLICY "Users can update their own assignments" ON public.assignments
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 4. DELETE 정책: 사용자는 자신의 과제만 삭제 가능
CREATE POLICY "Users can delete their own assignments" ON public.assignments
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);