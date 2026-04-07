type SignupLikeData = {
  user: { identities?: unknown[] | null } | null;
  session: object | null;
};

export const isExistingUnconfirmedSignup = (data: SignupLikeData): boolean => {
  if (!data.user || data.session) {
    return false;
  }

  const identities = data.user.identities;
  return Array.isArray(identities) && identities.length === 0;
};
