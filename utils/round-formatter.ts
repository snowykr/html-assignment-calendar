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
 * 회차 정보를 언어별로 포맷팅하는 함수
 * @param round 회차 문자열 (예: "1", "2", "10")
 * @param locale 언어 코드 (ko, en, ja)
 * @returns 포맷팅된 회차 문자열
 */
export function formatRound(round: string, locale: string): string {
  // 공백 문자 제거
  const trimmedRound = round.trim();
  
  // 숫자 검증 - 안전한 파싱
  const num = parseInt(trimmedRound);
  
  // 숫자가 아니거나 음수인 경우 원래 값 반환
  if (isNaN(num) || num < 0) {
    return round;
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
      return round;
  }
}