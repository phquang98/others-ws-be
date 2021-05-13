// ~ Resource typings
type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
};

type Course = {
  id: string;
  course_title: string;
  date_started: string;
  date_ended: string;
  grade1_interval: string;
  grade2_interval: string;
  grade3_interval: string;
  grade4_interval: string;
  grade5_interval: string;
};

type Course_Participant = {
  id: number;
  course_id: string;
  participant_id: string;
  //* below should be handle conversion by controllers into numeric values
  assignment_1: string;
  assignment_2: string;
  assignment_3: string;
  exam: string;
  grade?: string | number;
};

// ~ Controller typings

// anything besides SELECT SQL will looks like this
type returnQuery = {
  fieldCount: number;
  affectedRows: number;
  insertId: number; // the fucking golden shit right here
  info: string;
  serverStatus: number;
  warningStatus: number;
};

// type ResponseBody =

// type ResponseLocals

// ~ Other typings

// !maybe wrong, based on what appear in the console onky
interface MySQLErr extends Error {
  code?: string;
  errno?: number; // acted as logic gate
  sqlState?: string;
  sqlMessage?: string;
}

enum MySQLErrorNum {
  DUPLICATE_ENTRY = 1062,
  FOREIGN_KEY_NOT_EXISTED = 1452
}

// TODO not ok atm, as what used is an Arr contains props of these 3
type EntryInfo = Participant | Course | Course_Participant;

type Interval = [number, number, number, number, number];

export {
  Participant,
  Course,
  Course_Participant,
  MySQLErr,
  EntryInfo,
  Interval,
  MySQLErrorNum,
  returnQuery
};
