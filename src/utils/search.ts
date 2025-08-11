import * as Hangul from 'hangul-js';

/**
 * 한글 자모 분리 함수
 * 입력된 한글 문자열에서 공백을 제거하고 자모로 분리합니다.
 * hangul-js 라이브러리를 사용합니다.
 *
 * @param input - 입력 문자열
 * @returns 자모로 분리된 문자열
 */
export function decomposeHangul(input: string): string {
  // 공백 제거
  const cleanedInput = input.replace(/\s/g, '');

  // hangul-js를 사용하여 자모 분리
  const decomposed = Hangul.disassemble(cleanedInput);

  return decomposed.join('');
}
