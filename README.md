# Testing MySQL with TS

Practice example using TS + NodeJS + Express + MySQL

## How to run

- `npm run build`: build the whole project from TS -> JS
- `npm start`: runs the server with nodemon

### App Structure

```Markdown
├── src
│ ├── controllers    // handle what happened when FE fire HTTP action to specific endpoints
│ ├── helpers        // handle mysql connection, loggings
│ ├── middlewares    // contains global middlewares used by the app
│ ├── models         // contains Resource types
│ ├── routes
└── app.ts
```

## Notes

**Dataflow**

- mysql2 -> `[[BinaryRow {{resource1},{resource2},...}][someDataAboutCols]]`
- extract the 1st arr ele only -> `const [rows, fields] = queryRes;`
- spit back to FE with JSON only -> `ra-data-json-server` transforms the rest
- `ra-data-json-server` wraps those based on RA Data Response Format -> feeds to RA Core -> render to FE
  - [here](https://marmelab.com/react-admin/DataProviders.html#response-format)

**Controllers**

- `getList`:
  - called when FE first loaded
  - called each time search
  - called each time sort
- `getOne`:

- custom loggings:
  - NAMESPACE: 2nd [], where the error code lies in what folder
- use `mysql2` instead of `mysql` -> some key points:
  - destruct after `query()`, only cares row data
  - `query()` dont have callback args
- Postman POST HTTP remember Header Content-Type: application/json
- some problems with date format with Excel and xlxs
  - <https://github.com/SheetJS/sheetjs/issues/718>
  - <https://docs.sheetjs.com/> -> search `sheet_to_json`
  - in Excel, date is tested with English(Fin) locale, format yyyy-mm-dd (to extract `w` props)
  - without opts -> `{ t: 'n', v: 44276, w: '3/21/21' }`
    - type number, v is raw value from Excel, w is formatted text
  - `{cellDates: true;}` -> `{ t: 'd', v: 2021-03-22T21:59:56.000Z, w: '2021-03-23' }`
    - type date, v is raw value, w is formmated text
    - `{raw: false}` -> use `w` instead of `v`
- dwl `ra-data-simple-rest` to know how to write a Data Provider for RA, del later
- to comply with RA `getOne`, hacky by take only the first `BinaryRow` from `mysql`, then hack it with JSON to pure `Array<TResource>` so that return result is only an obj
  - see <https://github.com/mysqljs/mysql/issues/1899>
- when reading the doc, though BE must returns sth like `Promise<Error>` with prop `message`, but for some reason, return only status code out of 200-300 range and `message` prop is good enough for ra-data-json-server can detect it

- solving User story Evaluate problem
  - create a btn from basic RA btn
  - using RR to redirect to the point page
  - copy code from RA demo -> build query-string -> now FE can app customFilter prop to BE
  - BE now handle that custom props -> show

## Fake SQL

- default date format is YYYY-MM-DD

```SQL
CREATE TABLE participant (
  id INT NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  participant_id VARCHAR(50) NOT NULL PRIMARY KEY,
  dob DATE NOT NULL,
  email VARCHAR(254) NOT NULL
);

CREATE TABLE course (
  id INT NOT NULL UNIQUE,
  course_id VARCHAR(50) NOT NULL PRIMARY KEY,
  course_title VARCHAR(50) NOT NULL,
  course_description TEXT,
  date_started DATE NOT NULL,
  date_ended DATE NOT NULL
);

CREATE TABLE course_participant (
  id INT NOT NULL UNIQUE,
  course_id VARCHAR(50) NOT NULL,
  participant_id VARCHAR(50) NOT NULL,
  assignment_1 INT,
  assignment_2 INT,
  assignment_3 INT,
  exam INT,
  final_grades DECIMAL(5,3),
  FOREIGN KEY (participant_id) REFERENCES participant(participant_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE
);

INSERT INTO participant (id, first_name, last_name, participant_id, dob, email) VALUES
(1,"Cody","Arnold", "e258693","1983-11-15","codya@gmail.com"),
(2,"Peter","Harrison", "e094925","1975-07-09","peterh@gmail.com"),
(3,"Elisie","Barton", "e461580","1999-03-12","ebarton@gmail.com");

INSERT INTO course (id, course_id, course_title, course_description, date_started, date_ended) VALUES
(1,"CS100","Web Services", "This teach web development.","2021-12-01","2021-12-31");

INSERT INTO course_participant (id, course_id, participant_id, assignment_1, assignment_2, assignment_3, exam, final_grades) VALUES
(1,"CS100","e258693", 7,3, 5,  6, 9.456),
(1,"CS100","e094925", 2,6, 6,  4, 5.52);
```

## Resources

- [Tutorial 1](https://www.youtube.com/watch?v=vyz47fUXcxU&t=0s)
  - build up an API
  - create a custom logging fncs
- [Tutorial 2](https://www.youtube.com/watch?v=eTRSl1As83A&t=65s)
- xlsx
  - <https://www.youtube.com/watch?v=tKz_ryychBY>

## Draft

- what happend if query OK, but dont return anything
  - only handle logic based on query legit or not
  - -> can return msg says Your query ok, but no res found
- crud: when delete, validate query params first (e.g if id dont existed in db, msg back)
  - backend should only focus only performing query execution
- atm, mysql when delete entry, increment id not desirable outcome
  - IRL: 1,2,3 -> delete 3 -> 1,2,4,5
  - desired: 1,2,3 -> delete 3 -> 1,2,3,4
- should try to update to pooling instead of single connection
- ra use `id` prop to do everything -> force BE must implement `id` prop to handle HTTP logic

## How the queryRes looks like

```javascript
[
    [
        BinaryRow {
            id: 1,
            first_name: 'Cody',
            last_name: 'Arnold',
            participant_id: 'e258693',
            dob: 1983 - 11 - 12 T21: 00: 00.000 Z,
            email: 'codya@gmail.com'
        }
    ],
    [
        ColumnDefinition {
            _buf: < Buffer 01 00 00 01 06 3 b 00 00 02 03 64 65 66 0b 64 62 5 f 74 65 73 74 5 f 78 6 f 61 0b 70 61 72 74 69 63 69 70 61 6 e 74 0b 70 61 72 74 69 63 69 70 61 6 e 74 02...464 more bytes > ,
            _clientEncoding: 'utf8',
            _catalogLength: 3,
            _catalogStart: 10,
            _schemaLength: 11,
            _schemaStart: 14,
            _tableLength: 11,
            _tableStart: 26,
            _orgTableLength: 11,
            _orgTableStart: 38,
            _orgNameLength: 2,
            _orgNameStart: 53,
            characterSet: 63,
            encoding: 'binary',
            name: 'id',
            columnLength: 11,
            columnType: 3,
            flags: 20485,
            decimals: 0
        },
        ColumnDefinition {
            _buf: < Buffer 01 00 00 01 06 3 b 00 00 02 03 64 65 66 0b 64 62 5 f 74 65 73 74 5 f 78 6 f 61 0b 70 61 72 74 69 63 69 70 61 6 e 74 0b 70 61 72 74 69 63 69 70 61 6 e 74 02...464 more bytes > ,
            _clientEncoding: 'utf8',
            _catalogLength: 3,
            _catalogStart: 73,
            _schemaLength: 11,
            _schemaStart: 77,
            _tableLength: 11,
            _tableStart: 89,
            _orgTableLength: 11,
            _orgTableStart: 101,
            _orgNameLength: 10,
            _orgNameStart: 124,
            characterSet: 224,
            encoding: 'utf8',
            name: 'first_name',
            columnLength: 200,
            columnType: 253,
            flags: 4097,
            decimals: 0
        },
        ColumnDefinition {
            _buf: < Buffer 01 00 00 01 06 3 b 00 00 02 03 64 65 66 0b 64 62 5 f 74 65 73 74 5 f 78 6 f 61 0b 70 61 72 74 69 63 69 70 61 6 e 74 0b 70 61 72 74 69 63 69 70 61 6 e 74 02...464 more bytes > ,
            _clientEncoding: 'utf8',
            _catalogLength: 3,
            _catalogStart: 152,
            _schemaLength: 11,
            _schemaStart: 156,
            _tableLength: 11,
            _tableStart: 168,
            _orgTableLength: 11,
            _orgTableStart: 180,
            _orgNameLength: 9,
            _orgNameStart: 202,
            characterSet: 224,
            encoding: 'utf8',
            name: 'last_name',
            columnLength: 200,
            columnType: 253,
            flags: 4097,
            decimals: 0
        },
        ColumnDefinition {
            _buf: < Buffer 01 00 00 01 06 3 b 00 00 02 03 64 65 66 0b 64 62 5 f 74 65 73 74 5 f 78 6 f 61 0b 70 61 72 74 69 63 69 70 61 6 e 74 0b 70 61 72 74 69 63 69 70 61 6 e 74 02...464 more bytes > ,
            _clientEncoding: 'utf8',
            _catalogLength: 3,
            _catalogStart: 229,
            _schemaLength: 11,
            _schemaStart: 233,
            _tableLength: 11,
            _tableStart: 245,
            _orgTableLength: 11,
            _orgTableStart: 257,
            _orgNameLength: 14,
            _orgNameStart: 284,
            characterSet: 224,
            encoding: 'utf8',
            name: 'participant_id',
            columnLength: 200,
            columnType: 253,
            flags: 20483,
            decimals: 0
        },
        ColumnDefinition {
            _buf: < Buffer 01 00 00 01 06 3 b 00 00 02 03 64 65 66 0b 64 62 5 f 74 65 73 74 5 f 78 6 f 61 0b 70 61 72 74 69 63 69 70 61 6 e 74 0b 70 61 72 74 69 63 69 70 61 6 e 74 02...464 more bytes > ,
            _clientEncoding: 'utf8',
            _catalogLength: 3,
            _catalogStart: 316,
            _schemaLength: 11,
            _schemaStart: 320,
            _tableLength: 11,
            _tableStart: 332,
            _orgTableLength: 11,
            _orgTableStart: 344,
            _orgNameLength: 3,
            _orgNameStart: 360,
            characterSet: 63,
            encoding: 'binary',
            name: 'dob',
            columnLength: 10,
            columnType: 10,
            flags: 4225,
            decimals: 0
        },
        ColumnDefinition {
            _buf: < Buffer 01 00 00 01 06 3 b 00 00 02 03 64 65 66 0b 64 62 5 f 74 65 73 74 5 f 78 6 f 61 0b 70 61 72 74 69 63 69 70 61 6 e 74 0b 70 61 72 74 69 63 69 70 61 6 e 74 02...464 more bytes > ,
            _clientEncoding: 'utf8',
            _catalogLength: 3,
            _catalogStart: 381,
            _schemaLength: 11,
            _schemaStart: 385,
            _tableLength: 11,
            _tableStart: 397,
            _orgTableLength: 11,
            _orgTableStart: 409,
            _orgNameLength: 5,
            _orgNameStart: 427,
            characterSet: 224,
            encoding: 'utf8',
            name: 'email',
            columnLength: 1016,
            columnType: 253,
            flags: 4097,
            decimals: 0
        }
    ]
]
```
