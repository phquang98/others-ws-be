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
  used_assignments: number;
  max_assignment_point: string;
  grade1_interval: number;
  grade2_interval: number;
  grade3_interval: number;
  grade4_interval: number;
  grade5_interval: number;
};

type Course_Participant = {
  id: number;
  course_id: string;
  participant_id: string;
  //* below should be handle conversion by controllers into numeric values
  grade?: string | number;
  total?: number;
  exam_point?: number;
  exam: number;
  assignment_point?: number;
  assignment_1?: number;
  assignment_2?: number;
  assignment_3?: number;
  assignment_4?: number;
  assignment_5?: number;
  assignment_6?: number;
  assignment_7?: number;
  assignment_8?: number;
  assignment_9?: number;
  assignment_10?: number;
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
