import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, fullName } = req.body;
  if (!userName) {
    throw new ApiError(400, "userName is Must");
  }
  if (!email) {
    throw new ApiError(400, "email is Must");
  }
  if (!password) {
    throw new ApiError(400, "password is Must");
  }
  if (!fullName) {
    throw new ApiError(400, "fullName is Must");
  }

  const exiting_User = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (exiting_User) {
    throw new ApiError(409, "User already Exist");
  }
  const avatar_Localpath = req.files?.avatar[0]?.path;
  console.log(avatar_Localpath);
  const cover_Localpath = req.files?.coverImage[0]?.path;
  console.log(cover_Localpath);

  if (!avatar_Localpath) {
    throw new ApiError(409, "local avatar file is not found");
  }
  const avatar = await uploadOnCloudinary(avatar_Localpath);
  const coverImage = await uploadOnCloudinary(cover_Localpath);
  if (!avatar) {
    throw new ApiError(409, "avtar upload on cloudinary failed");
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while register on db by us");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user registration successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName && !email) {
    throw new ApiError(401, "plz enter UserName or Password");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiError(401, "user Not Exist");
  }
  console.log(user);
  const passwordString = await user.isPasswordCorrect(password);
  if (!passwordString) {
    throw new ApiError(401, "Wrong password");
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  if (!accessToken) {
    throw new ApiError(500, "accessToken Generation failed");
  }
  if (!refreshToken) {
    throw new ApiError(500, "refreshToken Generation failed");
  }

  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  const option = {
    http: true,
    secure: true,
  };
  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        { user: loggedinUser, accessToken, refreshToken },
        "logged in successfully"
      )
    );
});

const logout=asyncHandler(async(req,res)=>{
  const user=req.user
})
export { registerUser, loginUser };
