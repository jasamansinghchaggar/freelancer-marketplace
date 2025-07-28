import { User, IUser } from "../models/user.model";

export const getUserById = async (userId: string): Promise<IUser | null> => {
  return await User.findById(userId);
};

export const getUserByIdWithPassword = async (userId: string): Promise<IUser | null> => {
  return await User.findById(userId).select("+password");
};

export const updateUserProfile = async (
  userId: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

export const findOrCreateGoogleUser = async (
  profile: any
): Promise<{ user: IUser; isFirstTime: boolean }> => {
  const email = profile.emails?.[0].value;
  
  // First check if user exists with this Google ID
  let user = await User.findOne({ googleId: profile.id });
  let isFirstTime = false;
  
  if (!user && email) {
    // If no user with Google ID, check if user exists with this email
    user = await User.findOne({ email });
    
    if (user) {
      // User exists with email but no Google ID - link the Google account
      user.googleId = profile.id;
      await user.save();
      isFirstTime = false;
    } else {
      // Create new user
      try {
        user = await User.create({
          googleId: profile.id,
          email,
          name: profile.displayName,
          role: "guest",
          profileCompleted: false,
        });
        isFirstTime = true;
      } catch (error: any) {
        // Handle duplicate email error
        if (error.code === 11000 && error.keyPattern?.email) {
          // Find the existing user and link Google account
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            await user.save();
            isFirstTime = false;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }
  }
  
  if (!user) {
    throw new Error('Failed to find or create user');
  }
  
  return { user, isFirstTime };
};

export const findUserByEmail = async (email: string): Promise<any> => {
  const user = await User.findOne({ email }).select("+password");
  return user;
};

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const user = new User(userData);
  await user.save();
  return user;
};