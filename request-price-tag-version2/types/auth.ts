export type Auth = {
  user_id: string;
  user_password: string;
  user_group: string;
  user_email: string;
  flag: string;
  user_name: string;
  user_name2: string;
  company: string;
};

/** ข้อมูลรับเข้าและผลยืนยันตัวตนที่ใช้ระหว่างหน้า Login กับ API */
export type LoginInput = {
  username: string;
  password: string;
};

export type LoginUser = {
  id: string;
  username: string;
  name: string;
  userGroup: string;
};
