import passport from "passport";
import { validatePassword, cookieExtractor } from "../utils.js";
import { userModel } from "../model/usersModel.js";
import { cartModel } from "../model/cartModel.js";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as JWTSTrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";


export function initializePassport() {

    passport.use("register", new LocalStrategy(registerConfig, registerCallback));
    passport.use("login", new LocalStrategy(loginConfig, loginCallback));

    if (env.github.GITHUB_AUTH_CLIENT) {
        passport.use("github", new GithubStrategy(githubConfig, githubCallback));
    }

    if (env.google.GOOGLE_AUTH_CLIENT) {
        passport.use("google", new GoogleStrategy(googleConfig, googleCallback));
    }

    passport.use("jwt", new JWTSTrategy(jwtConfig, jwtCallback));
    passport.use("current", new JWTSTrategy(jwtConfig, currentCallback));
}
///////////////// OBJETOS DE CONFIGURACION///////////////////
const loginConfig = {
    usernameField: "email",
    passwordField: "password",
    session: false
}

const registerConfig = {
    ...loginConfig,
    passReqToCallback: true
}

const githubConfig = {
    clientID: env.github.GITHUB_AUTH_CLIENT,
    clientSecret: env.github.GITHUB_AUTH_SECRET,
    callbackURL: "http://localhost:3000/api/sessions/github-login"
}

const googleConfig = {
    clientID: env.google.GOOGLE_AUTH_CLIENT,
    clientSecret: env.google.GOOGLE_AUTH_SECRET,
    callbackURL: "http://localhost:3000/api/sessions/google"
}

const jwtConfig = {
    secretOrKey: env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor])
}

//////////////////////CALLBACKS DE ESTRATEGIAS/////////////////////
async function registerCallback(req, username, password, done) {
    try {
        const user = req.body;
        const userExists = await userModel.findOne({ email: username });
        if (userExists == null) {
            const cart = await cartModel.create({});
            const newUser = await userModel.create({ ...user, cart: cart._id });
            return done(null, newUser);
        } else {
            console.log("usuario ya existente")
            return done(null, false);
        }
    } catch (error) {
        return done(error, false)
    }
}

async function loginCallback(username, password, done) {
    try {
        const user = await userModel.findOne({ email: username });
        if (user == null) {
            return done(null, false)
        }
        else {
            if (validatePassword(password, user.password)) {
                return done(null, user)
            } else {
                throw new Error("credenciales invalidas");
            }
        }
    } catch (error) {
        return done(error, false);
    }
}

async function githubCallback(accesToken, refreshToken, profile, done) {
    const { _json: userData } = profile;
    if (userData.email == null) {
        userData.email = userData.id + "@github.com";
    }
    const user = await userModel.findOne({ email: userData.email });
    if (user) {
        return done(null, user);
    } else {
        const cart = await cartModel.create({});
        const user = await userModel.create({
            first_name: userData.login || userData.name || userData.email.split("@")[0],
            last_name: userData.name || userData.login || userData.email.split("@")[0],
            email: userData.email,
            age: 0,
            password: "01234567890",
            cart: cart._id
        });
        return done(null, user);
    }
}

async function googleCallback(accesToken, refreshToken, profile, done) {
    const { _json: userData } = profile;
    const user = await userModel.findOne({ email: userData.email });
    if (user) {
        return done(null, user);
    } else {
        const cart = await cartModel.create({});
        const user = await userModel.create({
            first_name: userData.given_name || userData.email.split("@")[0],
            last_name: userData.family_name || userData.given_name || userData.email.split("@")[0],
            email: userData.email,
            age: 0,
            password: "01234567890",
            cart: cart._id
        });
        return done(null, user);
    }
}

async function jwtCallback(payload, done) {
    try {
        return done(null, payload);
    } catch (error) {
        return done(error, false);
    }
}

async function currentCallback(payload, done) {
    try {
        return done(null, payload);
    } catch (error) {
        return done(error, false);
    }
}
