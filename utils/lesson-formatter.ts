/**
 * 영어 서수 변환 함수 (1st, 2nd, 3rd, 12th)
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return num + "st";
  if (j === 2 && k !== 12) return num + "nd";
  if (j === 3 && k !== 13) return num + "rd";
  return num + "th";
}

/**
 * 수업 정보를 언어에 맞게 포맷팅합니다.
 * @param lesson 수업 회차 문자열 (예: "1", "2", "10")
 * @param locale 언어 코드 (예: "en", "ko", "ja")
 * @returns 포맷팅된 회차 문자열
 */
export function formatLesson(lesson: string, locale: string): string {
  // 공백 문자 제거
  const trimmedLesson = lesson.trim();
  
  // 빈 문자열이거나 숫자가 아닌 경우 원본 반환
  const num = parseInt(trimmedLesson);
  
  // 숫자가 아니거나 음수인 경우 원본 반환
  if (isNaN(num) || num < 0) {
    return lesson;
  }
  
  // 언어별 포맷팅
  switch (locale) {
    case 'en':
      return getOrdinalSuffix(num);
    case 'ko':
      return `${num}회`;
    case 'ja':
      return `${num}回`;
    default:
      // 기본값으로 원본 반환
      return lesson;
  }
}