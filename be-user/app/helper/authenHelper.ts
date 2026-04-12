import bcrypt from "bcrypt";
import { getUser,createUser } from "@/app/lib/user";
import jwt,{ JwtPayload } from "jsonwebtoken";
import { createVerifytoken,getTokenByUserId,updateVerifyTokenByTokenId,revokeUserTokens} from "../lib/refresh_token";
import { findSocial,createSocial } from "../lib/social_account";
import { error } from "node:console";
import { users } from "../lib/defination";
import { NextResponse } from "next/server";
import { activateUser } from "@/app/lib/user";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; 
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "supersecret";


export async function authenticateUser(email: string, password: string) {
  const user = await getUser(email);
  if (!user || !user.password_hash) return null;
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;

  return await sanitizeUser(user)
}

export async function createToken(
  user: { user_id: string; email: string; name: string },
  deviceInfo: string = "unknown",
  ipAddress: string = "0.0.0.0"
) {

  if (!user.user_id) throw new Error("User ID is required");
  //tao access token
  const accessToken = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
  //Ngày hết hạn
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace("T", " ");
  //tao refresh Token
  const refreshToken = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  //Tạo trong refresh Token DB
  const result = await createVerifytoken(user.user_id, refreshTokenHash, deviceInfo, ipAddress, expiresAtStr);

  if (!result) return null;

  return {
accessToken,refreshToken
  };
}
  
export async function verifyToken(token: string) {
  try {
    let decode = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decode;
  } catch (err) {
    return null;
  }
}
export async function GoogleLogin(code: string) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const user = await userRes.json();
  const { email, name, id,picture} = user;
  let social = await findSocial("google", id);
  let userId;

  if (social) {
    userId = social.user_id;
    
  } else {
    let existingUser = await getUser(email);
    if (!existingUser) {
      const newUser = await createUser(email,null, name,picture);
        if (!newUser) {
    throw new Error("Create user failed");
  }
      userId = newUser.user_id;
    } else {
      userId = existingUser.user_id;
    }
      await activateUser(userId);

    await createSocial(userId, "google", id,email);
  }
 const tokenDataGG = await createToken({
    user_id: userId,
    email,
    name,
  });

  if (!tokenDataGG) {
    throw new Error("Create token failed");
  }
  const {accessToken,refreshToken}= tokenDataGG
  return {accessToken,refreshToken,user}; 
}


export async function FacebookLogin(code: string) {
  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        code,
      })
  );

  const tokenData = await tokenRes.json();
  const access_token = tokenData.access_token;
  const userRes = await fetch(
    `https://graph.facebook.com/me?` +
      new URLSearchParams({
        fields: "id,name,email,picture",
        access_token,
      })
  );

  const user = await userRes.json();
  const { id, name, email,picture } = user;

  let social = await findSocial("facebook", id);
  let userId;

  if (social) {
    userId = social.user_id;
  } else {
    let existingUser = await getUser(email);
    if (!existingUser) {
      const newUser = await createUser(email, null, name,picture?.data?.url);
      if (!newUser) throw new Error("Create user failed");
      userId = newUser.user_id;
    } else {
      userId = existingUser.user_id;
    }
      await activateUser(userId);

    await createSocial(userId, "facebook", id,email);
  }

  const tokenDataFB = await createToken({ user_id: userId, email, name });
  if (!tokenDataFB) throw new Error("Create token failed");

  const { accessToken, refreshToken } = tokenDataFB;
  return { accessToken, refreshToken, user };
}
export async function deleteToken(refreshToken:string) {
  if(!refreshToken)
    throw error("Failed to delete token")
  let payload: any;
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET); 
  } catch (err) {
    throw new Error("Refresh token expired or invalid");
  }
  
  return await revokeUserTokens(payload.user_id)
}

export function refreshAccessToken(oldAccessToken: string) {
  let   payload = jwt.verify(oldAccessToken, JWT_SECRET) as JwtPayload;

  const accessToken = jwt.sign(
    { user_id: payload.user_id, email: payload.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  return accessToken;
}
export async function refreshRefreshToken(oldRefreshToken: string) {
  let payload: any;
  try {
    payload = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET); 
  } catch (err) {
    throw new Error("Refresh token expired or invalid");
  }

  const userId = payload.user_id;

  let session;
  try {
    const result = await getTokenByUserId(userId); 
    session = result; 
    if (!session) throw new Error("No refresh token found");
  } catch (err) {
    console.error(err);
    throw new Error("No refresh token found");
  }

  const match = await bcrypt.compare(oldRefreshToken, session.token_hash);
  if (!match || session.revoked_at) {
    throw new Error("Refresh token invalid or revoked");
  }

  await updateVerifyTokenByTokenId(session.token_id);

  const newRefreshToken = jwt.sign(
    { user_id: session.user_id, email: payload.email },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const tokenHash = await bcrypt.hash(newRefreshToken, 10);

  await createVerifytoken(
    session.user_id,
    tokenHash,
    session.device_info,
    session.ip_address,
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")
  );

  const accessToken = jwt.sign(
    { user_id: session.user_id, email: payload.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    refreshToken: newRefreshToken,
    accessToken,
  };
}
export async function sanitizeUser(user: users) {
  const { password_hash, wallet_address, ...safeUser } = user;
  return safeUser;
}
export async function setCookies(response:NextResponse,accessToken:string,refreshToken:string) {
  
    response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: false, // nên true nếu HTTPS
    sameSite: "strict",
    maxAge: 60 * 60 // 1 giờ
  });
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 
  });
}