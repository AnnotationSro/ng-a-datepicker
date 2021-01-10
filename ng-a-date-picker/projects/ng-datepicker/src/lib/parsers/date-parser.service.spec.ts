import {formatDate} from '@angular/common';
import {getNamedFormat} from './angular_commons';
import {getDateFormatParser, parseDate} from './date-parser.service';

const localeEn = 'en';
// const localeDe = 'de';
// const localeSk = 'sk';
//
// getTestBed().configureTestingModule({
//   providers: [{ provide: LOCALE_ID, useValue: locale }],
// });

describe('DateParserService', () => {
  it('test getNamedFormat', () => {
    const directive = getNamedFormat(localeEn, 'shortDate');
    console.log('test the cat api ', directive);
    expect(directive).toBe('M/d/yy');
  });
  getDateFormatParser['run_in_tests'] = true;

  const unsupportedFormats = [
    'G',
    'GG',
    'GGG',
    'GGGG',
    'GGGGG',
    'Z',
    'ZZ',
    'ZZZ',
    'ZZZZZ',
    'O',
    'OO',
    'OOO',
    'z',
    'zz',
    'zzz',
    'OOOO',
    'ZZZZ',
    'zzzz',
  'b',
  'bb',
  'bbb',
  'bbbb',
  'bbbbb',
  'B',
  'BB',
  'BBB',
  'BBBB',
  'BBBBB'
  ];

  for (const unsupportedFormat of unsupportedFormats) {
    it(`test unsupported format: ${unsupportedFormat}`, () => {
      const parser = getDateFormatParser(localeEn, unsupportedFormat);
      // console.log(parser.errorMsg);
      expect(parser.errorMsg).toEqual(`Error: Unsupported parsing format '${unsupportedFormat}'`);
    });
  }

  const ignoredFormats = [ 'w', 'ww',  'W' , 'E', 'EE', 'EEE' ];
  for (const ignoredFormat of ignoredFormats) {
    it(`test ignored format: ${ignoredFormat}`, () => {
      const parser = getDateFormatParser(localeEn, ignoredFormat);
      expect(parser.errorMsg).toBe(null);

      const d1 = new Date();
      const s1 = formatDate(d1, ignoredFormat, localeEn);

      const d2 = parser.parseDate(s1);

      const lineRegexp = `${parser['lineRegexp']}`;
      console.log('lineRegexp', lineRegexp, s1);

      expect(d2).toBeNull();

      const d3 = parser.parseDate(s1, d1);
      expect(d3).toBe(d1);
    });
  }
  const supportedFormats = [
    'y',
    'yy',
    'yyy',
    'yyyy',
    'Y',
    'YY',
    'YYY',
    'YYYY',
    'M',
    'L',
    'MM',
    'LL',
    'MMM',
    'MMMM',
    'MMMMM',
    'LLL',
    'LLLL',
    'LLLLL',
    'd',
    'dd',
    'a',
    'aa',
    'aaa',
    'aaaa',
    'aaaaa',
    'h',
    'hh',
    'H',
    'HH',
    'm',
    'mm',
    's',
    'ss',
    'S',
    'SS',
    'SSS',
  ];
  for (const supportedFormat of supportedFormats) {
    it(`test format: ${supportedFormat}`, () => {
      const parser = getDateFormatParser(localeEn, supportedFormat);
      expect(parser.errorMsg).toBe(null);

      const d1 = new Date('1999-12-31T23:59:57'); // some formats can lost any information (e.g.: MMMMM)
      const s1 = formatDate(d1, supportedFormat, localeEn);
      const d2 = parser.parseDate(s1);

      const lineRegexp = `${parser['lineRegexp']}`;
      console.log('lineRegexp', lineRegexp, s1);

      expect(d2).not.toBeNull();
      expect(formatDate(d2, supportedFormat, localeEn)).toBe(s1);

      const d3 = parser.parseDate(s1, d1);
      expect(d3).not.toBeNull();
      expect(d3).not.toBe(d1);
      expect(d3.getTime()).toBe(d1.getTime());
    });
  }

  let createYearTest = (supportedFormat:string, strValue: string, fullYearBefore: number, fullYearExpected: number, runFormatedTest: boolean = true) => {
    it(`test year format: ${supportedFormat} = '${strValue}' => ${fullYearExpected}`, () => {
      const parser = getDateFormatParser(localeEn, supportedFormat);
      const dIn = new Date();
      dIn.setMonth(5);
      dIn.setFullYear(fullYearBefore);

      const dOut = parser.parseDate(strValue, dIn);
      expect(dOut).not.toBeNull();
      expect(dOut).not.toBeUndefined();
      expect(dOut).not.toBe(dIn);
      expect(dOut.getFullYear()).toBe(fullYearExpected);

      if (runFormatedTest) {
        const strValue2 = formatDate(dOut, supportedFormat, localeEn);
        expect(strValue2).toBe(strValue);
      }
    });
  };
  // y | Y
  createYearTest('y', '1', 2, 1);
  createYearTest('y', '12', 11, 12);
  createYearTest('y', '1299', 11, 1299);
  createYearTest('y', '120', 1, 120);

  /*
  createYearTest('Y', '1', 2, 1);     // Bug in @angular/common
  createYearTest('Y', '12', 11, 12);  // Bug in @angular/common
   */
  createYearTest('Y', '1299', 11, 1299);
  createYearTest('Y', '120', 1, 120);

  // yy = 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
  createYearTest('yy', '03', 2, 3);
  createYearTest('yy', '33', 2, 33);
  createYearTest('yy', '33', 22, 33);
  createYearTest('yy', '33', 222, 233);
  createYearTest('yy', '33', 2222, 2233);

  // YY = 2 digit representation of the week-numbering year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
  createYearTest('YY', '03', 2, 3);
  createYearTest('YY', '33', 2, 33);
  createYearTest('YY', '33', 22, 33);
  createYearTest('YY', '33', 222, 233);
  createYearTest('YY', '33', 2222, 2233);

  // yyy = 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
  createYearTest('yyy', '333', 2, 333);
  createYearTest('YYY', '333', 2, 333);
  createYearTest('yyy', '3334', 2, 3334);
  createYearTest('YYY', '3334', 2, 3334);
  createYearTest('yyyy', '3334', 2, 3334);
  createYearTest('YYYY', '3334', 2, 3334);



  let createCustomTest = (format:string, strValue: string, dIn: Date, lineRegexpExpected: string, expFormatedStrValue: string = null) => {
    it(`createCustomTest: ${format} = '${strValue}' => ${dIn.toISOString()}, parsed with regexp: lineRegexpExpected`, () => {
      const parser = getDateFormatParser(localeEn, format);

      // test line regexp
      const lineRegexp = `${parser['lineRegexp']}`;
      expect(lineRegexp).not.toBeNull();
      expect(lineRegexp).not.toBeUndefined();
      expect(lineRegexp).toBe(lineRegexpExpected);

      const strValueTest1 = formatDate(dIn, format, localeEn);
      if (!expFormatedStrValue) expFormatedStrValue = strValue.replace(/\s+/g, '');
      expect(strValueTest1).toBe(expFormatedStrValue);

      const dOut = parser.parseDate(strValue, dIn);
      expect(dOut).not.toBeNull();
      expect(dOut).not.toBeUndefined();
      expect(dOut).not.toBe(dIn);

      const strValueTest2 = formatDate(dOut, format, localeEn);
      expect(strValueTest2).toBe(strValueTest1);

    });
  };
  const dtTest = new Date('2131-10-20T13:14:15.167'); //

  createCustomTest('yyyy', '2131', dtTest, '^(\\d{4,5})$');
  createCustomTest('yyyy-dd', '2131-20', dtTest, '^(\\d{4,5})\\s*-\\s*(\\d{1,2})$');
  createCustomTest('yyyy-dd', ' 2131 - 20 ', dtTest, '^(\\d{4,5})\\s*-\\s*(\\d{1,2})$');
  createCustomTest('yyyy-MM', '2131-10', dtTest, '^(\\d{4,5})\\s*-\\s*(\\d{1,2})$');
  createCustomTest('yyyy-MM-dd', '2131   - 10 -20', dtTest, '^(\\d{4,5})\\s*-\\s*(\\d{1,2})\\s*-\\s*(\\d{1,2})$');
  createCustomTest('yyyy-MM-dd HH:mm:ss', '2131   - 10 -20 13 :14 : 15', dtTest, '^(\\d{4,5})\\s*-\\s*(\\d{1,2})\\s*-\\s*(\\d{1,2})\\s*(\\d{1,2})\\s*:\\s*(\\d{1,2})\\s*:\\s*(\\d{1,2})$', '2131-10-20 13:14:15');
});
