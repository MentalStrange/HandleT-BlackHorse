import Supplier from "../models/supplierSchema";

export const restrict = (roles) => async (req, res, next) => {
  const userId = req._id;
  try {
    let user;
    // Find user based on role
    if (req.role === "gomla") {
      user = await Supplier.findById(userId);
    } else if (req.role === "nosGomla") {
      user = await Supplier.findById(userId);
    } else if (req.role === "gomlaGomla") {
      user = await Supplier.findById(userId);
    } else if (req.role === "blackHorse") {
      user = await Customer.findById(userId);
    } else if (req.role === "company") {
      user = await Supplier.findById(userId);
    } else if (req.role === "customer") {
      user = await Customer.findById(userId);
    }
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }
    // Check if the user has the required role
    if (!roles.includes(user.role)) {
      return res
        .status(401)
        .json({ success: false, message: "You are not authorized" });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
