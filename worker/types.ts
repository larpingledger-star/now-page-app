export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
}

export type Variables = {
  userId: string;
  userRole: string;
};
