export const enum SMSAction {
  Owings = "Owings",
}

// export interface IOwingsSMSContext {
//   student: {
//     first_name: string;
//     last_name: string;
//     email: string;
//   };
//   parent: {
//     first_name: string;
//     last_name: string;
//     email: string;
//   };
// }

export const actionToSampleContext = {
  [SMSAction.Owings]: {
    student: {
      full_name: "John Doe",
      first_name: "John",
      last_name: "Doe",
      mobile: "0412 345 678",
    },
    parent: {
      full_name: "Jane Doe",
      phone: "0412 345 679",
    },
    term: {
      week_number: 5,
      number: 2,
      year: 2026,
      label: "Term 2 2026",
      n_weeks: 8,
      start_date: "22nd March",
      end_date: "16th May",
    },
    invoice: {
      amount_due: "$450",
    },
    subject: {
      name: "Mathematics",
      grade: 7,
      location: "Parramatta",
    },
    class: {
      day_of_week: "Monday",
      start_time: "4:00 pm",
      tutor: "Alex Smith",
    },
  },
};
