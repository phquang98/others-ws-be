# Testing MySQL with TS

Practice example using TS + NodeJS + Express + MySQL

## How to run

- create 3 tables from MYSQL Workbench, check below
- `npm run build`: build the whole project from TS -> JS
- `npm start`: runs the server with nodemon
- change the database settings by
  - creat

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

## Fake SQL

```SQL
CREATE TABLE participant (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  dob DATE NOT NULL,
  email VARCHAR(254) NOT NULL
);

CREATE TABLE course (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  course_title VARCHAR(50) NOT NULL,
  date_started DATE,
  date_ended DATE,
  used_assignments INT NOT NULL,
  max_assignment_point INT NOT NULL,
  grade1_interval INT NOT NULL,
  grade2_interval INT NOT NULL,
  grade3_interval INT NOT NULL,
  grade4_interval INT NOT NULL,
  grade5_interval INT NOT NULL
);

CREATE TABLE course_participant (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  course_id VARCHAR(50) NOT NULL,
  participant_id VARCHAR(50) NOT NULL,
  assignment_1 INT DEFAULT 0,
  assignment_2 INT DEFAULT 0,
  assignment_3 INT DEFAULT 0,
  assignment_4 INT DEFAULT 0,
  assignment_5 INT DEFAULT 0,
  assignment_6 INT DEFAULT 0,
  assignment_7 INT DEFAULT 0,
  assignment_8 INT DEFAULT 0,
  assignment_9 INT DEFAULT 0,
  assignment_10 INT DEFAULT 0,
  exam INT DEFAULT 0,
  grade INT DEFAULT 0,
  FOREIGN KEY (participant_id) REFERENCES participant(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);
```
