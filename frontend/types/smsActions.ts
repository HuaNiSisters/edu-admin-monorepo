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
    },
    // parent: {
    //   full_name: "Jane Doe",
    // },
    term: {
        week_number: 5,
        number: 2,
        n_weeks: 8,
        start_date: "22nd March",
        end_date: "16th May",
    },
    invoice: {
        amount_due: "$450",
    },
    subject: {
        name: "Mathematics",
    }
  },
};
