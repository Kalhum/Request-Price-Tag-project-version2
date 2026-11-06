import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      user_group: string;
      username: string;
      is_expire?: boolean;
      remaining_days?: number;
      lastupdate?: string;
      expiration_date?: string;
      url_change_password?: string;
      url_site_name?: string;
      branchGroup?: string;
      session_id?: string;
      credential?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    user_group?: string;
    username?: string;
    is_expire?: boolean;
    remaining_days?: number;
    lastupdate?: string;
    expiration_date?: string;
    url_change_password?: string;
    url_site_name?: string;
    branchGroup?: string;
    session_id?: string;
    credential?: string;
  }
}
