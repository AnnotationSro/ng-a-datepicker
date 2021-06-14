```
ng new ng-a-date-picker --defaults=true --inlineStyle=true --package-manager=yarn --prefix=a-date --skipTests=true --style=scss --create-application=false
```

### Local development

Option 1 - in this project (runs ng-datepicker-showcase app)
```
yarn start 
```

Option 2 - link this project to any other
```
yarn build --watch
cd dist/ng-datepicker
yarn link
cd ../path/to/any/other/project
yarn link "@annotation/ng-datepicker"

## serve your own project
yarn start 

## remove link 
yarn unlink "@annotation/ng-datepicker"
yarn install --force
```

### TypeScript
date for TypeScript can be defined as:
 - Date
 - string
 - number


### Backend API can work with different formats:
- for *time only* - without timestamp:
  - ISO format (default HH:MM:SS.SSS)   (recommended format)     
    example: 14:45:55.1234
  - number as timestamp: \
    example: 1610149678.707513000
  - array of values,\
    example:  [ 0, 45, 55, 794228000 ] 

- for *time only* - with timestamp:
    - ISO format (default HH:MM:SS.SSS+ZZ)   (recommended format)     
      example: 14:45:55.1234+01:00
    - number as timestamp (zone is lost) : \
      example: 1610149678.707513000
    - array of values,\
      example:  [ 0, 45, 55, 794228000, "+01:00"  ]

- for *date only*:
    - ISO format (default YYYY-MM-DD)   (recommended format)     
      example: 2021-01-19
    - number as timestamp: \
      example: 1610149678
    - array of values,\
      example:  [ 2021, 1, 19 ]

- for *datetime* - without timezone:
    - ISO format (default YYYY-MM-DD'T'HH:MM:SS.SSS)   (recommended format)     
      example: 2021-01-19T00:45:55.796722
    - number as timestamp: \
      example: 1610149678.12345
    - array of values,\
      example:  [ 2021, 1, 19, 0, 45, 55, 796722000 ]

- for *datetime* - with timezone:
    - ISO format (default YYYY-MM-DD'T'HH:MM:SS.SSS+ZZ)   (recommended format)     
      example: 2021-01-19T00:45:55.796722+01:00
    - number as timestamp (timezone info is lost): \
      example: 1610149678.12345
    - array of values,\
      example:  [ 2021, 1, 19, 0, 45, 55, 796722000, "+01:00" ]




Dates in JSON:
  JSON A): Jackson with mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
  JSON B): Jackson with mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, true)

| Server type | JSON A | JSON B | 
|---|---|---|
| java.time.LocalTime | "00:45:55.7942" | [ 0, 45, 55, 794228000 ]
| java.time.LocalDate | "2021-01-19" | [ 2021, 1, 19 ]
| java.time.LocalDateTime | "2021-01-19T00:45:55.796722" | [ 2021, 1, 19, 0, 45, 55, 796722000 ]
| java.time.ZonedDateTime | "2021-01-09T00:45:55.796847+01:00" | 1610149678.706564000 
| java.time.OffsetDateTime | "2021-01-09T00:45:55.797302+01:00" | 1610149678.707017000 
| java.time.OffsetTime | "00:45:55.797696+01:00" | [ 0, 47, 58, 707449000, "+01:00" ] 
| java.time.Instant | "2021-01-08T23:45:55.797758Z" | 1610149678.707513000
| java.util.Date | "2021-01-08T23:45:55.797+0000" | 1610149678707,
| java.sql.Date | "2021-01-09" | 1610149678708,
| java.sql.Timestamp | "2021-01-08T23:45:55.799+0000" | 1610149678708



```json
{
"lt" : "00:45:55.7942",
"lt" : [ 0, 47, 58, 703928000 ],

"ld" : "2021-01-09",
"ld" : [ 2021, 1, 9 ],

"ldt" : "2021-01-09T00:45:55.796722",
"ldt" : [ 2021, 1, 9, 0, 47, 58, 706432000 ],

"zdt" : "2021-01-09T00:45:55.796847+01:00",
"zdt" : 1610149678.706564000,

"offdt" : "2021-01-09T00:45:55.797302+01:00",
"offdt" : 1610149678.707017000,

"offt" : "00:45:55.797696+01:00",
"offt" : [ 0, 47, 58, 707449000, "+01:00" ],

"dinstance" : "2021-01-08T23:45:55.797758Z",
"dinstance" : 1610149678.707513000,

"djava" : "2021-01-08T23:45:55.797+0000",
"djava" : 1610149678707,

"dsql" : "2021-01-09",
"dsql" : 1610149678708,

"dtimestamp" : "2021-01-08T23:45:55.799+0000",
"dtimestamp" : 1610149678708
}
```
