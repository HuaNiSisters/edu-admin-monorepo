export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      _SubjectToTutor: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_SubjectToTutor_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["subject_id"]
          },
          {
            foreignKeyName: "_SubjectToTutor_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "Tutor"
            referencedColumns: ["tutor_id"]
          },
        ]
      }
      Attendance: {
        Row: {
          attendance_id: string
          class_id: string
          notes: string | null
          status: Database["public"]["Enums"]["AttendanceStatus"]
          student_id: string
          week: number
        }
        Insert: {
          attendance_id?: string
          class_id: string
          notes?: string | null
          status: Database["public"]["Enums"]["AttendanceStatus"]
          student_id: string
          week: number
        }
        Update: {
          attendance_id?: string
          class_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["AttendanceStatus"]
          student_id?: string
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "Attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "ClassTime"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "Attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["student_id"]
          },
        ]
      }
      ClassTime: {
        Row: {
          active: boolean
          capacity: number | null
          class_id: string
          day_of_week: string
          end_time: string
          offering_id: string
          start_time: string
          tutor_id: string | null
        }
        Insert: {
          active?: boolean
          capacity?: number | null
          class_id?: string
          day_of_week: string
          end_time: string
          offering_id: string
          start_time: string
          tutor_id?: string | null
        }
        Update: {
          active?: boolean
          capacity?: number | null
          class_id?: string
          day_of_week?: string
          end_time?: string
          offering_id?: string
          start_time?: string
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ClassTime_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "SubjectOffering"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "ClassTime_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "Tutor"
            referencedColumns: ["tutor_id"]
          },
        ]
      }
      Enrolment: {
        Row: {
          class_id: string
          enrolment_date: string
          enrolment_id: string
          status: Database["public"]["Enums"]["EnrolmentStatus"]
          student_id: string
          term_id: string
        }
        Insert: {
          class_id: string
          enrolment_date?: string
          enrolment_id?: string
          status?: Database["public"]["Enums"]["EnrolmentStatus"]
          student_id: string
          term_id: string
        }
        Update: {
          class_id?: string
          enrolment_date?: string
          enrolment_id?: string
          status?: Database["public"]["Enums"]["EnrolmentStatus"]
          student_id?: string
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Enrolment_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "ClassTime"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "Enrolment_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "Enrolment_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "Term"
            referencedColumns: ["term_id"]
          },
        ]
      }
      Grade: {
        Row: {
          grade_id: string
          label: string
          school_year_number: number
        }
        Insert: {
          grade_id?: string
          label: string
          school_year_number: number
        }
        Update: {
          grade_id?: string
          label?: string
          school_year_number?: number
        }
        Relationships: []
      }
      Parent: {
        Row: {
          email: string | null
          first_name: string
          last_name: string
          notes: string | null
          parent_id: string
          parent_mobile: string
        }
        Insert: {
          email?: string | null
          first_name: string
          last_name: string
          notes?: string | null
          parent_id?: string
          parent_mobile: string
        }
        Update: {
          email?: string | null
          first_name?: string
          last_name?: string
          notes?: string | null
          parent_id?: string
          parent_mobile?: string
        }
        Relationships: []
      }
      Payment: {
        Row: {
          amount_due: number
          amount_paid: number
          enrolment_id: string
          notes: string | null
          payment_date: string | null
          payment_id: number
          payment_type: Database["public"]["Enums"]["PaymentType"]
          receipt: string
          status: Database["public"]["Enums"]["PaymentStatus"]
        }
        Insert: {
          amount_due: number
          amount_paid: number
          enrolment_id: string
          notes?: string | null
          payment_date?: string | null
          payment_id?: number
          payment_type: Database["public"]["Enums"]["PaymentType"]
          receipt: string
          status: Database["public"]["Enums"]["PaymentStatus"]
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          enrolment_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_id?: number
          payment_type?: Database["public"]["Enums"]["PaymentType"]
          receipt?: string
          status?: Database["public"]["Enums"]["PaymentStatus"]
        }
        Relationships: [
          {
            foreignKeyName: "Payment_enrolment_id_fkey"
            columns: ["enrolment_id"]
            isOneToOne: false
            referencedRelation: "Enrolment"
            referencedColumns: ["enrolment_id"]
          },
        ]
      }
      Student: {
        Row: {
          email: string | null
          first_name: string
          gender: Database["public"]["Enums"]["Gender"] | null
          grade_at_school: number
          last_name: string
          location: Database["public"]["Enums"]["Location"]
          notes: string | null
          preferred_name: string | null
          school: string
          status: Database["public"]["Enums"]["StudentStatus"] | null
          student_id: string
          student_mobile: string
          suburb_of_home: string
        }
        Insert: {
          email?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["Gender"] | null
          grade_at_school: number
          last_name: string
          location: Database["public"]["Enums"]["Location"]
          notes?: string | null
          preferred_name?: string | null
          school: string
          status?: Database["public"]["Enums"]["StudentStatus"] | null
          student_id?: string
          student_mobile: string
          suburb_of_home: string
        }
        Update: {
          email?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["Gender"] | null
          grade_at_school?: number
          last_name?: string
          location?: Database["public"]["Enums"]["Location"]
          notes?: string | null
          preferred_name?: string | null
          school?: string
          status?: Database["public"]["Enums"]["StudentStatus"] | null
          student_id?: string
          student_mobile?: string
          suburb_of_home?: string
        }
        Relationships: []
      }
      StudentParent: {
        Row: {
          parent_id: string
          relationship: string | null
          student_id: string
          student_parent_id: string
        }
        Insert: {
          parent_id: string
          relationship?: string | null
          student_id: string
          student_parent_id?: string
        }
        Update: {
          parent_id?: string
          relationship?: string | null
          student_id?: string
          student_parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "StudentParent_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "Parent"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "StudentParent_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["student_id"]
          },
        ]
      }
      Subject: {
        Row: {
          name: Database["public"]["Enums"]["SubjectType"]
          subject_id: string
        }
        Insert: {
          name: Database["public"]["Enums"]["SubjectType"]
          subject_id?: string
        }
        Update: {
          name?: Database["public"]["Enums"]["SubjectType"]
          subject_id?: string
        }
        Relationships: []
      }
      SubjectOffering: {
        Row: {
          grade_id: string
          location: Database["public"]["Enums"]["Location"]
          offering_id: string
          price_per_term: number
          subject_id: string
        }
        Insert: {
          grade_id: string
          location: Database["public"]["Enums"]["Location"]
          offering_id?: string
          price_per_term: number
          subject_id: string
        }
        Update: {
          grade_id?: string
          location?: Database["public"]["Enums"]["Location"]
          offering_id?: string
          price_per_term?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "SubjectOffering_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "Grade"
            referencedColumns: ["grade_id"]
          },
          {
            foreignKeyName: "SubjectOffering_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["subject_id"]
          },
        ]
      }
      Term: {
        Row: {
          end_date: string
          name: number
          start_date: string
          term_id: string
          year: number
        }
        Insert: {
          end_date: string
          name: number
          start_date: string
          term_id?: string
          year: number
        }
        Update: {
          end_date?: string
          name?: number
          start_date?: string
          term_id?: string
          year?: number
        }
        Relationships: []
      }
      Tutor: {
        Row: {
          email: string | null
          first_name: string
          last_name: string
          phone: string
          tutor_id: string
        }
        Insert: {
          email?: string | null
          first_name: string
          last_name: string
          phone: string
          tutor_id?: string
        }
        Update: {
          email?: string | null
          first_name?: string
          last_name?: string
          phone?: string
          tutor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AttendanceStatus: "present" | "absent"
      EnrolmentStatus:
        | "active"
        | "pending"
        | "completed"
        | "cancelled"
        | "unenrolled"
      Gender: "M" | "F"
      Location: "cabramatta_and_canley_vale" | "parramatta" | "online"
      PaymentStatus: "unpaid" | "partial" | "paid"
      PaymentType: "cash" | "bank_transfer" | "other"
      StudentStatus: "attending" | "alumni"
      SubjectType:
        | "primary"
        | "selective"
        | "oc"
        | "mathematics"
        | "english"
        | "science"
        | "biology"
        | "chemistry"
        | "physics"
        | "economics"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      AttendanceStatus: ["present", "absent"],
      EnrolmentStatus: [
        "active",
        "pending",
        "completed",
        "cancelled",
        "unenrolled",
      ],
      Gender: ["M", "F"],
      Location: ["cabramatta_and_canley_vale", "parramatta", "online"],
      PaymentStatus: ["unpaid", "partial", "paid"],
      PaymentType: ["cash", "bank_transfer", "other"],
      StudentStatus: ["attending", "alumni"],
      SubjectType: [
        "primary",
        "selective",
        "oc",
        "mathematics",
        "english",
        "science",
        "biology",
        "chemistry",
        "physics",
        "economics",
      ],
    },
  },
} as const
