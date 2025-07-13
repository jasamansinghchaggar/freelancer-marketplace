import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateGoogleUser } from "../services/user.service";
import { User } from "../models/user.model";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
},
async (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void
) => {
    try {
        const { user, isFirstTime } = await findOrCreateGoogleUser(profile);
        (user as any).isFirstTime = isFirstTime;
        return done(null, user);
    } catch (err) {
        return done(err, undefined);
    }
}
));

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, undefined);
    }
});
