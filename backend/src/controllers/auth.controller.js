export const verifyToken = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        user_metadata: req.user.user_metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};
