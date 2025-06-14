import { User } from "next-auth";

import { getServerSession } from "next-auth";

import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export const session = async ({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Promise<Session> => {
  if (token?.id) {
    session.user.id = token.id;
  }
  return session;
};

export const getUserSession = async (): Promise<User> => {
  const authUserSession = await getServerSession({
    callbacks: {
      session,
    },
  });
  if (!authUserSession) throw new Error("unauthorized");
  return authUserSession.user;
};
