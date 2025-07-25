import { User, IUser } from "../models/user.model";

export const getUserById = async (userId: string): Promise<IUser | null> => {
    return await User.findById(userId);
};

export const updateUserProfile = async (userId: string, updateData: Partial<IUser>): Promise<IUser | null> => {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
};
export const findOrCreateGoogleUser = async (profile: any): Promise<{ user: IUser, isFirstTime: boolean }> => {
    let user = await User.findOne({ googleId: profile.id });
    let isFirstTime = false;
    if (!user) {
        user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0].value,
            name: profile.displayName,
            role: "guest",
            profileCompleted: false,
        });
        isFirstTime = true;
    }
    return { user, isFirstTime };
};

export const findUserByEmail = async (email: string): Promise<any> => {
    const user = await User.findOne({ email }).select("+password");
    return user;
}

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
    const user = new User(userData);
    await user.save();
    return user;
}