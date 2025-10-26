import { requireAuth, clerkClient } from "@clerk/express";

export const protectAdmin = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) return res.status(401).json({ success: false, message: "Not authenticated." });

      const user = await clerkClient.users.getUser(userId);
      const role = user?.privateMetadata?.role;
      if (role !== "admin") return res.status(403).json({ success: false, message: "Admins only." });

      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ success: false, message: "Authentication failed." });
    }
  },
];
