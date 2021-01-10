/* eslint-disable */

import {FormStyle, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleMonthNames, TranslationWidth,} from '@angular/common';
import {DATE_FORMATS_SPLIT, getNamedFormat} from './angular_commons';
import {isDevMode} from "@angular/core";

export function parseDate(value: string, format: string, locale: string, oldValue: Date = null): Date {
  return getDateFormatParser(locale, format).parseDate(value, oldValue);
}

interface DateParser {
  errorMsg: string,

  parseDate(text: string, oldValue?: Date): Date;
}

function createErrorParser(format: string, msg: string) {

  return {
    errorMsg: msg + '',
    parseDate(text: string, oldValue: Date = null): Date {
      try {
        console.error(`DateParser for format '${format}' has error: ${msg}`);
      } catch (e) {
      }

      return oldValue;
    }
  };
}

const DateParserMaps: { [key: string]: DateParser } = {};

export function getDateFormatParser(locale: string, format: string): DateParser {
  const namedFormat = getNamedFormat(locale, format);
  format = namedFormat || format;
  const originalFormat = format;
  if (!format) return createErrorParser(format, 'bad format');
  if (!locale) locale = 'en_US';
  const key = locale + ':' + format;
  if (DateParserMaps[key]) return DateParserMaps[key];

  try {
    let parsers: DatePart[] = [];

    let match;
    while (format) {
      if (!format || format.trim().length == 0) break;

      match = DATE_FORMATS_SPLIT.exec(format);
      if (match) {
        const formatParts = match.splice(1);
        const part = formatParts.pop();

        if (formatParts && formatParts.length) {
          for (let formatPart of formatParts) {
            if (!formatPart || formatPart.trim().length == 0) continue;
            parsers.push(getDatePartParser(locale, formatPart));
          }
        }

        format = part;
      } else {
        parsers.push(getDatePartParser(locale, format));
        break;
      }
    }

    let lineRegexp = null;
    for (let parser of parsers) {
      if (!parser.regexp || parser.regexp.trim().length == 0) continue;
      if (lineRegexp) lineRegexp += '\\s*';
      else lineRegexp = '^';
      lineRegexp += parser.regexp;
    }
    lineRegexp += '$';
    const strValueRegexp = new RegExp(lineRegexp, 'i');

    const ret = {
      parseDate(text: string, dtValue: Date = null): Date {
        try {
          dtValue = dtValue || null;
          // empty date
          if (!text || text.trim().length == 0) return null;

          // parse string
          const match = strValueRegexp.exec(normalizeString(text));
          if (!match) {
            if (isDevMode()) {
              console.error(`DateParser with format '${originalFormat}' cannot parse date from '${text}'`);
            }
            return;
          }

          // value updates ...
          const retValue = dtValue ? new Date(dtValue.getTime()) : new Date();

          // reading part values
          const values = new Map<DateType, number | string>();
          let groupInx = 0;
          for (let parser of parsers) {
            // if function for value parsing missing => part of string is not in group and it is ignored
            if (!parser.parseValue) continue;
            groupInx++;
            // if valueType is null => value is ignored
            if (!parser.type && parser.type !== 0) continue; // ak nema typ, ignorujeme hodnotu tiez

            const strValuePart = match[groupInx];
            const value = parser.parseValue(strValuePart, retValue);

            // if value == null, value is ignored
            if (value === null || value === undefined) continue;
            values.set(parser.type, value);
          }

          if (!values.size) {
            if (isDevMode()) {
              console.info(`DateParser with format '${originalFormat}' cannot parse date from '${text}'`);
            }
            return dtValue;
          }

          if (values.has(DateType.FullYear)) {
            retValue.setFullYear(valueToNumber(values.get(DateType.FullYear)));
          }
          if (values.has(DateType.Month)) {
            retValue.setMonth(valueToNumber(values.get(DateType.Month)) - 1);
          }
          if (values.has(DateType.Date)) {
            retValue.setDate(valueToNumber(values.get(DateType.Date)));
          }
          if (values.has(DateType.Hours_24)) {
            retValue.setHours(valueToNumber(values.get(DateType.Hours_24)));
          }
          if (values.has(DateType.Hours_12)) {
            let hours12 = valueToNumber(values.get(DateType.Hours_12));
            if (hours12 > 12) {
              console.error(`DateParser with format '${originalFormat}' cannot parse date from '${text}'`);
              return;
            }
            const inAM = retValue.getHours() < 12;
            retValue.setHours(hours12 % 12 + (inAM ? 0 : 12));
          }
          if (values.has(DateType.DayPeriods)) {
            var period = valueToNumber(values.get(DateType.DayPeriods)) || 0;
            var currentPeriod = retValue.getHours() < 12 ? 0 : 1;
            if (currentPeriod != period) {
              if (period) {
                retValue.setHours(retValue.getHours() + 12);
              } else {
                retValue.setHours(retValue.getHours() - 12);
              }
            }
          }
          if (values.has(DateType.Minutes)) {
            retValue.setMinutes(valueToNumber(values.get(DateType.Minutes)));
          }
          if (values.has(DateType.Seconds)) {
            retValue.setSeconds(valueToNumber(values.get(DateType.Seconds)));
          }
          if (values.has(DateType.FractionalSeconds)) {
            retValue.setMilliseconds(valueToNumber(values.get(DateType.FractionalSeconds)) % 1000);
          }

          return retValue;
        } catch (e) {
          try {
            if (isDevMode()) {
              console.error('DateParser throw error', e);
            }
          } catch (eee) {
          }
          return null;
        }
      },
      errorMsg: null
    } as DateParser;

    DateParserMaps[key] = ret;

    // for tests
    if (getDateFormatParser['run_in_tests']) {
      ret['lineRegexp'] = lineRegexp;
      ret['parsers'] = parsers;
    }


  } catch (e) {
    if (isDevMode()) {
      console.error(e);
    }
    DateParserMaps[key] = createErrorParser(format, e || 'unsupported format!');
    return DateParserMaps[key];
  }


  return DateParserMaps[key];
}

function valueToNumber(value: number | string): number {
  if (typeof value === 'string') return parseInt(value, 10);
  return value;
}

enum DateType {
  FullYear,
  Month,
  Date,
  Hours_24,
  Hours_12,
  Minutes,
  Seconds,
  FractionalSeconds,
  DayOfWeek,


  DayPeriods,
  Eras
}

class DatePart {
  private constructor(public regexp: string, public type: DateType = null, public parseValue: (value: string, dtValue: Date) => number | string = null) {
  }

  static ignoreText(text: string): DatePart {
    return new DatePart(normalizeStringForRegexp(text), null, null);
  }


  private static defaultParseValue: (value: string, dtValue: Date) => number | string = ((strValue) => {
      return (strValue || '').trim(); // vrati to ako string - aby sme vedeli pocet znakov
    }
  );
  static parsePart(regexp: string, type: DateType, parseValue: (value: string, dtValue: Date) => number | string = DatePart.defaultParseValue): DatePart {
    return new DatePart('(' + regexp + ')', type, parseValue);
  }

  static ignorePart(regexp: string): DatePart {
    return new DatePart(regexp, null, null);
  }

  static parseStrPart(locale: string, type: DateType, /*name: TranslationType, */width: TranslationWidth, form: FormStyle = FormStyle.Format, extended = false): DatePart {
    let structure = getStrPartStructure(locale, type, width, form, extended);
    return new DatePart(structure.regexp, type, (strValue) => {
      if (!strValue) return null;
      for (let regexp in structure.mapRegexpPerValue) {
        if (strValue.match(new RegExp(regexp))) {
          return structure.mapRegexpPerValue[regexp];
        }
      }
      return null;
    });
  }

  static ignoreStrPart(locale: string, type: DateType, width: TranslationWidth, form: FormStyle = FormStyle.Format, extended = false): DatePart {
    let structure = getStrPartStructure(locale, type, width, form, extended);
    return new DatePart(structure.regexp, null, value => null); // ignored
  }
}


// if (DATE_PARSERS[format]) {
//   return DATE_PARSERS[format];
// }

function normalizeString(text: string): string {
  if (!text) return '';

  // remove diacritical chars
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();


  return text;
}

function normalizeStringForRegexp(text: string): string {
  if (!text) return '';

  text = normalizeString(text);

  // regexp escape + space replace with
  return text

    // $& means the whole matched string
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // replace white space with '\s+ regexp part'
    .replace(/\s+/, '\\s+');
}

interface StrPartStructure {
  regexp: string,
  mapRegexpPerValue: { [locale: string]: number },
}

const REGEXP_STR_NAMES: { [locale: string]: StrPartStructure } = {};

function getStrPartStructure(locale: string, type: DateType, /*name: TranslationType, */width: TranslationWidth, form: FormStyle = FormStyle.Format, extended = false): StrPartStructure {
  if (!locale) locale = 'en_US';
  const key = (locale || '') + ':' + type + ":" + width + ":" + form /*+ ":" + extended (is unsupported now)*/;
  if (!REGEXP_STR_NAMES[key]) {
    let ret = {
      mapRegexpPerValue: {}
    } as StrPartStructure;
    REGEXP_STR_NAMES[key] = ret;
    switch (type) {
      case DateType.Month:
        getLocaleMonthNames(locale, form, width).forEach((name, value) => {
          let regexp = normalizeStringForRegexp(name);
          ret.mapRegexpPerValue[regexp] = value + 1;
        });
        break;
      case DateType.DayOfWeek:
        getLocaleDayNames(locale, form, width).forEach((name, value) => {
          let regexp = normalizeStringForRegexp(name);
          ret.mapRegexpPerValue[regexp] = value;
        });
        break;
      case DateType.DayPeriods:
        getLocaleDayPeriods(locale, form, <TranslationWidth>width).forEach((name, value) => {
          let regexp = normalizeStringForRegexp(name);
          ret.mapRegexpPerValue[regexp] = value;
        });
        break;
      case DateType.Eras:
        getLocaleEraNames(locale, <TranslationWidth>width).forEach((name, value) => {
          let regexp = normalizeStringForRegexp(name);
          ret.mapRegexpPerValue[regexp] = value;
        });
        break;
      default:
        throw new Error("Unknown names !!!")
    }
    ret.regexp = '(' + Object.keys(ret.mapRegexpPerValue).join('|') + ')';
  }
  return REGEXP_STR_NAMES[key];
}

// type DateParser = (value: string, updateValue: Date, locale: string) => string;
// const DATE_PARSERS: { [format: string]: DateParser } = {};
function getDatePartParser(locale: string, format: string): DatePart | null {
  // if (DATE_PARSERS[format]) {
  //   return DATE_PARSERS[format];
  // }
  let formatter = null;
  switch (format) {
    // Era name (AD/BC)
    case 'G':
    case 'GG':
    case 'GGG':
      throw Error("Unsupported parsing format '" + format + "'");
      // formatter = dateStrGetter(DateType.Eras, TranslationWidth.Abbreviated);
      break;
    case 'GGGG':
      // formatter = dateStrGetter(DateType.Eras, TranslationWidth.Wide);
      throw Error("Unsupported parsing format '" + format + "'");
      break;
    case 'GGGGG':
      // formatter = dateStrGetter(DateType.Eras, TranslationWidth.Narrow);
      throw Error("Unsupported parsing format '" + format + "'");
      break;

    // 1 digit representation of the year, e.g. (AD 1 => 1, AD 199 => 199)
    case 'y':
      formatter = DatePart.parsePart('\\d{1,4}', DateType.FullYear, (value:string, dtValue: Date) => {
        return valueToNumber(value);
      });
      break;

    // 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
    case 'yy':
      formatter = DatePart.parsePart('\\d{2}', DateType.FullYear, (value:string, dtValue: Date) => {
        var strFullYear = dtValue.getFullYear() + "";
        if (strFullYear.length<=value.length) {
          return valueToNumber(value);
        }
        const newFullYear = strFullYear.substr(0, strFullYear.length-value.length)+value;
        return valueToNumber(newFullYear);
      });
      break;

    // 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
    case 'yyy':
      // formatter = DatePart.parsePart('\\d{3}', DateType.FullYear, (value:string, dtValue: Date) => {
      //   var strFullYear = dtValue.getFullYear() + "";
      //   if (strFullYear.length<=value.length) {
      //     return valueToNumber(value);
      //   }
      //   const newFullYear = strFullYear.substr(0, strFullYear.length-value.length)+value;
      //   return valueToNumber(newFullYear);
      // });
      formatter = DatePart.parsePart('\\d{3,5}', DateType.FullYear);
      break;
    // 4 digit representation of the year (e.g. AD 1 => 0001, AD 2010 => 2010)
    case 'yyyy':
      formatter = DatePart.parsePart('\\d{4,5}', DateType.FullYear);
      break;

    // 1 digit representation of the week-numbering year, e.g. (AD 1 => 1, AD 199 => 199)
    case 'Y':
      formatter = DatePart.parsePart('\\d{1,5}', DateType.FullYear);
      break;
    // 2 digit representation of the week-numbering year, padded (00-99). (e.g. AD 2001 => 01, AD
    // 2010 => 10)
    case 'YY':
      formatter = DatePart.parsePart('\\d{2}', DateType.FullYear, (value:string, dtValue: Date) => {
        var strFullYear = dtValue.getFullYear() + "";
        if (value.length<2) value = "0"+value;
        if (strFullYear.length<=value.length) {
          return valueToNumber(value);
        }
        const newFullYear = strFullYear.substr(0, strFullYear.length-value.length)+value;
        return valueToNumber(newFullYear);
      });
      break;
    // 3 digit representation of the week-numbering year, padded (000-999). (e.g. AD 1 => 001, AD
    // 2010 => 2010)
    case 'YYY':
    // 4 digit representation of the week-numbering year (e.g. AD 1 => 0001, AD 2010 => 2010)
      formatter = DatePart.parsePart('\\d{3,5}', DateType.FullYear);
      break;
    case 'YYYY':
      // throw Error("Unsupported parsing format: " + format);
      formatter = DatePart.parsePart('\\d{4,5}', DateType.FullYear);
      break;

    // Month of the year (1-12), numeric
    case 'M':
    case 'L':
    case 'MM':
    case 'LL':
      formatter = DatePart.parsePart('\\d{1,2}', DateType.Month);
      break;

    // Month of the year (January, ...), string, format
    case 'MMM':
      formatter = DatePart.parseStrPart(locale, DateType.Month, TranslationWidth.Abbreviated);
      break;
    case 'MMMM':
      formatter = DatePart.parseStrPart(locale, DateType.Month, TranslationWidth.Wide);
      break;
    case 'MMMMM':
      formatter = DatePart.parseStrPart(locale, DateType.Month, TranslationWidth.Narrow);
      break;

    // Month of the year (January, ...), string, standalone
    case 'LLL':
      formatter = DatePart.parseStrPart(locale, DateType.Month, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case 'LLLL':
      formatter = DatePart.parseStrPart(locale, DateType.Month, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case 'LLLLL':
      formatter = DatePart.parseStrPart(locale, DateType.Month, TranslationWidth.Narrow, FormStyle.Standalone);
      break;

    // Week of the year (1, ... 52)
    case 'w':
    case 'ww':
      formatter = DatePart.ignorePart('\\d{1,2}');
      // formatter = weekParser(2);
      break;

    // Week of the month (1, ...)
    case 'W':
      formatter = DatePart.ignorePart('\\d{1}');
      // formatter = weekParser(1, true);
      break;

    // Day of the month (1-31)
    case 'd':
    case 'dd':
      formatter = DatePart.parsePart('\\d{1,2}', DateType.Date);
      break;

    // Day of the Week
    case 'E':
    case 'EE':
    case 'EEE':
      formatter = DatePart.ignoreStrPart(locale, DateType.DayOfWeek, TranslationWidth.Abbreviated);
      break;
    case 'EEEE':
      formatter = DatePart.ignoreStrPart(locale, DateType.DayOfWeek, TranslationWidth.Wide);
      break;
    case 'EEEEE':
      formatter = DatePart.ignoreStrPart(locale, DateType.DayOfWeek, TranslationWidth.Narrow);
      break;
    case 'EEEEEE':
      formatter = DatePart.ignoreStrPart(locale, DateType.DayOfWeek, TranslationWidth.Short);
      break;

    // Generic period of the day (am-pm)
    case 'a':
    case 'aa':
    case 'aaa':
      formatter = DatePart.parseStrPart(locale, DateType.DayPeriods, TranslationWidth.Abbreviated);
      break;
    case 'aaaa':
      formatter = DatePart.parseStrPart(locale, DateType.DayPeriods, TranslationWidth.Wide);
      break;
    case 'aaaaa':
      formatter = DatePart.parseStrPart(locale, DateType.DayPeriods, TranslationWidth.Narrow);
      break;

    // Extended period of the day (midnight, at night, ...), standalone
    case 'b':
    case 'bb':
    case 'bbb':
    // formatter = DatePart.ignoreStrPart(locale, DateType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
    // break;
    case 'bbbb':
    // formatter = DatePart.ignoreStrPart(locale, DateType.DayPeriods, TranslationWidth.Wide, FormStyle.Standalone, true);
    // break;
    case 'bbbbb':
      // formatter = DatePart.ignoreStrPart(locale, DateType.DayPeriods, TranslationWidth.Narrow, FormStyle.Standalone, true);
      // break;
      throw Error("Unsupported parsing format '" + format + "'");

    // Extended period of the day (midnight, night, ...), standalone
    case 'B':
    case 'BB':
    case 'BBB':
    // formatter = DatePart.ignoreStrPart(locale, DateType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Format, true);
    // break;
    case 'BBBB':
    // formatter = DatePart.ignoreStrPart(locale, DateType.DayPeriods, TranslationWidth.Wide, FormStyle.Format, true);
    // break;
    case 'BBBBB':
      // formatter = DatePart.ignoreStrPart(locale, DateType.DayPeriods, TranslationWidth.Narrow, FormStyle.Format, true);
      // break;
      throw Error("Unsupported parsing format '" + format + "'");

    // Hour in AM/PM, (1-12)
    case 'h':
    case 'hh':
      formatter = DatePart.parsePart('\\d{1,2}', DateType.Hours_12);
      break;

    // Hour of the day (0-23)
    case 'H':
    case 'HH':
      formatter = DatePart.parsePart('\\d{1,2}', DateType.Hours_24);
      break;

    // Minute of the hour (0-59)
    case 'm':
    case 'mm':
      formatter = DatePart.parsePart('\\d{1,2}', DateType.Minutes);
      break;

    // Second of the minute (0-59)
    case 's':
    case 'ss':
      formatter = DatePart.parsePart('\\d{1,2}', DateType.Seconds);
      break;

    // Fractional second
    case 'S':
    case 'SS':
    case 'SSS':
      formatter = DatePart.parsePart('\\d{1,3}', DateType.FractionalSeconds);
      break;

    // Timezone ISO8601 short format (-0430)
    case 'Z':
    case 'ZZ':
    case 'ZZZ':
      // formatter = timeZoneGetter(ZoneWidth.Short);
      throw Error("Unsupported parsing format '" + format + "'");
      break;
    // Timezone ISO8601 extended format (-04:30)
    case 'ZZZZZ':
      // formatter = timeZoneGetter(ZoneWidth.Extended);
      throw Error("Unsupported parsing format '" + format + "'");
      break;

    // Timezone GMT short format (GMT+4)
    case 'O':
    case 'OO':
    case 'OOO':
    // Should be location, but fallback to format O instead because we don't have the data yet
    case 'z':
    case 'zz':
    case 'zzz':
      // formatter = timeZoneGetter(ZoneWidth.ShortGMT);
      throw Error("Unsupported parsing format '" + format + "'");
      break;
    // Timezone GMT long format (GMT+0430)
    case 'OOOO':
    case 'ZZZZ':
    // Should be location, but fallback to format O instead because we don't have the data yet
    case 'zzzz':
      // formatter = timeZoneGetter(ZoneWidth.Long);
      throw Error("Unsupported parsing format '" + format + "'");
      break;
    default:
      // ignored text part
      formatter = DatePart.ignoreText(format);
  }
  if (!formatter) {
    throw Error("Unsupported part '" + format + "'");
  }
  // DATE_PARSERS[format] = formatter;
  return formatter;
}
