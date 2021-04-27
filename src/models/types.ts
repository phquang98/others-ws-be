type Participant = {
  id: number;
  first_name: string;
  last_name: string;
  participant_id: string;
  dob: string;
  email: string;
};

type Course = {
  id: number;
  course_id: string;
  course_title: string;
  course_description?: string;
  date_started: string;
  date_ended: string;
};

type Course_Participant = {
  id: number;
  course_id: string;
  participant_id: string;
  //* below should be handle conversion by controllers into numeric values
  assignment1: string;
  assignment2: string;
  assignment3: string;
  exam: string;
  final_grades?: string;
};

//! maybe wrong, based on what appear in the console onky
// use errno as the logic gate
interface MySQLErr extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

// used by mysqlErrorHdlr() only
//TODO not ok atm, as what used is an Arr contains props of these 3
type EntryInfo = Participant | Course | Course_Participant;

type Interval = [number, number, number, number, number];

export { Participant, Course, Course_Participant, MySQLErr, EntryInfo, Interval };
