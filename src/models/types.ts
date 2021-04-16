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
  assignment1?: number;
  assignment2?: number;
  assignment3?: number;
  exam?: number;
  final_grades?: number;
};

export { Participant, Course, Course_Participant };
