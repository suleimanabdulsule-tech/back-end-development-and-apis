export function authorizeModification(req, res, next) {
  const user = req.user;
  const isParent = user?.role === "parent";
  const isChildEditingOwnList =
    user?.role === "child" && String(user.id) === String(req.params.userId);

  if (isParent || isChildEditingOwnList) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
}
